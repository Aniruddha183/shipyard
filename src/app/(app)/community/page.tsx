"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";



// ── Types ───────────────────────────────────────────────────────────────────
interface CommunityProject {
  _id: string;
  name: string;
  description: string;
  status: string;
  stack: string[];
  userId: string;
  username?: string;
  featured?: boolean;
  stars?: string;
  forks?: string;
}

interface LeaderEntry {
  userid: any;
  rank: string;
  name: string;
  streak: number;
  projects: number;
  points: string;
}

interface LeaderUser {
  id: any;
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
    abandoned: "Retired",
  };
  return map[status] ?? status;
}

function statusBadgeClass(status: string) {
  if (status === "shipped") return "bg-[#1a4a35] text-[#5ae0a0]";
  if (status === "active")  return "bg-[#1a4a35] text-[#5ae0a0]";
  if (status === "abandoned") return "bg-[#6b1a2a]/20 text-[#e05a5a]";
  return "bg-[#c9a84c]/15 text-[#c9a84c]";
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const sessionUser = session?.user as any;
  const sessionUserId = sessionUser?.id;
  const [tab, setTab] = useState("Recent");
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [fullLeaderboard, setFullLeaderboard] = useState<LeaderEntry[]>([]);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch public projects from DB
  useEffect(() => {
    setLoading(true);
    fetch("/api/projects?visibility=public&sort=updatedAt")
      .then((r) => r.json())
      .then((data: CommunityProject[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
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
    fetch("/api/leaderboard?limit=50")
      .then((r) => r.json())
      .then((data: LeaderUser[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: LeaderEntry[] = data.map((u, i) => ({
            rank:     String(i + 1).padStart(2, "0"),
            name:     u.username,
            userid:   u._id,
            streak:   u.streak ?? 0,
            projects: u.projectCount ?? 0,
            points:   u.totalPoints?.toLocaleString() ?? "0",
          }));
          setFullLeaderboard(mapped);
          setLeaderboard(mapped.slice(0, 4));
        }
      })
      .catch(() => {});
  }, []);

  const getSortedProjects = () => {
    let sorted = [...projects];
    if (tab === "Prominent") {
      sorted = sorted.sort((a, b) => (b.stack?.length || 0) - (a.stack?.length || 0));
    } else if (tab === "Legendary") {
      sorted = sorted.filter(p => p.status === "shipped");
    }
    return sorted.map((p, i) => ({ ...p, featured: i === 0 }));
  };

  const displayedProjects = getSortedProjects();
  const featured    = displayedProjects.find((p) => p.featured);
  const nonFeatured = displayedProjects.filter((p) => !p.featured);

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
              {loading ? "…" : fullLeaderboard.length}
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
                <Link href={`/builder/${featured.userId}`} className="flex items-center gap-1.5 text-[#8a8a9a] hover:text-[#c9a84c] transition-colors text-[10px] tracking-widest uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-[#c9a84c] flex-shrink-0"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  <span className="truncate max-w-[120px]">{featured.username || "Builder"}</span>
                </Link>
                {sessionUserId && featured.userId === sessionUserId ? (
                  <Link href={`/projects/${featured._id}`} className="text-[#c9a84c] text-[10px] tracking-[0.12em] uppercase hover:text-[#e8c96a] transition-colors flex-shrink-0" style={{ fontFamily: "var(--font-cinzel)" }}>
                    Inspect Blueprint →
                  </Link>
                ) : (
                  <span className="text-[#8a8a9a]/30 text-[10px] tracking-[0.12em] uppercase cursor-not-allowed flex-shrink-0" style={{ fontFamily: "var(--font-cinzel)" }} title="Only accessible to the project owner">
                    Restricted
                  </span>
                )}
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
                  <div className="flex gap-1.5 flex-wrap mb-4">
                    {p.stack?.slice(0, 3).map((t) => (
                      <span key={t} className="text-[8px] border border-[#c9a84c]/12 text-[#8a8a9a] px-1.5 py-0.5 tracking-wider uppercase">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-[#c9a84c]/10 pt-3">
                    <Link href={`/builder/${p.userId}`} className="text-[#8a8a9a] hover:text-[#c9a84c] text-[9px] tracking-widest uppercase transition-colors flex items-center gap-1.5 min-w-0" style={{ fontFamily: "var(--font-cinzel)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 flex-shrink-0"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      <span className="truncate max-w-[80px]">{p.username || "Builder"}</span>
                    </Link>
                    {sessionUserId && p.userId === sessionUserId ? (
                      <Link href={`/projects/${p._id}`} className="text-[#c9a84c] text-[9px] tracking-[0.15em] uppercase hover:text-[#e8c96a] transition-colors flex-shrink-0" style={{ fontFamily: "var(--font-cinzel)" }}>
                        Inspect →
                      </Link>
                    ) : (
                      <span className="text-[#8a8a9a]/30 text-[9px] tracking-[0.15em] uppercase cursor-not-allowed flex-shrink-0" title="Only accessible to the project owner">
                        Restricted
                      </span>
                    )}
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#c9a84c]" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontSize: "1.25rem", lineHeight: 1.2 }}>
                Master Builders
              </h3>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-[#8a8a9a] text-[9px] tracking-wider uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Top {leaderboard.length}</p>
                <p className="text-[#f0ead6] text-xs font-mono">{leaderboard[0]?.streak ?? 0} <span className="text-[8px] text-[#8a8a9a]">streak</span></p>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              {leaderboard.length === 0 ? (
                <div className="py-6 text-center text-[#8a8a9a] text-xs">No ranking data yet.</div>
              ) : (
                leaderboard.map((u) => (
                  <div key={u.rank} className="flex items-center gap-3">
                    <span className="text-[#c9a84c]/60 text-lg font-mono w-6 flex-shrink-0">{u.rank}</span>
                    <div className="w-8 h-8 rounded-full bg-[#1a1c28] border border-[#c9a84c]/20 flex flex-shrink-0 items-center justify-center text-[10px] text-[#8a8a9a]">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/builder/${u.userid}`} className="text-[#f0ead6] text-xs font-medium hover:text-[#c9a84c] transition-colors truncate block">
                        {u.name}
                      </Link>
                      <p className="text-[#8a8a9a] text-[8px] tracking-wider uppercase truncate">
                        {u.projects} prj · {u.points} pts
                      </p>
                    </div>
                    {u.streak > 0 && <span className="text-[#c9a84c] flex-shrink-0 text-[10px] flex items-center gap-0.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 2.4 5.6a8.3 8.3 0 11-14.3-6.4c1.5 1.5 3 2.5 3 4.5 0 .5.3 1 1.4 1.3z" /></svg>{u.streak}</span>}
                  </div>
                ))
              )}
            </div>

            <Link
              href="/leaderboard"
              className="block w-full text-center text-[#c9a84c]/50 text-[9px] tracking-[0.15em] uppercase mt-4 py-2 hover:text-[#c9a84c] hover:bg-[#c9a84c]/5 transition-colors"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              View Full Register →
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

      {/* ── Leaderboard Modal ── */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#080810] border border-[#c9a84c]/20 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#c9a84c]/10">
              <h2 className="text-[#f0ead6] text-xl" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>
                The Grand Register
              </h2>
              <button 
                onClick={() => setShowLeaderboardModal(false)}
                className="text-[#8a8a9a] hover:text-[#c9a84c] transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6 space-y-4 custom-scrollbar">
              <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-6">
                <div className="col-span-3 grid grid-cols-[w-8_1fr_100px_100px] gap-4 px-2 mb-2 text-[#8a8a9a] text-[9px] tracking-widest uppercase border-b border-[#c9a84c]/10 pb-2" style={{ fontFamily: "var(--font-cinzel)" }}>
                  <div className="w-8 ml-2">Rnk</div>
                  <div>Builder</div>
                  <div className="text-right">Streak</div>
                  <div className="text-right">Points</div>
                </div>

                {fullLeaderboard.map((u) => (
                  <div key={u.rank} className="col-span-3 grid grid-cols-[w-8_1fr_100px_100px] gap-4 items-center group hover:bg-[#c9a84c]/5 p-2 rounded-lg transition-colors">
                    <div className="text-[#c9a84c]/60 text-lg font-mono w-8 text-center">{u.rank}</div>
                    
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#1a1c28] border border-[#c9a84c]/20 flex flex-shrink-0 items-center justify-center text-[10px] text-[#8a8a9a]">
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                         <Link href={`/builder/${u.userid}`} className="text-[#f0ead6] text-sm font-medium hover:text-[#c9a84c] transition-colors truncate block">
                           {u.name}
                         </Link>
                         <p className="text-[#8a8a9a] text-[9px] tracking-wider uppercase truncate mt-0.5">
                           {u.projects} Projects
                         </p>
                      </div>
                    </div>
                    
                    <div className="text-right flex justify-end">
                      {u.streak > 0 ? (
                        <div className="inline-flex items-center gap-1 text-[#c9a84c] text-[11px] font-mono px-2 py-0.5 bg-[#c9a84c]/10 rounded-full border border-[#c9a84c]/20">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 2.4 5.6a8.3 8.3 0 11-14.3-6.4c1.5 1.5 3 2.5 3 4.5 0 .5.3 1 1.4 1.3z" /></svg>
                          {u.streak}
                        </div>
                      ) : (
                        <span className="text-[#8a8a9a] text-xs font-mono">0</span>
                      )}
                    </div>
                    
                    <div className="text-right text-[#c9a84c] text-sm font-mono font-bold">
                      {u.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-[#c9a84c]/10 text-center">
               <p className="text-[#8a8a9a] text-[9px] tracking-widest uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>
                 {fullLeaderboard.length} Master Builders Registered
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
