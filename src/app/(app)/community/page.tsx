"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// ── Fallback mock data (shown when DB returns nothing) ──────────────────────
const MOCK_COMMUNITY_PROJECTS = [
  {
    _id: "c1",
    name: "Aurelius Engine",
    description: "A high-performance asynchronous runtime for distributed ship-to-shore communications.",
    status: "shipped",
    stack: ["Rust", "gRPC", "K8S"],
    userId: "@artisan_null",
    featured: true,
    stars: "1.2k",
    forks: "84",
  },
  {
    _id: "c2",
    name: "The Icarus Protocol",
    description: "Decentralized flight path optimization for high-altitude drones.",
    status: "active",
    stack: ["Go", "WebAssembly"],
    userId: "@sky_forge",
    featured: false,
  },
  {
    _id: "c3",
    name: "Chrono-Sync V2",
    description: "Precision timing mechanism for sub-millisecond database reconciliation.",
    status: "reviewing",
    stack: ["Elixir", "PostgreSQL"],
    userId: "@time_weaver",
    featured: false,
  },
];

const MOCK_LEADERBOARD = [
  { rank: "01", name: "Captain Cipher", streak: 42, projects: 12, points: "9,482" },
  { rank: "02", name: "M. Kovacs",      streak: 31, projects: 8,  points: "8,128" },
  { rank: "03", name: "S. Vancity",     streak: 19, projects: 24, points: "7,944" },
  { rank: "04", name: "L. Weaver",      streak: 14, projects: 5,  points: "6,201" },
];

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
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>(MOCK_LEADERBOARD);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  // Fetch public projects from DB
  useEffect(() => {
    setLoading(true);
    fetch("/api/projects?visibility=public&sort=updatedAt")
      .then((r) => r.json())
      .then((data: CommunityProject[]) => {
        if (Array.isArray(data) && data.length > 0) {
          // Mark first as featured
          const enriched = data.map((p, i) => ({ ...p, featured: i === 0 }));
          setProjects(enriched);
          setUsingMock(false);
        } else {
          // Fallback to mock data
          setProjects(MOCK_COMMUNITY_PROJECTS as CommunityProject[]);
          setUsingMock(true);
        }
      })
      .catch(() => {
        setProjects(MOCK_COMMUNITY_PROJECTS as CommunityProject[]);
        setUsingMock(true);
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
          {usingMock && (
            <p className="text-[#c9a84c]/60 text-[9px] tracking-[0.12em] uppercase mt-2" style={{ fontFamily: "var(--font-cinzel)" }}>
              ◈ Preview data — seed the DB or ship a public project
            </p>
          )}
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
                  <span className="flex items-center gap-1">
                    👤 {typeof featured.userId === "string" && featured.userId.startsWith("@")
                      ? featured.userId
                      : `Builder`}
                  </span>
                  {featured.stars && <span className="flex items-center gap-1">⭐ {featured.stars}</span>}
                  {featured.forks && <span className="flex items-center gap-1">🔱 {featured.forks}</span>}
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
            <div className="border border-dashed border-[#c9a84c]/15 p-12 text-center">
              <p className="text-[#8a8a9a] text-sm italic" style={{ fontFamily: "var(--font-cormorant)" }}>
                No public projects in the showcase yet. Ship your first build to join the guild.
              </p>
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
              {leaderboard.map((u) => (
                <div key={u.rank} className="flex items-center gap-3">
                  <span className="text-[#c9a84c]/60 text-lg font-mono w-6">{u.rank}</span>
                  <div className="w-8 h-8 rounded-full bg-[#1a1c28] border border-[#c9a84c]/20 flex items-center justify-center text-[10px] text-[#8a8a9a]">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[#f0ead6] text-xs font-medium">{u.name}</p>
                      <span className="text-[#c9a84c] text-[10px]">🔥 {u.streak}</span>
                    </div>
                    <p className="text-[#8a8a9a] text-[9px] tracking-wider uppercase">
                      {u.projects} Projects · {u.points} Tasks Done
                    </p>
                  </div>
                </div>
              ))}
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
