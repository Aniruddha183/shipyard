"use client";

import Link from "next/link";
import { useState, useEffect } from "react";



// ── Types ───────────────────────────────────────────────────────────────────
interface CommunityProject {
  _id: string;
  name: string;
  description: string;
  status: string;
  stack: string[];
  userId: string;
  featured?: boolean;
  stars?: string;
  forks?: string;
}

interface LeaderEntry {
  rank: string;
  name: string;
  streak: number;
  projects: number;
  points: string;
}

interface LeaderUser {
  _id: string;
  username: string;
  streak: number;
  totalPoints: number;
  projectCount?: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function statusLabel(status: string) {
  const map: Record<string, string> = {
    shipped:   "Shipped",
    active:    "Active",
    reviewing: "Reviewing",
    planning:  "Planning",
    paused:    "Paused",
  };
  return map[status] ?? status;
}

function statusBadgeClass(status: string) {
  if (status === "shipped") return "bg-[#1a4a35] text-[#5ae0a0]";
  if (status === "active")  return "bg-[#1a4a35] text-[#5ae0a0]";
  return "bg-[#c9a84c]/15 text-[#c9a84c]";
}

export default function CommunityPage() {
  const [tab, setTab] = useState("Recent");
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch public projects from DB
  useEffect(() => {
    setLoading(true);
    fetch("/api/projects?visibility=public&sort=updatedAt")
      .then((r) => r.json())
      .then((data: CommunityProject[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const enriched = data.map((p, i) => ({ ...p, featured: i === 0 }));
          setProjects(enriched);
        } else {
          setProjects([]);
        }
      })
      .catch(() => {
        setProjects([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch leaderboard from DB
  useEffect(() => {
    fetch("/api/leaderboard?limit=4")
      .then((r) => r.json())
      .then((data: LeaderUser[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: LeaderEntry[] = data.map((u, i) => ({
            rank:     String(i + 1).padStart(2, "0"),
            name:     u.username,
            streak:   u.streak ?? 0,
            projects: u.projectCount ?? 0,
            points:   u.totalPoints?.toLocaleString() ?? "0",
          }));
          setLeaderboard(mapped);
        }
        // else keep mock leaderboard
      })
      .catch(() => {
        // keep mock leaderboard
      });
  }, []);

  const featured    = projects.find((p) => p.featured);
  const nonFeatured = projects.filter((p) => !p.featured);

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* ── Hero ── */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <h1
            className="text-[#f0ead6] text-3xl sm:text-4xl lg:text-5xl font-light leading-tight"
            style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
          >
            The Horizon of
            <br />
            Collective Creation
          </h1>
          <p className="text-[#8a8a9a] text-sm mt-3 max-w-lg leading-relaxed">
            Behold the projects of our guild. From the simplest utility to the grandest system, every line of code is a plank in our shared legacy.
          </p>
        </div>
        <div className="flex gap-8 text-center">
          <div>
            <p className="text-[#c9a84c] text-3xl font-mono">
              {loading ? "…" : projects.filter(p => p.status === "active" || p.status === "shipped").length}
            </p>
            <p className="text-[#8a8a9a] text-[9px] tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>
              Active Projects
            </p>
          </div>
          <div>
            <p className="text-[#c9a84c] text-3xl font-mono">
              {loading ? "…" : leaderboard.length}
            </p>
            <p className="text-[#8a8a9a] text-[9px] tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>
              Master Builders
            </p>
          </div>
        </div>
      </div>

      {/* ── Project Showcase + Leaderboard ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Feed */}
        <div>
          {/* Tabs */}
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-[#f0ead6] text-xl"
              style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
            >
              Project Showcase
            </h2>
            <div className="flex gap-3">
              {["Recent", "Prominent", "Legendary"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`text-xs transition-colors ${
                    tab === t
                      ? "text-[#c9a84c] underline underline-offset-4"
                      : "text-[#8a8a9a] hover:text-[#f0ead6]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              <div className="border border-[#c9a84c]/8 bg-[#0e1018] p-5 h-36 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-[#c9a84c]/8 bg-[#0e1018] p-4 h-28 animate-pulse" />
                <div className="border border-[#c9a84c]/8 bg-[#0e1018] p-4 h-28 animate-pulse" />
              </div>
            </div>
          )}

          {/* Featured Project */}
          {!loading && featured && (
            <div className="border border-[#c9a84c]/15 bg-[#0e1018] p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#8a8a9a] text-[9px] font-mono">
                  #{featured._id.toString().slice(-6).toUpperCase()}
                </span>
                <span
                  className={`text-[8px] px-2 py-0.5 tracking-wider uppercase font-bold ${statusBadgeClass(featured.status)}`}
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  {statusLabel(featured.status)}
                </span>
              </div>

              <h3 className="text-[#f0ead6] text-lg font-medium mb-1">{featured.name}</h3>
              <p className="text-[#8a8a9a] text-xs mb-4">{featured.description}</p>

              <div className="flex gap-1.5 mb-4 flex-wrap">
                {featured.stack?.map((t) => (
                  <span key={t} className="text-[8px] border border-[#c9a84c]/15 text-[#8a8a9a] px-1.5 py-0.5 tracking-wider uppercase">
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-[#8a8a9a] text-xs">
                  <span className="flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 text-[#8a8a9a]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    {typeof featured.userId === "string" && featured.userId.startsWith("@")
                      ? featured.userId
                      : `Builder`}
                  </span>
                  {featured.stars && <span className="flex items-center gap-1.5"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-3 h-3 text-[#c9a84c]"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>{featured.stars}</span>}
                  {featured.forks && <span className="flex items-center gap-1.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 text-[#5ae0a0]"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"/><path d="M12 12v3"/></svg>{featured.forks}</span>}
                </div>
                <Link
                  href={`/projects/${featured._id}`}
                  className="text-[#c9a84c] text-[10px] tracking-[0.12em] uppercase hover:text-[#e8c96a] transition-colors"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  Inspect Blueprint →
                </Link>
              </div>
            </div>
          )}

          {/* Other projects */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nonFeatured.map((p) => (
                <div key={p._id} className="border border-[#c9a84c]/12 bg-[#0e1018] p-4">
                  <span
                    className={`text-[8px] tracking-wider uppercase px-2 py-0.5 mb-2 inline-block font-bold ${statusBadgeClass(p.status)}`}
                    style={{ fontFamily: "var(--font-cinzel)" }}
                  >
                    {statusLabel(p.status)}
                  </span>
                  <h3 className="text-[#f0ead6] text-sm font-medium mb-1">{p.name}</h3>
                  <p className="text-[#8a8a9a] text-xs mb-3">{p.description}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {p.stack?.slice(0, 3).map((t) => (
                      <span key={t} className="text-[8px] border border-[#c9a84c]/12 text-[#8a8a9a] px-1.5 py-0.5 tracking-wider uppercase">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && projects.length === 0 && (
             <div className="border border-dashed border-[#c9a84c]/15 py-24 flex flex-col items-center justify-center text-center">
               <div className="w-12 h-12 mb-6 opacity-20">
                 <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                   <path d="M12 22s-8-4.5-8-11.8A2 2 0 0 1 6 8.2c1.5 0 2.5 1.5 2.5 1.5l1.5 3 2-4.5h4c1 0 2 .5 2 1.5S18 12 18 12s-1-2-1.5-2C15 10 14 12 14 12l-2-3-2.5 4L8 10c0-1.5 1.5-2 1.5-2" />
                   <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 3 7.3" />
                   <path d="M22 12a10 10 0 0 0-4-8.5" />
                 </svg>
               </div>
               <p className="text-[#f0ead6] text-2xl italic mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>The showcase is empty.</p>
               <p className="text-[#8a8a9a]/60 text-xs tracking-widest uppercase mb-1" style={{ fontFamily: "var(--font-cinzel)" }}>No public projects are currently visible. Be the first to build the legacy.</p>
             </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Leaderboard */}
          <div className="border border-[#c9a84c]/12 bg-[#0e1018] p-5">
            <div className="flex items-center justify-between mb-1">
              <h3
                className="text-[#c9a84c] text-lg"
                style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
              >
                Master<br />Builders
              </h3>
              <div className="text-right">
                <p className="text-[#8a8a9a] text-[9px] tracking-wider uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>
                  Top {leaderboard.length} / Week
                </p>
                <p className="text-[#f0ead6] text-xs font-mono">{leaderboard[0]?.streak ?? 0}</p>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              {leaderboard.length === 0 ? (
                <div className="py-6 text-center text-[#8a8a9a] text-xs">No ranking data yet.</div>
              ) : (
                leaderboard.map((u) => (
                  <div key={u.rank} className="flex items-center gap-3">
                    <span className="text-[#c9a84c]/60 text-lg font-mono w-6">{u.rank}</span>
                    <div className="w-8 h-8 rounded-full bg-[#1a1c28] border border-[#c9a84c]/20 flex items-center justify-center text-[10px] text-[#8a8a9a]">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[#f0ead6] text-xs font-medium">{u.name}</p>
                        {u.streak > 0 && <span className="text-[#c9a84c] text-[10px] flex items-center gap-0.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 2.4 5.6a8.3 8.3 0 11-14.3-6.4c1.5 1.5 3 2.5 3 4.5 0 .5.3 1 1.4 1.3z" /></svg>{u.streak}</span>}
                      </div>
                      <p className="text-[#8a8a9a] text-[9px] tracking-wider uppercase">
                        {u.projects} Projects · {u.points} Tasks Done
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              href="#"
              className="block text-center text-[#c9a84c]/50 text-[9px] tracking-[0.15em] uppercase mt-4 hover:text-[#c9a84c] transition-colors"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              View Full Register
            </Link>
          </div>

          {/* Master's Tip */}
          <div className="border border-[#c9a84c]/12 bg-[#0e1018] p-5">
            <h4
              className="text-[#f0ead6] text-base mb-3"
              style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
            >
              Master&apos;s Tip
            </h4>
            <p className="text-[#8a8a9a] text-xs italic leading-relaxed mb-3" style={{ fontFamily: "var(--font-cormorant)" }}>
              &ldquo;A clean commit history is the hallmark of a disciplined mind. Tend to your branches like a gardener tends to his vineyard.&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-[#c9a84c]/20" />
              <span className="text-[#8a8a9a] text-[8px] tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>
                The Arch-Architect
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
