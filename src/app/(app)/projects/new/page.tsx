"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

const AVAILABLE_STACKS = [
  "Next.js", "React", "Node.js", "Python", "Rust", "Go", "TypeScript",
  "MongoDB", "PostgreSQL", "Redis", "Docker", "AWS", "K8S", "Tailwind",
  "GraphQL", "gRPC", "WebAssembly", "CUDA", "TensorFlow", "Solidity",
];

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public — Visible to the guild" },
  { value: "private", label: "Private — Architect's eyes only" },
];

const PRIORITY_OPTIONS = [
  { value: "low",      label: "Low",      color: "text-[#8a8a9a]", bg: "bg-[#8a8a9a]/10 border-[#8a8a9a]/20" },
  { value: "medium",   label: "Medium",   color: "text-[#c9a84c]", bg: "bg-[#c9a84c]/10 border-[#c9a84c]/20" },
  { value: "high",     label: "High",     color: "text-[#e0935a]", bg: "bg-[#e0935a]/10 border-[#e0935a]/20" },
  { value: "critical", label: "Critical", color: "text-[#e05a5a]", bg: "bg-[#e05a5a]/10 border-[#e05a5a]/20" },
];

interface TaskInput {
  title: string;
  description: string;
  priority: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [deadline, setDeadline] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [tasks, setTasks] = useState<TaskInput[]>([
    { title: "", description: "", priority: "medium" },
    { title: "", description: "", priority: "medium" },
    { title: "", description: "", priority: "medium" },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);

  const toggleStack = (stack: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stack) ? prev.filter((s) => s !== stack) : [...prev, stack]
    );
  };

  const addTask = () => setTasks([...tasks, { title: "", description: "", priority: "medium" }]);
  const removeTask = (i: number) => {
    if (tasks.length <= 3) return;
    setTasks(tasks.filter((_, idx) => idx !== i));
    if (expandedTask === i) setExpandedTask(null);
    else if (expandedTask !== null && expandedTask > i) setExpandedTask(expandedTask - 1);
  };
  const updateTask = (i: number, field: keyof TaskInput, val: string) => {
    const copy = [...tasks];
    copy[i] = { ...copy[i], [field]: val };
    setTasks(copy);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Every project needs a name.";
    if (tasks.filter((t) => t.title.trim()).length < 3) e.tasks = "At least 3 tasks are required to commission.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (sessionStatus === "loading") {
      setErrors({ submit: "Session is still loading. Please wait a moment and try again." });
      return;
    }
    if (sessionStatus === "unauthenticated" || !userId) {
      setErrors({ submit: "You must be signed in to create a project." });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name,
          description,
          stack: selectedStacks,
          deadline: deadline || null,
          visibility,
          tasks: tasks
            .filter((t) => t.title.trim())
            .map(t => ({ title: t.title, description: t.description, priority: t.priority })),
        }),
      });

      if (res.ok) {
        const project = await res.json();
        router.push(`/projects/${project._id}`);
      } else {
        const data = await res.json();
        setErrors({ submit: data.error || "Failed to declare build." });
      }
    } catch {
      setErrors({ submit: "Network error. The shipyard is unreachable." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-[#f0ead6] text-3xl sm:text-4xl font-light"
            style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
          >
            Declare a Build
          </h1>
          <p className="text-[#8a8a9a] text-sm mt-1">
            Create a new project. Every great legacy starts with a single blueprint.
          </p>
        </div>
        <Link
          href="/projects"
          className="text-[#8a8a9a] hover:text-[#c9a84c] transition-colors text-xs tracking-[0.15em] uppercase"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          Cancel
        </Link>
      </div>

      <div className="space-y-8">
        {/* ── Project Identity ── */}
        <section className="border border-[#c9a84c]/12 bg-[#0e1018] p-6">
          <h2
            className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase mb-5"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Project Identity
          </h2>

          {/* Project Name */}
          <div className="mb-5">
            <label className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ fontFamily: "var(--font-cinzel)" }}>
              Project Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="The Obsidian Nexus"
              className="w-full bg-transparent border-b border-[#c9a84c]/30 focus:border-[#c9a84c]/70 outline-none py-2.5 text-[#f0ead6] placeholder:text-[#8a8a9a]/30 text-sm tracking-wider transition-colors"
            />
            {errors.name && <p className="text-[#e05a5a] text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ fontFamily: "var(--font-cinzel)" }}>
              Project Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A one-line description of your architectural vision..."
              rows={2}
              className="w-full bg-transparent border border-[#c9a84c]/15 focus:border-[#c9a84c]/40 outline-none p-3 text-[#f0ead6] placeholder:text-[#8a8a9a]/30 text-sm leading-relaxed transition-colors resize-none"
            />
          </div>
        </section>

        {/* ── Technical Stack ── */}
        <section className="border border-[#c9a84c]/12 bg-[#0e1018] p-6">
          <h2
            className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase mb-5"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Technical Armament
          </h2>
          <p className="text-[#8a8a9a] text-xs mb-4">Select the technologies for your project.</p>

          <div className="flex flex-wrap gap-2">
            {AVAILABLE_STACKS.map((stack) => {
              const selected = selectedStacks.includes(stack);
              return (
                <button
                  key={stack}
                  onClick={() => toggleStack(stack)}
                  className={`text-[10px] tracking-wider uppercase px-3 py-1.5 border transition-all ${
                    selected
                      ? "border-[#c9a84c] bg-[#c9a84c]/15 text-[#c9a84c]"
                      : "border-[#c9a84c]/15 text-[#8a8a9a] hover:border-[#c9a84c]/40 hover:text-[#f0ead6]"
                  }`}
                >
                  {selected && "✓ "}{stack}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Launch Parameters ── */}
        <section className="border border-[#c9a84c]/12 bg-[#0e1018] p-6">
          <h2
            className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase mb-5"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Launch Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Deadline */}
            <div>
              <label className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ fontFamily: "var(--font-cinzel)" }}>
                Projected Launch Date
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-transparent border-b border-[#c9a84c]/30 focus:border-[#c9a84c]/70 outline-none py-2.5 text-[#f0ead6] text-sm tracking-wider transition-colors [color-scheme:dark]"
              />
            </div>

            {/* Visibility */}
            <div>
              <label className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ fontFamily: "var(--font-cinzel)" }}>
                Visibility
              </label>
              <div className="flex flex-col gap-2 mt-1">
                {VISIBILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setVisibility(opt.value)}
                    className={`flex items-center gap-3 px-3 py-2 border text-left text-xs transition-all ${
                      visibility === opt.value
                        ? "border-[#c9a84c]/50 bg-[#c9a84c]/5 text-[#f0ead6]"
                        : "border-[#c9a84c]/10 text-[#8a8a9a] hover:border-[#c9a84c]/30"
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full border flex-shrink-0 flex items-center justify-center ${
                      visibility === opt.value ? "border-[#c9a84c] bg-[#c9a84c]" : "border-[#8a8a9a]/40"
                    }`}>
                      {visibility === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-[#080810]" />}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Initial Blueprints (Tasks) ── */}
        <section className="border border-[#c9a84c]/12 bg-[#0e1018] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                Initial Blueprints *
              </h2>
              <p className="text-[#8a8a9a] text-xs mt-1">Minimum 3 tasks required. Click the expand icon to add details & priority.</p>
            </div>
            <span className="text-[#c9a84c]/40 text-xs font-mono">{tasks.filter(t => t.title.trim()).length} / {tasks.length}</span>
          </div>

          <div className="space-y-3">
            {tasks.map((task, i) => {
              const isExpanded = expandedTask === i;
              const pm = PRIORITY_OPTIONS.find(o => o.value === task.priority) || PRIORITY_OPTIONS[1];
              return (
                <div key={i} className="border border-[#c9a84c]/10 bg-[#0a0b12] p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[#c9a84c]/30 text-xs font-mono w-6 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <input
                      value={task.title}
                      onChange={(e) => updateTask(i, "title", e.target.value)}
                      placeholder={`Task ${i + 1} — e.g. "Initialize repository and boilerplate"`}
                      className="flex-1 bg-transparent border-b border-[#c9a84c]/20 focus:border-[#c9a84c]/60 outline-none py-2 text-[#f0ead6] placeholder:text-[#8a8a9a]/25 text-sm transition-colors"
                    />
                    {/* Priority badge */}
                    <span className={`text-[8px] tracking-wider uppercase px-1.5 py-0.5 border ${pm.bg} ${pm.color}`}>{pm.label}</span>
                    {/* Expand/Collapse */}
                    <button onClick={() => setExpandedTask(isExpanded ? null : i)} className="text-[#8a8a9a] hover:text-[#c9a84c] transition-colors p-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {tasks.length > 3 && (
                      <button
                        onClick={() => removeTask(i)}
                        className="text-[#e05a5a]/40 hover:text-[#e05a5a] transition-colors p-1"
                        aria-label="Remove task"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-3 ml-9 space-y-3">
                      <div>
                        <label className="text-[#8a8a9a] text-[9px] tracking-wider uppercase block mb-1">Description</label>
                        <textarea
                          value={task.description}
                          onChange={(e) => updateTask(i, "description", e.target.value)}
                          placeholder="Describe what this task involves, acceptance criteria, notes..."
                          rows={2}
                          className="w-full bg-transparent border border-[#c9a84c]/15 focus:border-[#c9a84c]/40 outline-none p-2 text-[#f0ead6] placeholder:text-[#8a8a9a]/25 text-xs resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[#8a8a9a] text-[9px] tracking-wider uppercase block mb-1.5">Priority</label>
                        <div className="flex gap-2">
                          {PRIORITY_OPTIONS.map(o => (
                            <button key={o.value} onClick={() => updateTask(i, "priority", o.value)}
                              className={`text-[9px] tracking-wider uppercase px-2.5 py-1 border transition-all ${
                                task.priority === o.value ? `${o.bg} ${o.color}` : "border-[#c9a84c]/10 text-[#8a8a9a] hover:text-[#f0ead6]"
                              }`}>{o.label}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {errors.tasks && <p className="text-[#e05a5a] text-xs mt-2">{errors.tasks}</p>}

          <button
            onClick={addTask}
            className="mt-4 text-[#c9a84c]/50 text-[10px] tracking-[0.15em] uppercase hover:text-[#c9a84c] transition-colors flex items-center gap-2"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Blueprint
          </button>
        </section>

        {/* ── Submit ── */}
        {errors.submit && (
          <div className="border border-[#e05a5a]/30 bg-[#e05a5a]/5 p-4 text-[#e05a5a] text-sm">
            {errors.submit}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting || sessionStatus === "loading"}
            className="flex-1 bg-[#c9a84c] hover:bg-[#e8c96a] text-[#080810] font-bold py-4 tracking-[0.2em] text-[11px] uppercase transition-all duration-200 hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            {sessionStatus === "loading"
              ? "Awaiting Clearance…"
              : submitting
                ? "Commissioning..."
                : "Create Project"}
          </button>
          <Link
            href="/projects"
            className="flex items-center justify-center border border-[#c9a84c]/25 text-[#8a8a9a] hover:text-[#f0ead6] hover:border-[#c9a84c]/50 py-4 px-8 text-[11px] tracking-[0.15em] uppercase transition-all"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Discard
          </Link>
        </div>
      </div>
    </div>
  );
}
