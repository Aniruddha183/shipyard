"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Task { _id: string; title: string; status: string; priority?: string; description?: string; }
interface Project {
  _id: string; name: string; description: string; stack: string[];
  status: string; tasks: Task[]; deadline?: string; completionPercent?: number;
}
interface LeaderboardUser { _id: string; username: string; avatar: string; streak: number; totalPoints: number; rank: number; }

/* ── Fallback mock data shown when DB has no records ── */
const MOCK_PROJECTS: Project[] = [
  { _id: "mock1", name: "Project Aegis", description: "Real-time encryption layer for distributed communication systems.", stack: ["Rust", "K8S", "gRPC"], status: "active", tasks: [{ _id: "t1", title: "Implement OAuth2 Flow", status: "todo" }, { _id: "t2", title: "Refactor API middleware", status: "done" }, { _id: "t3", title: "Setup K8S Cluster", status: "inprogress" }, { _id: "t4", title: "Define gRPC Proto files", status: "done" }], completionPercent: 50 },
  { _id: "mock2", name: "Neon Scribe", description: "Minimalist markdown editor with generative focus modes.", stack: ["Next.js", "Tailwind"], status: "paused", tasks: [{ _id: "t5", title: "Fix editor flickering", status: "todo" }, { _id: "t6", title: "Implement dark mode", status: "done" }], completionPercent: 50 },
  { _id: "mock3", name: "Voltaic Core", description: "Neural network training harness for LLM hyperparameter search.", stack: ["Python", "CUDA"], status: "planning", tasks: [{ _id: "t7", title: "Setup environment", status: "todo" }, { _id: "t8", title: "Define architecture", status: "todo" }, { _id: "t9", title: "Initial research", status: "done" }], completionPercent: 33 },
];
const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { _id: "l1", username: "V. Kaelen", avatar: "", streak: 12, totalPoints: 24, rank: 1 },
  { _id: "l2", username: "S. Thorne", avatar: "", streak: 8, totalPoints: 18, rank: 2 },
  { _id: "l3", username: "Captain Cipher", avatar: "", streak: 42, totalPoints: 15, rank: 3 },
];

function statusColor(s: string) {
  switch (s) {
    case "active": return "bg-[#1a4a35] text-[#5ae0a0]";
    case "paused": return "bg-[#3a3520] text-[#c9a84c]";
    case "planning": return "bg-[#c9a84c] text-[#080810]";
    default: return "bg-[#1a1c28] text-[#8a8a9a]";
  }
}

function deadlineLabel(d?: string) {
  if (!d) return null;
  const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  if (days < 0) return "⚠ OVERDUE";
  if (days === 0) return "⚠ DUE TODAY";
  return `${days} DAY${days === 1 ? "" : "S"} REMAINING`;
}

function priorityDot(p?: string) {
  switch (p) {
    case "critical": return "bg-[#e05a5a]";
    case "high": return "bg-[#e0935a]";
    case "medium": return "bg-[#c9a84c]";
    default: return "bg-[#8a8a9a]";
  }
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const [projects, setProjects] = useState<Project[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [graveyardOpen, setGraveyardOpen] = useState(false);

  /* --- Fetch live projects (fall back to mock if empty) --- */
  useEffect(() => {
    if (!userId) {
      setProjects(MOCK_PROJECTS);
      setLoadingProjects(false);
      return;
    }
    setLoadingProjects(true);
    fetch(`/api/projects?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setProjects(list.length > 0 ? list : MOCK_PROJECTS);
      })
      .catch(() => setProjects(MOCK_PROJECTS))
      .finally(() => setLoadingProjects(false));
  }, [userId]);

  /* --- Fetch leaderboard (fall back to mock if empty) --- */
  useEffect(() => {
    fetch("/api/leaderboard")
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setLeaderboard(list.length > 0 ? list : MOCK_LEADERBOARD);
      })
      .catch(() => setLeaderboard(MOCK_LEADERBOARD));
  }, []);

  /* --- Computed stats --- */
  const activeProjects = projects.filter(p => p.status !== "abandoned");
  const abandonedCount = projects.filter(p => p.status === "abandoned").length;
  const totalCompletedTasks = projects.reduce((acc, p) => acc + p.tasks.filter(t => t.status === "done").length, 0);
  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
  const completionRate = activeProjects.length > 0
    ? Math.round(activeProjects.reduce((acc, p) => acc + (p.completionPercent ?? 0), 0) / activeProjects.length)
    : 0;

  /* --- Today's tasks (all pending tasks across active projects) --- */
  const pendingTasks = activeProjects
    .flatMap(p => p.tasks.filter(t => t.status !== "done").map(t => ({ ...t, projectName: p.name, projectId: p._id })))
    .slice(0, 6);

  const sessionUser = session?.user as any;

  /* --- Toggle task done via API --- */
  const toggleTask = async (projectId: string, taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    // Refresh projects
    if (userId) {
      fetch(`/api/projects?userId=${userId}`)
        .then(r => r.json())
        .then(data => setProjects(Array.isArray(data) ? data : []));
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* ── Page Heading ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-[#f0ead6] text-3xl sm:text-4xl font-light" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>
            {sessionUser?.name ? `Welcome, ${sessionUser.name}` : "The Horizon of Your Week"}
          </h1>
          <p className="text-[#8a8a9a] text-sm mt-1 max-w-md italic" style={{ fontFamily: "var(--font-cormorant)" }}>
            &ldquo;The ship that stays in the harbor is safe, but that&apos;s not what ships are built for.&rdquo;
          </p>
        </div>
        <div className="text-right">
          <p className="text-[#8a8a9a] text-[9px] tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Local Time</p>
          <p className="text-[#c9a84c] text-xl font-mono">
            {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}{" "}
            <span className="text-[#c9a84c]/60 text-sm">UTC</span>
          </p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Projects", value: activeProjects.length.toString().padStart(2, "0"), sub: `${abandonedCount} in the Graveyard`, icon: "📦" },
          { label: "Completion Rate", value: `${completionRate}%`, ring: true, ringVal: completionRate, icon: "📊" },
          { label: "Tasks Remaining", value: pendingTasks.length.toString().padStart(2, "0"), sub: `${totalTasks} total tasks`, icon: "📋" },
          { label: "Points", value: (sessionUser?.totalPoints ?? totalCompletedTasks).toString(), sub: `${totalCompletedTasks} tasks completed`, icon: "⭐" },
        ].map((s) => (
          <div key={s.label} className="border border-[#c9a84c]/12 bg-[#0e1018] px-5 py-4 hover:border-[#c9a84c]/25 transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#8a8a9a] text-[9px] tracking-[0.18em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>{s.label}</p>
              <span className="text-sm opacity-60">{s.icon}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#f0ead6] text-2xl font-mono">{s.value}</span>
              {s.ring && (
                <svg viewBox="0 0 36 36" className="w-8 h-8">
                  <path d="M18 2.0845a15.9155 15.9155 0 010 31.831 15.9155 15.9155 0 010-31.831" fill="none" stroke="#1a1c28" strokeWidth="3" />
                  <path d="M18 2.0845a15.9155 15.9155 0 010 31.831 15.9155 15.9155 0 010-31.831" fill="none" stroke="#c9a84c" strokeWidth="3"
                    strokeDasharray={`${s.ringVal}, 100`} strokeLinecap="round" />
                </svg>
              )}
            </div>
            {s.sub && <p className="text-[10px] mt-1 text-[#8a8a9a]">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Active Projects + Leaderboard ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Active Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#f0ead6] text-xl font-light" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>Active Projects</h2>
            <Link href="/projects" className="text-[#c9a84c] text-[10px] tracking-[0.15em] uppercase hover:text-[#e8c96a] transition-colors" style={{ fontFamily: "var(--font-cinzel)" }}>
              View All Projects
            </Link>
          </div>

          {loadingProjects ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {[1, 2, 3].map(i => <div key={i} className="border border-[#c9a84c]/8 bg-[#0e1018] p-4 h-36 animate-pulse" />)}
            </div>
          ) : activeProjects.length === 0 ? (
            <div className="border border-dashed border-[#c9a84c]/15 p-8 text-center">
              <p className="text-[#8a8a9a] text-sm italic" style={{ fontFamily: "var(--font-cormorant)" }}>No projects created yet.</p>
              <Link href="/projects/new" className="text-[#c9a84c] text-[10px] tracking-[0.12em] uppercase mt-3 inline-block hover:text-[#e8c96a] transition-colors" style={{ fontFamily: "var(--font-cinzel)" }}>
                Create Your First Project →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {activeProjects.slice(0, 3).map((p) => {
                const pct = p.completionPercent ?? 0;
                const dl = deadlineLabel(p.deadline);
                return (
                  <Link key={p._id} href={`/projects/${p._id}`}
                    className="border border-[#c9a84c]/12 bg-[#0e1018] p-4 hover:border-[#c9a84c]/30 transition-all group flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[8px] tracking-[0.15em] uppercase px-2 py-0.5 font-bold ${statusColor(p.status)}`} style={{ fontFamily: "var(--font-cinzel)" }}>
                        {p.status}
                      </span>
                    </div>
                    <h3 className="text-[#f0ead6] text-sm font-medium mb-1">{p.name}</h3>
                    <p className="text-[#8a8a9a] text-xs mb-3 line-clamp-2 flex-1">{p.description}</p>
                    <div className="flex gap-1.5 mb-3 flex-wrap">
                      {p.stack.slice(0, 3).map((t) => (
                        <span key={t} className="text-[8px] border border-[#c9a84c]/15 text-[#8a8a9a] px-1.5 py-0.5 tracking-wider uppercase">{t}</span>
                      ))}
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-[9px] mb-1">
                        <span className="text-[#8a8a9a] tracking-widest uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Progress</span>
                        <span className="text-[#c9a84c] font-mono">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1a1c28] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${
                          pct >= 100 ? 'from-[#5ae0a0] to-[#3ec98a]' :
                          pct >= 60  ? 'from-[#c9a84c] to-[#e8c96a]' :
                          pct >= 30  ? 'from-[#e0935a] to-[#c9a84c]' :
                                       'from-[#e05a5a] to-[#e0935a]'
                        }`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[8px] text-[#8a8a9a] mt-0.5">{p.tasks.filter(t => t.status === 'done').length}/{p.tasks.length} tasks</p>
                    </div>
                    {dl && <p className="text-[8px] text-[#8a8a9a] tracking-widest uppercase mt-1">⏱ {dl}</p>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="border border-[#c9a84c]/12 bg-[#0e1018] p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#f0ead6] text-base" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>Leaderboard</h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-4 h-4">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div className="space-y-3 mb-4">
            {leaderboard.slice(0, 5).map((u) => (
              <div key={u._id} className="flex items-center gap-3">
                <span className="text-[#c9a84c]/60 text-sm font-mono w-6">{String(u.rank).padStart(2, "0")}</span>
                <div className="w-8 h-8 rounded-full bg-[#1a1c28] border border-[#c9a84c]/20 flex items-center justify-center text-[10px] text-[#8a8a9a]">
                  {u.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-[#f0ead6] text-xs font-medium">{u.username}</p>
                  <p className="text-[#8a8a9a] text-[9px] tracking-wider">{u.totalPoints} tasks completed</p>
                </div>
              </div>
            ))}
          </div>
          {sessionUser && (
            <div className="border border-[#c9a84c]/20 bg-[#c9a84c]/5 p-3 flex items-center gap-3">
              <span className="text-[#c9a84c] text-xs font-mono">{sessionUser.rank ?? "—"}</span>
              <div className="w-8 h-8 rounded-full bg-[#1a1c28] border border-[#c9a84c]/30 flex items-center justify-center text-[10px] text-[#c9a84c]">
                {sessionUser.name?.slice(0, 2).toUpperCase() ?? "ME"}
              </div>
              <div className="flex-1">
                <p className="text-[#c9a84c] text-xs font-medium">{sessionUser.name ?? "You"}</p>
                <p className="text-[#8a8a9a] text-[9px] tracking-wider">{(sessionUser.totalPoints ?? 0)} tasks completed</p>
              </div>
            </div>
          )}
          <Link href="/community" className="block text-center text-[#c9a84c]/50 text-[9px] tracking-[0.15em] uppercase mt-4 hover:text-[#c9a84c] transition-colors" style={{ fontFamily: "var(--font-cinzel)" }}>
            View Full Leaderboard
          </Link>
        </div>
      </div>

      {/* ── Pending Tasks ── */}
      <div>
        <h2 className="text-[#f0ead6] text-xl font-light mb-4" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>Pending Tasks</h2>
        {pendingTasks.length === 0 ? (
          <div className="border border-[#c9a84c]/8 bg-[#0e1018] p-4 text-center">
            <p className="text-[#5ae0a0] text-sm italic" style={{ fontFamily: "var(--font-cormorant)" }}>All tasks complete. Smooth sailing! 🎉</p>
          </div>
        ) : (
          <div className="space-y-1">
            {pendingTasks.map((t) => (
              <div key={t._id} className="flex items-center gap-3 border border-[#c9a84c]/8 bg-[#0e1018] px-4 py-3 transition-all hover:border-[#c9a84c]/20">
                <button
                  onClick={() => toggleTask((t as any).projectId, t._id, t.status)}
                  className={`w-5 h-5 border flex-shrink-0 flex items-center justify-center transition-all ${
                    t.status === "done" ? "bg-[#c9a84c] border-[#c9a84c]" : "border-[#c9a84c]/30 hover:border-[#c9a84c]/60"
                  }`}
                >
                  {t.status === "done" && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#080810" strokeWidth="3" className="w-3 h-3"><path d="M20 6L9 17l-5-5" /></svg>
                  )}
                </button>
                {/* Priority dot */}
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot(t.priority)}`} title={t.priority || "medium"} />
                <span className={`flex-1 text-sm ${t.status === "done" ? "text-[#8a8a9a] line-through" : "text-[#f0ead6]"}`}>{t.title}</span>
                <span className="text-[8px] text-[#8a8a9a] tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>
                  {(t as any).projectName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Graveyard strip ── */}
      <div className="border-t border-[#c9a84c]/8 pt-4">
        <button onClick={() => setGraveyardOpen(!graveyardOpen)} className="flex items-center gap-2 text-[#8a8a9a] hover:text-[#f0ead6] transition-colors w-full">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-4 h-4 transition-transform ${graveyardOpen ? "rotate-180" : ""}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
          <span className="text-lg" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>The Graveyard</span>
          <span className="ml-auto text-[9px] tracking-[0.15em] uppercase text-[#8a8a9a]/50" style={{ fontFamily: "var(--font-cinzel)" }}>
            {abandonedCount} Abandoned Project{abandonedCount !== 1 ? "s" : ""}
          </span>
        </button>
        {graveyardOpen && (
          <div className="mt-4 p-4 border border-[#6b1a2a]/30 bg-[#6b1a2a]/5 text-center">
            <p className="text-[#8a8a9a] text-sm italic" style={{ fontFamily: "var(--font-cormorant)" }}>
              {abandonedCount} project{abandonedCount !== 1 ? "s" : ""} rest{abandonedCount === 1 ? "s" : ""} here. Their lessons are your compass.
            </p>
            <Link href="/graveyard" className="text-[#c9a84c] text-[10px] tracking-[0.15em] uppercase mt-2 inline-block hover:text-[#e8c96a] transition-colors" style={{ fontFamily: "var(--font-cinzel)" }}>
              Visit Graveyard →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
