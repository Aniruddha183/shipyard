"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";



// ── Types ───────────────────────────────────────────────────────────────────
interface Tombstone {
  _id: string;
  userId?: string;
  username?: string;
  code?: string;
  name: string;
  description: string;
  finalPulse?: number;
  completionSnapshot?: number | null;
  stack: string[];
  mortem?: string;
  abandonedAt?: string | null;
  tasks?: { status: string }[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function buildCode(id: string) {
  const prefix = ["SY-AT", "SY-75", "SY-BF"][parseInt(id.slice(-1), 16) % 3];
  const num = parseInt(id.slice(-3), 16) % 900 + 100;
  return `${prefix}-${num}`;
}

function calcFinalPulse(t: Tombstone): number {
  if (t.finalPulse != null) return t.finalPulse;
  if (t.completionSnapshot != null) return t.completionSnapshot;
  if (t.tasks && t.tasks.length > 0) {
    const done = t.tasks.filter((x) => x.status === "done").length;
    return Math.round((done / t.tasks.length) * 100);
  }
  return 0;
}

function formatMortem(t: Tombstone): string {
  if (t.mortem) return t.mortem;
  if (t.abandonedAt) {
    return new Date(t.abandonedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return "Unknown";
}

export default function GraveyardPage() {
  const { data: session } = useSession();
  const sessionUser = session?.user as any;
  const [filterType, setFilterType] = useState<"mine" | "global">("mine");
  const [tombstones, setTombstones] = useState<Tombstone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let url = "/api/projects?status=abandoned";
    if (filterType === "mine" && sessionUser?.id) {
      url += `&userId=${sessionUser.id}`;
    }
    
    fetch(url)
      .then((r) => r.json())
      .then((data: Tombstone[]) => {
        setTombstones(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setTombstones([]);
      })
      .finally(() => setLoading(false));
  }, [filterType, sessionUser?.id]);

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* ── Hero & Filters ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light leading-tight mb-4">
            <span style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", color: "#f0ead6" }}>
              Every great builder has a{" "}
            </span>
            <span style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", color: "#e05a5a" }}>
              graveyard
            </span>
            <span style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", color: "#f0ead6" }}>
              .
              <br />
              Own it.
            </span>
          </h1>
          <p className="text-[#8a8a9a] text-sm max-w-lg leading-relaxed">
            The lessons learned in the shadows of abandoned repositories are the foundation of your next masterpiece.
          </p>
        </div>

        <div className="flex bg-[#0e1018] border border-[#c9a84c]/20 p-1 self-start">
          <button
            onClick={() => setFilterType("mine")}
            className={`px-4 py-2 text-[10px] tracking-widest uppercase transition-all ${
              filterType === "mine" ? "bg-[#c9a84c]/10 text-[#c9a84c]" : "text-[#8a8a9a] hover:text-[#f0ead6]"
            }`}
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            My Graves
          </button>
          <button
            onClick={() => setFilterType("global")}
            className={`px-4 py-2 text-[10px] tracking-widest uppercase transition-all ${
              filterType === "global" ? "bg-[#c9a84c]/10 text-[#c9a84c]" : "text-[#8a8a9a] hover:text-[#f0ead6]"
            }`}
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Global Memorial
          </button>
        </div>
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-[#6b1a2a]/20 bg-[#0e1018] p-5 h-52 animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Tombstone Grid ── */}
      {!loading && tombstones.length === 0 && (
        <div className="border border-dashed border-[#6b1a2a]/20 bg-[#0e1018] p-12 flex flex-col items-center justify-center text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="#6b1a2a" strokeWidth="1.5" className="w-8 h-8 mb-4 opacity-60">
            <path d="M12 2v20M8 6h8M6 10h12M12 14v6" />
          </svg>
          <p className="text-[#8a8a9a] text-lg italic" style={{ fontFamily: "var(--font-cormorant)" }}>
            The soil is undisturbed. No projects have been laid to rest here.
          </p>
        </div>
      )}

      {!loading && tombstones.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tombstones.map((t) => {
            const pulse  = calcFinalPulse(t);
            const code   = t.code ?? buildCode(t._id);
            const mortem = formatMortem(t);
            const isOwner = sessionUser?.id === t.userId;

            return (
              <div
                key={t._id}
                className="border border-[#6b1a2a]/20 bg-[#0e1018] p-5 flex flex-col justify-between hover:border-[#6b1a2a]/40 transition-all"
              >
                <div>
                  {/* Code + skull */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#8a8a9a] text-[9px] font-mono">{code}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#6b1a2a] opacity-60">
                      <path d="M9 12h.01M15 12h.01M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5zM8 20v2M12 20v2M16 20v2M6 16h12v4H6z" />
                    </svg>
                  </div>

                  {/* Name */}
                  <h3
                    className="text-[#f0ead6] text-lg mb-1"
                    style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
                  >
                    {t.name}
                  </h3>
                  
                  {t.username && filterType === "global" && (
                    <p className="text-[#c9a84c] text-[9px] tracking-wider uppercase mb-3 flex items-center gap-1.5" style={{ fontFamily: "var(--font-cinzel)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      {t.username}
                    </p>
                  )}

                  <p className="text-[#8a8a9a] text-xs mb-4 line-clamp-2">{t.description}</p>
                </div>

                <div>
                  {/* Final Pulse */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[#8a8a9a] text-[9px] tracking-widest uppercase"
                      style={{ fontFamily: "var(--font-cinzel)" }}
                    >
                      Final Pulse
                    </span>
                    <span className="text-[#e05a5a] font-mono text-lg">{pulse}%</span>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    {(t.stack ?? []).map((tag) => (
                      <span
                        key={tag}
                        className="text-[8px] border border-[#6b1a2a]/20 text-[#8a8a9a] px-1.5 py-0.5 tracking-wider uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Mortem + Review */}
                  <div className="flex items-center justify-between text-[9px] border-t border-[#6b1a2a]/15 pt-3">
                    <span className="text-[#8a8a9a] font-mono">{mortem}</span>
                    {isOwner ? (
                      <Link
                        href={`/projects/${t._id}`}
                        className="text-[#c9a84c] tracking-[0.12em] uppercase hover:text-[#e8c96a] transition-colors"
                        style={{ fontFamily: "var(--font-cinzel)" }}
                      >
                        Review Autopsy
                      </Link>
                    ) : (
                      <span
                        className="text-[#8a8a9a]/40 tracking-[0.12em] uppercase cursor-not-allowed"
                        style={{ fontFamily: "var(--font-cinzel)" }}
                        title="Restricted: Architect's eyes only"
                      >
                        Access Denied
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Retire a Project CTA */}
          <Link href="/projects" className="border border-dashed border-[#6b1a2a]/20 bg-transparent p-5 flex flex-col items-center justify-center text-center min-h-[200px] hover:bg-[#6b1a2a]/10 hover:border-[#6b1a2a]/40 cursor-pointer transition-all">
            <span className="text-[#8a8a9a] text-2xl mb-2">+</span>
            <h3
              className="text-[#8a8a9a] text-sm italic mb-1"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Retire a Project
            </h3>
            <p className="text-[#8a8a9a]/50 text-xs max-w-[160px]">
              Admit defeat to pave the way for victory.
            </p>
          </Link>
        </div>
      )}

      {/* ── Autopsy Insights ── */}
      <div className="mt-8">
        <h2
          className="text-[#f0ead6] text-xl mb-4"
          style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
        >
          Autopsy Insights
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          {/* Failure Analysis */}
          <div className="border border-[#6b1a2a]/20 bg-[#0e1018] p-6">
            <p
              className="text-[#8a8a9a] text-[9px] tracking-[0.15em] uppercase mb-3"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              Master Narrative
            </p>
            <h3
              className="text-[#f0ead6] text-2xl font-light"
              style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
            >
              62% of failures were caused by &ldquo;Feature Creep&rdquo;
            </h3>
          </div>

          {/* Warning */}
          <div className="border border-[#c9a84c]/20 bg-[#0e1018] p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#c9a84c]">⚠</span>
              <span
                className="text-[#c9a84c] text-base"
                style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
              >
                Critical Warning
              </span>
            </div>
            <p className="text-[#8a8a9a] text-xs leading-relaxed mb-3">
              Your current project &ldquo;NexForge&rdquo; is showing 83% similarity to the abandoned &ldquo;LuminaOS&rdquo; architecture. Proceed with caution.
            </p>
            <Link
              href="#"
              className="text-[#c9a84c] text-[9px] tracking-[0.15em] uppercase hover:text-[#e8c96a] transition-colors"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              Compare Schematics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
