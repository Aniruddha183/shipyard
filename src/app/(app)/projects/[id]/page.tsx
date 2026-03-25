"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "todo" | "inprogress" | "done";
}
interface Project {
  _id: string; name: string; description: string; stack: string[];
  status: string; tasks: Task[]; deadline?: string; completionPercent?: number;
}

const PRIORITY_OPTIONS = [
  { value: "low",      label: "Low",      color: "text-[#8a8a9a]", bg: "bg-[#8a8a9a]/10 border-[#8a8a9a]/20" },
  { value: "medium",   label: "Medium",   color: "text-[#c9a84c]", bg: "bg-[#c9a84c]/10 border-[#c9a84c]/20" },
  { value: "high",     label: "High",     color: "text-[#e0935a]", bg: "bg-[#e0935a]/10 border-[#e0935a]/20" },
  { value: "critical", label: "Critical", color: "text-[#e05a5a]", bg: "bg-[#e05a5a]/10 border-[#e05a5a]/20" },
];

function priorityMeta(p: string) {
  return PRIORITY_OPTIONS.find(o => o.value === p) || PRIORITY_OPTIONS[1];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAbandon, setShowAbandon] = useState(false);
  const [abandoning, setAbandoning] = useState(false);
  // New task form
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<string>("medium");
  const [savingTask, setSavingTask] = useState(false);
  // Editing
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingPriority, setEditingPriority] = useState<string>("medium");
  // Task detail expand
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  /* --- Fetch project --- */
  const loadProject = useCallback(() => {
    fetch(`/api/projects/${projectId}`)
      .then(r => r.json())
      .then(data => { setProject(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { loadProject(); }, [loadProject]);

  /* --- Computed values --- */
  const todoTasks = project?.tasks.filter(t => t.status !== "done") ?? [];
  const doneTasks = project?.tasks.filter(t => t.status === "done") ?? [];
  const completionPercent = project?.completionPercent ?? 0;

  /* --- Toggle task status --- */
  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    loadProject();
  };

  /* --- Change task status to inprogress --- */
  const setTaskInProgress = async (taskId: string) => {
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "inprogress" }),
    });
    loadProject();
  };

  /* --- Add new task --- */
  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setSavingTask(true);
    await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTaskTitle,
        description: newTaskDescription,
        priority: newTaskPriority,
      }),
    });
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority("medium");
    setAddingTask(false);
    setSavingTask(false);
    loadProject();
  };

  /* --- Delete task --- */
  const deleteTask = async (taskId: string) => {
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
    loadProject();
  };

  /* --- Save inline edit --- */
  const saveEdit = async () => {
    if (!editingTaskId || !editingTitle.trim()) return;
    await fetch(`/api/projects/${projectId}/tasks/${editingTaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editingTitle,
        description: editingDescription,
        priority: editingPriority,
      }),
    });
    setEditingTaskId(null);
    setEditingTitle("");
    setEditingDescription("");
    setEditingPriority("medium");
    loadProject();
  };

  const startEditing = (t: Task) => {
    setEditingTaskId(t._id);
    setEditingTitle(t.title);
    setEditingDescription(t.description || "");
    setEditingPriority(t.priority || "medium");
  };

  /* --- Abandon project --- */
  const handleAbandon = async () => {
    setAbandoning(true);
    await fetch(`/api/projects/${projectId}/abandon`, { method: "POST" });
    router.push("/graveyard");
  };

  /* --- Loading / not found --- */
  if (loading) return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-pulse">
      <div className="h-12 bg-[#0e1018] border border-[#c9a84c]/8 w-1/2" />
      <div className="h-4 bg-[#0e1018] border border-[#c9a84c]/8 w-1/3" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-48 bg-[#0e1018] border border-[#c9a84c]/8" />
        <div className="h-48 bg-[#0e1018] border border-[#c9a84c]/8" />
      </div>
    </div>
  );

  if (!project) return (
    <div className="max-w-[1200px] mx-auto text-center py-24">
      <p className="text-[#8a8a9a] text-sm">Project not found or access denied.</p>
      <Link href="/projects" className="text-[#c9a84c] text-[10px] tracking-widest uppercase mt-4 inline-block">← Back to Projects</Link>
    </div>
  );

  /* Task card component */
  const TaskCard = ({ t, isDone }: { t: Task; isDone: boolean }) => {
    const pm = priorityMeta(t.priority);
    const isExpanded = expandedTaskId === t._id;
    const isEditing = editingTaskId === t._id;

    return (
      <div className={`border ${isDone ? "border-[#5ae0a0]/10" : "border-[#c9a84c]/15"} bg-[#0e1018] p-4 group ${isDone ? "opacity-70" : ""}`}>
        {/* Top row */}
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className={`text-[8px] tracking-[0.1em] uppercase px-1.5 py-0.5 border font-bold ${pm.bg} ${pm.color}`} style={{ fontFamily: "var(--font-cinzel)" }}>
              {pm.label}
            </span>
            <p className="text-[#8a8a9a] text-[9px] font-mono">{t._id.slice(-6).toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isDone && (
              <>
                {t.status !== "inprogress" && (
                  <button onClick={() => setTaskInProgress(t._id)} className="text-[#c9a84c]/50 hover:text-[#c9a84c] transition-colors p-0.5" title="In Progress">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M5 3l14 9-14 9V3z" /></svg>
                  </button>
                )}
                <button onClick={() => toggleTask(t._id, t.status)} className="text-[#5ae0a0]/50 hover:text-[#5ae0a0] transition-colors p-0.5" title="Mark done">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M20 6L9 17l-5-5" /></svg>
                </button>
                <button onClick={() => startEditing(t)} className="text-[#c9a84c]/50 hover:text-[#c9a84c] transition-colors p-0.5" title="Edit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
              </>
            )}
            {isDone && (
              <button onClick={() => toggleTask(t._id, t.status)} className="text-[#c9a84c]/50 hover:text-[#c9a84c] transition-colors p-0.5" title="Move back to Todo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M3 12h18M3 12l6-6M3 12l6 6" /></svg>
              </button>
            )}
            <button onClick={() => deleteTask(t._id)} className="text-[#e05a5a]/50 hover:text-[#e05a5a] transition-colors p-0.5" title="Delete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3 mt-2">
            <input value={editingTitle} onChange={e => setEditingTitle(e.target.value)}
              className="w-full bg-transparent border-b border-[#c9a84c]/40 outline-none text-[#f0ead6] text-sm py-1" autoFocus
              placeholder="Task title..."
              onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingTaskId(null); }} />
            <textarea value={editingDescription} onChange={e => setEditingDescription(e.target.value)}
              className="w-full bg-transparent border border-[#c9a84c]/20 outline-none text-[#f0ead6] text-xs p-2 resize-none"
              rows={2} placeholder="Task details (optional)..." />
            <div className="flex items-center gap-2">
              <span className="text-[#8a8a9a] text-[9px] tracking-wider uppercase">Priority:</span>
              {PRIORITY_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setEditingPriority(o.value)}
                  className={`text-[8px] tracking-wider uppercase px-2 py-0.5 border transition-all ${
                    editingPriority === o.value ? `${o.bg} ${o.color}` : "border-[#c9a84c]/10 text-[#8a8a9a] hover:text-[#f0ead6]"
                  }`}>{o.label}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={saveEdit} className="text-[#5ae0a0] text-[9px] tracking-wider uppercase border border-[#5ae0a0]/30 px-3 py-1 hover:bg-[#5ae0a0]/10 transition-all">Save</button>
              <button onClick={() => setEditingTaskId(null)} className="text-[#8a8a9a] text-[9px] tracking-wider uppercase px-3 py-1 hover:text-[#f0ead6] transition-colors">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {isDone && (
                <span className="w-4 h-4 bg-[#1a4a35] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#5ae0a0" strokeWidth="3" className="w-2.5 h-2.5"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
              )}
              {t.status === "inprogress" && !isDone && (
                <span className="w-4 h-4 bg-[#c9a84c]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#c9a84c] animate-pulse" />
                </span>
              )}
              <h4 className={`text-sm font-medium ${isDone ? "text-[#f0ead6] line-through opacity-70" : "text-[#f0ead6]"}`}>{t.title}</h4>
            </div>
            {/* Description preview / expand */}
            {t.description && (
              <button onClick={() => setExpandedTaskId(isExpanded ? null : t._id)} className="mt-1.5 text-left w-full">
                <p className={`text-[#8a8a9a] text-xs ${isExpanded ? "" : "line-clamp-1"}`}>{t.description}</p>
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/projects" className="text-[#8a8a9a] hover:text-[#c9a84c] transition-colors text-xs">
              ← Projects
            </Link>
            <span className="text-[#c9a84c]/20">|</span>
            <span className="text-[8px] tracking-[0.15em] uppercase px-2 py-0.5 bg-[#1a4a35] text-[#5ae0a0] font-bold" style={{ fontFamily: "var(--font-cinzel)" }}>
              {project.status}
            </span>
            <span className="text-[#8a8a9a] text-xs font-mono">ID: {project._id.slice(-8).toUpperCase()}</span>
          </div>
          <h1 className="text-[#f0ead6] text-3xl sm:text-4xl lg:text-5xl font-light mb-2" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>
            {project.name}
          </h1>
          {project.description && (
            <p className="text-[#8a8a9a] text-sm italic mb-4" style={{ fontFamily: "var(--font-cormorant)" }}>{project.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {project.stack.map(t => (
              <span key={t} className="text-[9px] border border-[#c9a84c]/20 text-[#8a8a9a] px-2 py-0.5 tracking-wider uppercase">{t}</span>
            ))}
            {project.deadline && (
              <span className="text-[#8a8a9a] text-xs font-mono">
                📅 {new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
            <Link href={`/projects/${projectId}/edit`}
              className="text-[#c9a84c] text-[10px] tracking-[0.12em] uppercase hover:text-[#e8c96a] transition-colors ml-2 flex items-center gap-1"
              style={{ fontFamily: "var(--font-cinzel)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Project
            </Link>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 120 120" className="w-28 h-28">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#1a1c28" strokeWidth="6" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="#c9a84c" strokeWidth="6"
              strokeDasharray={`${completionPercent * 3.14} ${(100 - completionPercent) * 3.14}`}
              strokeLinecap="round" transform="rotate(-90 60 60)" className="transition-all duration-700" />
            <text x="60" y="55" textAnchor="middle" className="fill-[#c9a84c] text-2xl font-mono" fontSize="22" fontFamily="monospace">{completionPercent}%</text>
            <text x="60" y="72" textAnchor="middle" className="fill-[#8a8a9a]" fontSize="7" letterSpacing="2">COMPLETION</text>
          </svg>
          <p className="text-[#8a8a9a] text-[9px] tracking-widest uppercase mt-1" style={{ fontFamily: "var(--font-cinzel)" }}>
            {doneTasks.length} / {project.tasks.length} Tasks
          </p>
        </div>
      </div>

      {/* ── Progress bar (linear) ── */}
      <div>
        <div className="flex justify-between text-[9px] mb-1">
          <span className="text-[#8a8a9a] tracking-widest uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Overall Progress</span>
          <span className="text-[#c9a84c] font-mono">{completionPercent}%</span>
        </div>
        <div className="w-full h-2 bg-[#1a1c28] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] rounded-full transition-all duration-700" style={{ width: `${completionPercent}%` }} />
        </div>
        <div className="flex justify-between text-[8px] mt-1 text-[#8a8a9a]">
          <span>{doneTasks.length} completed</span>
          <span>{todoTasks.length} remaining</span>
        </div>
      </div>

      {/* ── Task Board + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] gap-6">
        {/* TO DO Column */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />
              <span className="text-[#f0ead6] text-xs font-bold tracking-widest uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>To Do</span>
            </div>
            <span className="text-[#8a8a9a] text-[10px] tracking-wider uppercase">{todoTasks.length} Tasks</span>
          </div>

          <div className="space-y-3">
            {todoTasks.map((t) => (
              <TaskCard key={t._id} t={t} isDone={false} />
            ))}
          </div>

          {/* Add task */}
          {addingTask ? (
            <div className="mt-3 border border-[#c9a84c]/20 bg-[#0e1018] p-4 space-y-3">
              <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="Task title..."
                className="w-full bg-transparent border-b border-[#c9a84c]/30 focus:border-[#c9a84c]/70 outline-none py-2 text-[#f0ead6] text-sm"
                autoFocus onKeyDown={e => { if (e.key === "Enter" && newTaskTitle.trim()) handleAddTask(); if (e.key === "Escape") setAddingTask(false); }} />
              <textarea value={newTaskDescription} onChange={e => setNewTaskDescription(e.target.value)}
                placeholder="Task description / details (optional)..."
                className="w-full bg-transparent border border-[#c9a84c]/15 focus:border-[#c9a84c]/40 outline-none p-2.5 text-[#f0ead6] text-xs resize-none"
                rows={2} />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[#8a8a9a] text-[9px] tracking-wider uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Priority:</span>
                {PRIORITY_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => setNewTaskPriority(o.value)}
                    className={`text-[9px] tracking-wider uppercase px-2.5 py-1 border transition-all ${
                      newTaskPriority === o.value ? `${o.bg} ${o.color}` : "border-[#c9a84c]/10 text-[#8a8a9a] hover:text-[#f0ead6]"
                    }`}>{o.label}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddTask} disabled={savingTask || !newTaskTitle.trim()}
                  className="bg-[#c9a84c] text-[#080810] text-[10px] tracking-[0.15em] uppercase px-4 py-1.5 font-bold disabled:opacity-50"
                  style={{ fontFamily: "var(--font-cinzel)" }}>
                  {savingTask ? "Saving..." : "Add Task"}
                </button>
                <button onClick={() => setAddingTask(false)} className="text-[#8a8a9a] text-[10px] tracking-[0.15em] uppercase px-4 py-1.5 hover:text-[#f0ead6] transition-colors" style={{ fontFamily: "var(--font-cinzel)" }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingTask(true)}
              className="w-full mt-3 border border-dashed border-[#c9a84c]/20 text-[#c9a84c]/50 text-[10px] tracking-[0.15em] uppercase py-3 hover:border-[#c9a84c]/40 hover:text-[#c9a84c] transition-all"
              style={{ fontFamily: "var(--font-cinzel)" }}>
              ⊕ Carve New Task
            </button>
          )}
        </div>

        {/* DONE Column */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5ae0a0]" />
              <span className="text-[#f0ead6] text-xs font-bold tracking-widest uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Done</span>
            </div>
            <span className="text-[#8a8a9a] text-[10px] tracking-wider uppercase">{doneTasks.length} Tasks</span>
          </div>
          <div className="space-y-3">
            {doneTasks.map(t => (
              <TaskCard key={t._id} t={t} isDone={true} />
            ))}
            {doneTasks.length === 0 && (
              <div className="border border-dashed border-[#5ae0a0]/10 p-6 text-center">
                <p className="text-[#8a8a9a] text-xs italic" style={{ fontFamily: "var(--font-cormorant)" }}>
                  No tasks completed yet. The journey begins with a single step.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          {/* Project Health */}
          <div className="border border-[#c9a84c]/12 bg-[#0e1018] p-5">
            <h3 className="text-[#f0ead6] text-base mb-4" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>Project Health</h3>
            <div className="space-y-3">
              {[
                { label: "Tasks Done", value: `${doneTasks.length} / ${project.tasks.length}` },
                { label: "Completion", value: `${completionPercent}%` },
                { label: "Status", value: project.status },
                { label: "Critical Tasks", value: String(todoTasks.filter(t => t.priority === "critical").length) },
                { label: "High Priority", value: String(todoTasks.filter(t => t.priority === "high").length) },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-xs border-b border-[#c9a84c]/8 pb-2 last:border-0 last:pb-0">
                  <span className="text-[#8a8a9a]">{row.label}</span>
                  <span className="text-[#c9a84c] font-mono">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Status Change */}
          <div className="border border-[#c9a84c]/12 bg-[#0e1018] p-5">
            <h4 className="text-[#8a8a9a] text-[9px] tracking-[0.15em] uppercase mb-3" style={{ fontFamily: "var(--font-cinzel)" }}>Change Status</h4>
            <div className="flex flex-col gap-2">
              {(["active", "paused", "planning", "reviewing", "shipped"] as const).map(s => (
                <button key={s}
                  onClick={async () => {
                    await fetch(`/api/projects/${projectId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: s }),
                    });
                    loadProject();
                  }}
                  className={`text-left text-[10px] tracking-[0.12em] uppercase px-3 py-2 border transition-all ${project.status === s
                    ? "border-[#c9a84c] text-[#c9a84c] bg-[#c9a84c]/8"
                    : "border-[#c9a84c]/10 text-[#8a8a9a] hover:border-[#c9a84c]/30 hover:text-[#f0ead6]"
                  }`} style={{ fontFamily: "var(--font-cinzel)" }}>
                  {project.status === s ? "✓ " : ""}{s}
                </button>
              ))}
            </div>
          </div>

          {/* Task breakdown by priority */}
          <div className="border border-[#c9a84c]/12 bg-[#0e1018] p-5">
            <h4 className="text-[#8a8a9a] text-[9px] tracking-[0.15em] uppercase mb-3" style={{ fontFamily: "var(--font-cinzel)" }}>Priority Breakdown</h4>
            <div className="space-y-2">
              {PRIORITY_OPTIONS.map(o => {
                const count = project.tasks.filter(t => t.priority === o.value && t.status !== "done").length;
                const total = project.tasks.filter(t => t.priority === o.value).length;
                return (
                  <div key={o.value} className="flex items-center gap-2">
                    <span className={`text-[8px] tracking-wider uppercase w-14 ${o.color}`}>{o.label}</span>
                    <div className="flex-1 h-1.5 bg-[#1a1c28] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500`}
                        style={{
                          width: total > 0 ? `${((total - count) / total) * 100}%` : "0%",
                          backgroundColor: o.value === "critical" ? "#e05a5a" : o.value === "high" ? "#e0935a" : o.value === "medium" ? "#c9a84c" : "#8a8a9a",
                        }} />
                    </div>
                    <span className="text-[#8a8a9a] text-[9px] font-mono w-8 text-right">{total - count}/{total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="border border-[#6b1a2a]/40 bg-[#6b1a2a]/8 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-[#e05a5a] text-xl mb-1" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>Finality &amp; Dissolution</h3>
          <p className="text-[#8a8a9a] text-sm">Retiring a project sends it to the Graveyard. The record remains, but the project is archived.</p>
        </div>
        <button onClick={() => setShowAbandon(true)}
          className="bg-[#6b1a2a] text-[#f0ead6] text-[10px] tracking-[0.18em] uppercase font-bold px-6 py-3 hover:bg-[#8a2236] transition-all flex-shrink-0"
          style={{ fontFamily: "var(--font-cinzel)" }}>
          Abandon Build
        </button>
      </div>

      {/* ── Abandon Modal ── */}
      {showAbandon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="border border-[#6b1a2a]/40 bg-[#0e1018] p-8 max-w-md w-full mx-4">
            <h3 className="text-[#e05a5a] text-xl mb-3" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>Confirm Dissolution</h3>
            <p className="text-[#8a8a9a] text-sm mb-6 italic" style={{ fontFamily: "var(--font-cormorant)" }}>
              &ldquo;This build will be buried. Its ghost will live in your graveyard forever.&rdquo;
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowAbandon(false)}
                className="flex-1 border border-[#c9a84c]/30 text-[#f0ead6] text-[10px] tracking-[0.15em] uppercase py-2.5"
                style={{ fontFamily: "var(--font-cinzel)" }}>Reconsider</button>
              <button onClick={handleAbandon} disabled={abandoning}
                className="flex-1 bg-[#6b1a2a] text-[#f0ead6] text-[10px] tracking-[0.15em] uppercase py-2.5 font-bold hover:bg-[#8a2236] transition-all disabled:opacity-50"
                style={{ fontFamily: "var(--font-cinzel)" }}>
                {abandoning ? "Retiring..." : "Retire This Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
