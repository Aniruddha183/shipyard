"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";



// ── Types ───────────────────────────────────────────────────────────────────
interface Task { _id: string; status: string; priority?: string; }
interface Project {
  _id: string; name: string; description: string; stack: string[];
  status: string; tasks: Task[]; deadline?: string; completionPercent?: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function statusColor(s: string) {
  switch (s) {
    case "active":    return "text-[#5ae0a0]";
    case "shipped":   return "text-[#5ae0a0]";
    case "paused":    return "text-[#e05a5a]";
    case "planning":  return "text-[#c9a84c]";
    case "reviewing": return "text-[#c9a84c]";
    default:          return "text-[#8a8a9a]";
  }
}

function progressBarColor(pct: number) {
  if (pct >= 100) return "from-[#5ae0a0] to-[#3ec98a]";
  if (pct >= 60)  return "from-[#c9a84c] to-[#e8c96a]";
  if (pct >= 30)  return "from-[#e0935a] to-[#c9a84c]";
  return "from-[#e05a5a] to-[#e0935a]";
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

function deadlineLabel(d?: string) {
  if (!d) return null;
  const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, urgent: true };
  if (days === 0) return { text: "Due today", urgent: true };
  if (days <= 7) return { text: `${days}d left`, urgent: false };
  return { text: `${days}d`, urgent: false };
}

const STATUS_FILTERS = ["All", "active", "paused", "planning", "reviewing", "shipped"];
const SORT_OPTIONS = [
  { label: "Last Updated", value: "updatedAt" },
  { label: "Deadline",     value: "deadline"  },
  { label: "Name",         value: "name"      },
];

export default function ProjectsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;

  const [projects,      setProjects]      = useState<Project[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [usingMock,     setUsingMock]     = useState(false);
  const [statusFilter,  setStatusFilter]  = useState("All");
  const [sort,          setSort]          = useState("updatedAt");

  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (sessionStatus === "unauthenticated" || !userId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({ userId, sort });
    if (statusFilter !== "All") params.set("status", statusFilter);

    fetch(`/api/projects?${params}`)
      .then(r => r.json())
      .then((data: Project[]) => {
        setProjects(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setProjects([]);
      })
      .finally(() => setLoading(false));
  }, [sessionStatus, userId, statusFilter, sort]);

  const featured = projects[0];
  const grid     = projects.slice(1);

  // Overall fleet stats
  const totalTasks = projects.reduce((acc, p) => acc + (p.tasks?.length || 0), 0);
  const completedTasks = projects.reduce((acc, p) => acc + (p.tasks?.filter(t => t.status === "done").length || 0), 0);
  const fleetCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* ── Heading + Stats ── */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1
            className="text-[#f0ead6] text-3xl sm:text-4xl font-light"
            style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
          >
            Your Projects
          </h1>
          <p className="text-[#8a8a9a] text-sm mt-1 max-w-lg">
            {loading
              ? "Loading your projects…"
              : sessionStatus === "unauthenticated"
                ? "Sign in to see your real fleet."
                : `${projects.length} project${projects.length !== 1 ? "s" : ""} in your workspace.`}
          </p>
          {/* We do not need the usingMock banner anymore */}
        </div>
        <div className="flex gap-8 text-right">
          <div>
            <p className="text-[#8a8a9a] text-[9px] tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Active</p>
            <p className="text-[#c9a84c] text-xl font-mono">{projects.filter(p => p.status === "active").length}</p>
          </div>
          <div>
            <p className="text-[#8a8a9a] text-[9px] tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Shipped</p>
            <p className="text-[#c9a84c] text-xl font-mono">{projects.filter(p => p.status === "shipped").length}</p>
          </div>
          <div>
            <p className="text-[#8a8a9a] text-[9px] tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Fleet</p>
            <p className="text-[#c9a84c] text-xl font-mono">{fleetCompletion}%</p>
          </div>
        </div>
      </div>

      {/* ── Fleet-wide progress bar ── */}
      {!loading && projects.length > 0 && (
        <div>
          <div className="flex justify-between text-[9px] mb-1">
            <span className="text-[#8a8a9a] tracking-widest uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Fleet Progress</span>
            <span className="text-[#c9a84c] font-mono">{completedTasks} / {totalTasks} tasks</span>
          </div>
          <div className="w-full h-1.5 bg-[#1a1c28] rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${progressBarColor(fleetCompletion)} rounded-full transition-all duration-700`} style={{ width: `${fleetCompletion}%` }} />
          </div>
        </div>
      )}

      {/* ── Filters + Sort ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#c9a84c]/10 pb-4">
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`text-[10px] tracking-[0.12em] uppercase px-3 py-1.5 border transition-all ${
                statusFilter === f
                  ? "border-[#c9a84c] text-[#c9a84c] bg-[#c9a84c]/8"
                  : "border-[#c9a84c]/15 text-[#8a8a9a] hover:border-[#c9a84c]/35 hover:text-[#f0ead6]"
              }`}
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#8a8a9a]">
          <span>Sort:</span>
          {SORT_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => setSort(o.value)}
              className={`${sort === o.value ? "text-[#f0ead6] underline underline-offset-4" : "hover:text-[#f0ead6]"} transition-colors`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-[#c9a84c]/8 bg-[#0e1018] p-5 h-48 animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && projects.length === 0 && (
        <div className="border border-dashed border-[#c9a84c]/15 py-24 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 mb-6 opacity-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
              <path d="M11 5l-5 8h5V5z" strokeWidth="1.5" />
              <path d="M13 5v8h5.5C18.5 9 16 6.5 13 5z" strokeWidth="1.5" />
              <path d="M3.5 14.5h17l-1.5 2c-1.5 1-3.5 1-5 0s-3.5-1-5 0-3.5 1-5 0L3.5 14.5z" fill="currentColor" stroke="none" />
              <path d="M3.5 19.5c1.5 1 3.5 1 5 0s3.5-1 5 0 3.5 1 5 0" strokeWidth="1.5" />
            </svg>
          </div>
          <h2 className="text-[#f0ead6] text-3xl font-light mb-3" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>
            {statusFilter === "All" ? "The Atelier is Empty" : `No ${statusFilter} projects.`}
          </h2>
          <p className="text-[#8a8a9a]/70 text-xs sm:text-sm max-w-md px-4 leading-relaxed mb-8">
            {statusFilter === "All" 
              ? "Every great legacy begins with a single design. Your manifesting table awaits its first grand endeavor."
              : "No projects match the current filter. Try selecting 'All' or start a new commission."}
          </p>
          <Link
            href="/projects/new"
            className="flex items-center gap-2 border border-[#c9a84c]/40 text-[#c9a84c] text-[10px] tracking-[0.18em] uppercase py-3 px-8 hover:bg-[#c9a84c]/8 hover:border-[#c9a84c]/80 transition-all"
            style={{ fontFamily: "var(--font-cinzel)", fontWeight: "600" }}
          >
            Create One
          </Link>
        </div>
      )}

      {/* ── Featured (first) Project ── */}
      {!loading && featured && (
        <Link
          href={`/projects/${featured._id}`}
          className="block border border-[#c9a84c]/15 bg-[#0e1018] p-6 hover:border-[#c9a84c]/35 transition-all group"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`text-[8px] tracking-[0.15em] uppercase px-2 py-0.5 font-bold ${statusBadge(featured.status)}`}
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  {featured.status}
                </span>
                <span className="text-[#8a8a9a] text-[9px] tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>
                  {(featured.completionPercent ?? 0)}% Complete
                </span>
                {featured.deadline && (() => {
                  const dl = deadlineLabel(featured.deadline);
                  return dl ? <span className={`text-[8px] tracking-wider uppercase ${dl.urgent ? "text-[#e05a5a]" : "text-[#8a8a9a]"}`}>⏱ {dl.text}</span> : null;
                })()}
              </div>
              <h2 className="text-[#f0ead6] text-2xl font-light mb-2 group-hover:text-[#c9a84c] transition-colors" style={{ fontFamily: "var(--font-cormorant)" }}>
                {featured.name}
              </h2>
              {featured.description && (
                <p className="text-[#8a8a9a] text-sm mb-4 max-w-xl">{featured.description}</p>
              )}
              <div className="flex gap-2 mb-4 flex-wrap">
                {featured.stack.map(t => (
                  <span key={t} className="text-[9px] border border-[#c9a84c]/15 text-[#8a8a9a] px-2 py-0.5 tracking-wider uppercase">{t}</span>
                ))}
              </div>
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[9px] mb-1">
                  <span className="text-[#8a8a9a] tracking-widest uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Progress</span>
                  <span className="text-[#c9a84c] font-mono">{featured.completionPercent ?? 0}%</span>
                </div>
                <div className="w-full max-w-md h-1.5 bg-[#1a1c28] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${progressBarColor(featured.completionPercent ?? 0)} transition-all duration-700`}
                    style={{ width: `${featured.completionPercent ?? 0}%` }}
                  />
                </div>
                <p className="text-[8px] text-[#8a8a9a] mt-1">
                  {featured.tasks.filter(t => t.status === "done").length} / {featured.tasks.length} tasks completed
                </p>
              </div>
            </div>
            {/* Right stats */}
            <div className="flex flex-col items-center">
              <svg viewBox="0 0 80 80" className="w-20 h-20">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#1a1c28" strokeWidth="5" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="#c9a84c" strokeWidth="5"
                  strokeDasharray={`${(featured.completionPercent ?? 0) * 2.01} ${(100 - (featured.completionPercent ?? 0)) * 2.01}`}
                  strokeLinecap="round" transform="rotate(-90 40 40)" className="transition-all duration-700" />
                <text x="40" y="44" textAnchor="middle" className="fill-[#c9a84c]" fontSize="16" fontFamily="monospace">{featured.completionPercent ?? 0}%</text>
              </svg>
            </div>
          </div>
        </Link>
      )}

      {/* ── Project Grid ── */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grid.map(p => {
            const pct = p.completionPercent ?? 0;
            const dl = deadlineLabel(p.deadline);
            return (
              <Link
                key={p._id}
                href={`/projects/${p._id}`}
                className="border border-[#c9a84c]/12 bg-[#0e1018] p-5 hover:border-[#c9a84c]/30 transition-all group flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[8px] tracking-[0.12em] uppercase px-2 py-0.5 font-bold ${statusBadge(p.status)}`} style={{ fontFamily: "var(--font-cinzel)" }}>
                    {p.status}
                  </span>
                  {dl && <span className={`text-[8px] tracking-wider uppercase ${dl.urgent ? "text-[#e05a5a]" : "text-[#8a8a9a]"}`}>⏱ {dl.text}</span>}
                </div>
                <h3 className="text-[#f0ead6] text-sm font-medium mb-1 group-hover:text-[#c9a84c] transition-colors">{p.name}</h3>
                <p className="text-[#8a8a9a] text-xs mb-3 flex-1 line-clamp-2">{p.description}</p>
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {p.stack.slice(0, 3).map(t => (
                    <span key={t} className="text-[8px] border border-[#c9a84c]/15 text-[#8a8a9a] px-1.5 py-0.5 tracking-wider uppercase">{t}</span>
                  ))}
                  {p.stack.length > 3 && (
                    <span className="text-[8px] text-[#8a8a9a]/50 px-1">+{p.stack.length - 3}</span>
                  )}
                </div>
                {/* Progress */}
                <div className="mt-auto">
                  <div className="flex justify-between items-center text-[9px] mb-1">
                    <span className="text-[#8a8a9a] tracking-widest uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>
                      {pct}%
                    </span>
                    <span className="text-[#8a8a9a] text-[8px]">
                      {p.tasks.filter(t => t.status === "done").length}/{p.tasks.length}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1a1c28] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${progressBarColor(pct)} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}

          {/* New Project CTA card */}
          <Link
            href="/projects/new"
            className="border border-dashed border-[#c9a84c]/20 bg-transparent p-5 flex flex-col items-center justify-center text-center hover:border-[#c9a84c]/40 hover:bg-[#c9a84c]/3 transition-all min-h-[200px]"
          >
            <div className="w-10 h-10 border border-[#c9a84c]/30 rounded-full flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-5 h-5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <h3 className="text-[#c9a84c] text-sm italic mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>
              New Architectural Vision
            </h3>
            <p className="text-[#8a8a9a] text-xs max-w-[180px]">
              The shipyard stands ready for your next grand design.
            </p>
            <span
              className="text-[#c9a84c] text-[10px] tracking-[0.15em] uppercase mt-3 border border-[#c9a84c]/30 px-4 py-1.5"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              Declare Build
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
