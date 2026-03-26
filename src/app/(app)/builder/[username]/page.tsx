"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

interface Task { _id: string; status: string; priority?: string; }
interface Project {
  _id: string; name: string; description: string; stack: string[];
  status: string; tasks: Task[]; deadline?: string; completionPercent?: number;
}
interface Builder {
  _id: string; username: string;
  image?: string;   // NextAuth / OAuth field
  avatar?: string;  // raw DB field
  streak: number; totalPoints: number; rank: number; createdAt: string;
}

function statusBadge(s: string) {
  switch (s) {
    case "active":    return "bg-[#1a4a35] text-[#5ae0a0]";
    case "shipped":   return "bg-[#1a4a35] text-[#5ae0a0]";
    case "paused":    return "bg-[#4a1a1a] text-[#e05a5a]";
    case "planning":  return "bg-[#3a3520] text-[#c9a84c]";
    case "reviewing": return "bg-[#3a3520] text-[#c9a84c]";
    default:          return "bg-[#1a1c28] text-[#8a8a9a]";
  }
}

function progressColor(pct: number) {
  if (pct >= 100) return "#5ae0a0";
  if (pct >= 60)  return "#c9a84c";
  if (pct >= 30)  return "#e0935a";
  return "#e05a5a";
}

export default function BuilderProfilePage() {
  const params = useParams();
  // The folder is [username], so Next.js provides params.username.
  // We pass it directly to the API which resolves by _id, githubId, or username.
  const id = params.username as string;

  const [builder, setBuilder] = useState<Builder | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/builders/${id}`)
      .then(r => { if (!r.ok) throw new Error("Builder not found."); return r.json(); })
      .then(data => { setBuilder(data.builder); setProjects(data.projects || []); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto mt-20 flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full border border-[#c9a84c]/20 bg-[#1a1c28] animate-pulse" />
        <div className="h-6 w-48 bg-[#1a1c28] animate-pulse" />
        <div className="h-3 w-64 bg-[#1a1c28] animate-pulse" />
      </div>
    );
  }

  if (error || !builder) {
    return (
      <div className="max-w-[1200px] mx-auto mt-20 border border-dashed border-[#e05a5a]/20 p-16 text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="#e05a5a" strokeWidth="1.5" className="w-8 h-8 mb-4 mx-auto opacity-40">
          <path d="M12 22s8-4.5 8-11.8V5l-8-3-8 3v5.2C4 17.5 12 22 12 22z" />
        </svg>
        <p className="text-[#e05a5a] text-2xl mb-2" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>Signal Lost</p>
        <p className="text-[#8a8a9a] text-[10px] tracking-widest uppercase mb-6" style={{ fontFamily: "var(--font-cinzel)" }}>{error || "Builder not found"}</p>
        <Link href="/community" className="text-[#c9a84c] text-[9px] tracking-[0.15em] uppercase hover:text-[#f0ead6] transition-colors" style={{ fontFamily: "var(--font-cinzel)" }}>
          ← Return to Community
        </Link>
      </div>
    );
  }

  const totalTasks = projects.reduce((a, p) => a + (p.tasks?.length || 0), 0);
  const doneTasks  = projects.reduce((a, p) => a + (p.tasks?.filter(t => t.status === "done").length || 0), 0);
  const fleetCompletion = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const shippedCount = projects.filter(p => p.status === "shipped").length;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* ── Hero Banner ── */}
      <div className="relative border border-[#c9a84c]/20 bg-[#0e1018] overflow-hidden">
        {/* Decorative gold gradient strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c9a84c]/60 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c9a84c]/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

        <div className="relative p-8 flex flex-col md:flex-row md:items-center gap-8">
          {/* Avatar */}
          <div className="relative w-28 h-28 flex-shrink-0">
            <div className="absolute inset-0 border-2 border-[#c9a84c]/40 rounded-full shadow-[0_0_40px_rgba(201,168,76,0.15)]" />
            <div className="w-full h-full rounded-full bg-[#1a1c28] flex items-center justify-center overflow-hidden">
              {(builder.image || builder.avatar) ? (
                <img src={builder.image || builder.avatar} alt={builder.username} className="w-full h-full object-cover rounded-full p-1.5" />
              ) : (
                <span className="text-[#c9a84c] text-4xl font-mono">{builder.username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {builder.rank === 1 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#c9a84c] rounded-full flex items-center justify-center text-[#080810] font-bold text-[10px]">1</div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <p className="text-[#c9a84c]/60 text-[9px] tracking-[0.3em] uppercase mb-1" style={{ fontFamily: "var(--font-cinzel)" }}>
              Master Builder · Member since {new Date(builder.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <h1 className="text-[#f0ead6] text-4xl sm:text-5xl mb-4" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>
              @{builder.username}
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#c9a84c]/10 pt-4">
              {[
                { label: "Global Rank",    value: `#${builder.rank || "—"}`, icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /> },
                { label: "Streak",         value: `${builder.streak}d`, icon: <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 2.4 5.6a8.3 8.3 0 11-14.3-6.4c1.5 1.5 3 2.5 3 4.5 0 .5.3 1 1.4 1.3z" /> },
                { label: "Total Points",   value: builder.totalPoints.toLocaleString(), icon: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></> },
                { label: "Fleet Shipped",  value: `${shippedCount} / ${projects.length}`, icon: <path d="M3 18 Q6 10 12 8 Q18 6 21 18" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="text-center p-3 bg-[#0a0b12]/60 border border-[#c9a84c]/10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-4 h-4 mx-auto mb-2 opacity-60">{icon}</svg>
                  <p className="text-[#c9a84c] text-lg font-mono mb-0.5">{value}</p>
                  <p className="text-[#8a8a9a] text-[8px] tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fleet Health Bar */}
        <div className="border-t border-[#c9a84c]/10 px-8 py-4 flex items-center gap-4">
          <span className="text-[#8a8a9a] text-[9px] tracking-widest uppercase flex-shrink-0" style={{ fontFamily: "var(--font-cinzel)" }}>Fleet Completion</span>
          <div className="flex-1 h-1.5 bg-[#1a1c28] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${fleetCompletion}%`, backgroundColor: progressColor(fleetCompletion) }} />
          </div>
          <span className="text-[#c9a84c] text-[10px] font-mono flex-shrink-0">{fleetCompletion}%</span>
        </div>
      </div>

      {/* ── Public Fleet ── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#f0ead6] text-2xl" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>
            Public Fleet
          </h2>
          <span className="text-[#8a8a9a] text-[10px] tracking-widest uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>
            {projects.length} Vessel{projects.length !== 1 ? "s" : ""}
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="border border-dashed border-[#c9a84c]/20 p-16 flex flex-col items-center justify-center text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-10 h-10 mb-4 opacity-20">
              <path d="M3 18 Q6 10 12 8 Q18 6 21 18" /><line x1="12" y1="8" x2="12" y2="18" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <p className="text-[#8a8a9a] text-lg italic mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>No public blueprints yet.</p>
            <p className="text-[#8a8a9a]/40 text-xs">This builder hasn&apos;t opened their fleet to the world.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => {
              const done = p.tasks?.filter(t => t.status === "done").length || 0;
              const tot  = p.tasks?.length || 0;
              const pct  = tot > 0 ? Math.round((done / tot) * 100) : 0;
              return (
                <div key={p._id} className="border border-[#c9a84c]/12 bg-[#0e1018] p-5 hover:border-[#c9a84c]/30 transition-all flex flex-col group">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[8px] tracking-[0.15em] uppercase px-2 py-0.5 font-bold ${statusBadge(p.status)}`} style={{ fontFamily: "var(--font-cinzel)" }}>
                      {p.status}
                    </span>
                    <span className="text-[#c9a84c] text-[10px] font-mono">{pct}%</span>
                  </div>
                  <h3 className="text-[#f0ead6] text-base font-medium mb-1 group-hover:text-[#c9a84c] transition-colors truncate">{p.name}</h3>
                  <p className="text-[#8a8a9a] text-xs line-clamp-2 mb-4 flex-1">{p.description || "No description."}</p>

                  {/* Progress bar */}
                  <div className="h-0.5 w-full bg-[#1a1c28] rounded-full overflow-hidden mb-4">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: progressColor(pct) }} />
                  </div>

                  <div className="flex gap-1.5 flex-wrap mb-4">
                    {p.stack?.slice(0, 4).map(s => (
                      <span key={s} className="text-[8px] border border-[#c9a84c]/20 text-[#8a8a9a] px-1.5 py-0.5 tracking-wider uppercase">{s}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#c9a84c]/10 pt-3 text-[9px]">
                    <span className="text-[#8a8a9a] font-mono">{done}/{tot} tasks</span>
                    <Link href={`/projects/${p._id}`} className="text-[#c9a84c] tracking-[0.12em] uppercase hover:text-[#e8c96a] transition-colors" style={{ fontFamily: "var(--font-cinzel)" }}>
                      Inspect →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Back link ── */}
      <div className="border-t border-[#c9a84c]/10 pt-6 text-center">
        <Link href="/community" className="text-[#8a8a9a] text-[9px] tracking-[0.2em] uppercase hover:text-[#c9a84c] transition-colors" style={{ fontFamily: "var(--font-cinzel)" }}>
          ← Return to Community
        </Link>
      </div>
    </div>
  );
}
