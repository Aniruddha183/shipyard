"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface LeaderUser {
  _id: string;
  username: string;
  streak: number;
  totalPoints: number;
  projectCount?: number;
  avatar?: string;
}

interface LeaderEntry {
  rank: number;
  user: LeaderUser;
  points: string;
}

const MEDAL_COLORS: Record<number, string> = {
  1: "text-[#FFD700]",
  2: "text-[#C0C0C0]",
  3: "text-[#CD7F32]",
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard?limit=100")
      .then(r => r.json())
      .then((data: LeaderUser[]) => {
        if (Array.isArray(data)) {
          setEntries(data.map((u, i) => ({
            rank: i + 1,
            user: u,
            points: u.totalPoints?.toLocaleString() ?? "0",
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const top3 = entries.slice(0, 3);
  const rest  = entries.slice(3);

  return (
    <div className="max-w-[900px] mx-auto space-y-10">
      {/* ── Hero ── */}
      <div className="relative text-center border border-[#c9a84c]/20 bg-[#0e1018] p-10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c9a84c]/60 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,168,76,0.06)_0%,_transparent_70%)] pointer-events-none" />

        <p className="text-[#c9a84c] text-[10px] tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "var(--font-cinzel)" }}>
          The Shipyard
        </p>
        <h1 className="text-[#f0ead6] text-4xl sm:text-6xl font-light mb-4" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>
          Grand Register
        </h1>
        <p className="text-[#8a8a9a] text-sm max-w-md mx-auto leading-relaxed">
          The definitive ranking of the Shipyard&apos;s most prolific builders. Points accumulate through completed tasks and shipped vessels.
        </p>
        {!loading && (
          <p className="text-[#c9a84c]/50 text-[10px] tracking-widest uppercase mt-4" style={{ fontFamily: "var(--font-cinzel)" }}>
            {entries.length} Builders Registered
          </p>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 border border-[#c9a84c]/8 bg-[#0e1018] animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Podium (Top 3) ── */}
      {!loading && top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Re-order: 2nd, 1st, 3rd for classic podium look */}
          {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry) => {
            if (!entry) return null;
            const isFirst = entry.rank === 1;
            return (
              <Link
                key={entry.rank}
                href={`/builder/${entry.user._id}`}
                className={`block border bg-[#0e1018] p-6 text-center transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(201,168,76,0.15)] ${
                  isFirst
                    ? "border-[#c9a84c]/60 shadow-[0_0_20px_rgba(201,168,76,0.1)]"
                    : "border-[#c9a84c]/20 hover:border-[#c9a84c]/40"
                }`}
              >
                <div className={`text-3xl font-mono mb-3 ${MEDAL_COLORS[entry.rank] || "text-[#8a8a9a]"}`}>
                  {entry.rank === 1 ? "⬡ 01" : entry.rank === 2 ? "⬡ 02" : "⬡ 03"}
                </div>

                <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center border text-xl font-mono overflow-hidden ${
                  isFirst ? "border-[#c9a84c]/60 bg-[#c9a84c]/10 text-[#c9a84c]" : "border-[#c9a84c]/20 bg-[#1a1c28] text-[#8a8a9a]"
                }`}>
                  {entry.user.avatar ? (
                    <img src={entry.user.avatar} alt={entry.user.username} className="w-full h-full object-cover rounded-full p-1" />
                  ) : (
                    entry.user.username.charAt(0).toUpperCase()
                  )}
                </div>

                <p className={`text-sm font-medium truncate mb-1 ${isFirst ? "text-[#c9a84c]" : "text-[#f0ead6]"}`} style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontSize: "1.1rem" }}>
                  @{entry.user.username}
                </p>

                <p className={`text-lg font-mono mb-2 ${isFirst ? "text-[#f0ead6]" : "text-[#c9a84c]"}`}>{entry.points}</p>

                <div className="flex items-center justify-center gap-3 text-[8px] tracking-widest uppercase text-[#8a8a9a]" style={{ fontFamily: "var(--font-cinzel)" }}>
                  {entry.user.streak > 0 && (
                    <span className="flex items-center gap-1 text-[#c9a84c]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 2.4 5.6a8.3 8.3 0 11-14.3-6.4c1.5 1.5 3 2.5 3 4.5 0 .5.3 1 1.4 1.3z" /></svg>
                      {entry.user.streak}
                    </span>
                  )}
                  <span>{entry.user.projectCount ?? 0} projects</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Full Table (rank 4+) ── */}
      {!loading && rest.length > 0 && (
        <div className="border border-[#c9a84c]/12 bg-[#0e1018] overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[52px_1fr_90px_90px_90px] gap-4 px-5 py-3 border-b border-[#c9a84c]/10 text-[#8a8a9a] text-[9px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>
            <div>Rank</div>
            <div>Builder</div>
            <div className="text-right">Streak</div>
            <div className="text-right">Projects</div>
            <div className="text-right">Points</div>
          </div>

          {/* Rows */}
          {rest.map((entry, idx) => (
            <Link
              key={entry.rank}
              href={`/builder/${entry.user._id}`}
              className={`grid grid-cols-[52px_1fr_90px_90px_90px] gap-4 px-5 py-4 items-center border-b border-[#c9a84c]/8 hover:bg-[#c9a84c]/5 transition-colors last:border-0 group ${idx % 2 === 0 ? "" : "bg-[#0a0b12]/30"}`}
            >
              <div className="text-[#c9a84c]/40 text-sm font-mono">{String(entry.rank).padStart(2, "0")}</div>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-[#1a1c28] border border-[#c9a84c]/15 flex items-center justify-center text-[10px] text-[#8a8a9a] overflow-hidden">
                  {entry.user.avatar ? (
                    <img src={entry.user.avatar} alt={entry.user.username} className="w-full h-full object-cover rounded-full p-0.5" />
                  ) : (
                    entry.user.username.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-[#f0ead6] text-sm group-hover:text-[#c9a84c] transition-colors truncate">
                  @{entry.user.username}
                </span>
              </div>

              <div className="text-right">
                {entry.user.streak > 0 ? (
                  <span className="inline-flex items-center gap-0.5 text-[#c9a84c] text-[11px] font-mono">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 flex-shrink-0"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 2.4 5.6a8.3 8.3 0 11-14.3-6.4c1.5 1.5 3 2.5 3 4.5 0 .5.3 1 1.4 1.3z" /></svg>
                    {entry.user.streak}
                  </span>
                ) : (
                  <span className="text-[#8a8a9a]/40 text-[11px] font-mono">—</span>
                )}
              </div>

              <div className="text-right text-[#8a8a9a] text-[11px] font-mono">
                {entry.user.projectCount ?? 0}
              </div>

              <div className="text-right text-[#c9a84c] text-sm font-mono font-bold">
                {entry.points}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && entries.length === 0 && (
        <div className="border border-dashed border-[#c9a84c]/15 p-16 text-center">
          <p className="text-[#8a8a9a] text-xl italic mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>The register is empty.</p>
          <p className="text-[#8a8a9a]/40 text-xs">No builders have earned points yet. Start building to claim the throne.</p>
        </div>
      )}

      {/* ── Back ── */}
      <div className="text-center border-t border-[#c9a84c]/10 pt-6">
        <Link href="/community" className="text-[#8a8a9a] text-[9px] tracking-[0.2em] uppercase hover:text-[#c9a84c] transition-colors" style={{ fontFamily: "var(--font-cinzel)" }}>
          ← Back to Community
        </Link>
      </div>
    </div>
  );
}
