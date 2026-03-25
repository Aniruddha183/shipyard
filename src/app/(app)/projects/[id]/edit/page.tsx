"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const AVAILABLE_STACKS = [
  "Next.js", "React", "Node.js", "Python", "Rust", "Go", "TypeScript",
  "MongoDB", "PostgreSQL", "Redis", "Docker", "AWS", "K8S", "Tailwind",
  "GraphQL", "gRPC", "WebAssembly", "CUDA", "TensorFlow", "Solidity",
];

const STATUS_OPTIONS = [
  { value: "planning", label: "Planning", color: "bg-[#c9a84c] text-[#080810]" },
  { value: "active", label: "Active", color: "bg-[#1a4a35] text-[#5ae0a0]" },
  { value: "paused", label: "Paused", color: "bg-[#3a3520] text-[#c9a84c]" },
  { value: "reviewing", label: "Reviewing", color: "bg-[#c9a84c]/15 text-[#c9a84c]" },
  { value: "shipped", label: "Shipped", color: "bg-[#1a4a35] text-[#5ae0a0]" },
];

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  // Mock initial data — in production, fetch from API
  const [name, setName] = useState("The Obsidian Nexus");
  const [description, setDescription] = useState("Redefining edge-computing latency through artisanal packet-routing.");
  const [selectedStacks, setSelectedStacks] = useState<string[]>(["Rust", "WebAssembly"]);
  const [deadline, setDeadline] = useState("2024-10-14");
  const [visibility, setVisibility] = useState("public");
  const [status, setStatus] = useState("active");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleStack = (stack: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stack) ? prev.filter((s) => s !== stack) : [...prev, stack]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          stack: selectedStacks,
          deadline: deadline || null,
          visibility,
          status,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href={`/projects/${projectId}`}
            className="text-[#c9a84c]/50 text-[10px] tracking-[0.15em] uppercase hover:text-[#c9a84c] transition-colors mb-2 inline-block"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            ← Back to Project
          </Link>
          <h1
            className="text-[#f0ead6] text-3xl font-light"
            style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
          >
            Modify Blueprint
          </h1>
          <p className="text-[#8a8a9a] text-sm mt-1">Update your project&apos;s details.</p>
        </div>

        {/* Save indicator */}
        {saved && (
          <span className="text-[#5ae0a0] text-[10px] tracking-[0.15em] uppercase flex items-center gap-1.5" style={{ fontFamily: "var(--font-cinzel)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M20 6L9 17l-5-5" /></svg>
            Saved
          </span>
        )}
      </div>

      <div className="space-y-8">
        {/* ── Project Identity ── */}
        <section className="border border-[#c9a84c]/12 bg-[#0e1018] p-6">
          <h2 className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase mb-5" style={{ fontFamily: "var(--font-cinzel)" }}>
            Project Identity
          </h2>

          <div className="mb-5">
            <label className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ fontFamily: "var(--font-cinzel)" }}>
              Project Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b border-[#c9a84c]/30 focus:border-[#c9a84c]/70 outline-none py-2.5 text-[#f0ead6] text-sm tracking-wider transition-colors"
            />
          </div>

          <div>
            <label className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ fontFamily: "var(--font-cinzel)" }}>
              Project Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-transparent border border-[#c9a84c]/15 focus:border-[#c9a84c]/40 outline-none p-3 text-[#f0ead6] text-sm leading-relaxed transition-colors resize-none"
            />
          </div>
        </section>

        {/* ── Status ── */}
        <section className="border border-[#c9a84c]/12 bg-[#0e1018] p-6">
          <h2 className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase mb-5" style={{ fontFamily: "var(--font-cinzel)" }}>
            Operational Status
          </h2>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={`text-[10px] tracking-wider uppercase px-4 py-2 border transition-all ${
                  status === opt.value
                    ? `${opt.color} border-transparent`
                    : "border-[#c9a84c]/15 text-[#8a8a9a] hover:border-[#c9a84c]/40"
                }`}
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Technical Stack ── */}
        <section className="border border-[#c9a84c]/12 bg-[#0e1018] p-6">
          <h2 className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase mb-5" style={{ fontFamily: "var(--font-cinzel)" }}>
            Technical Armament
          </h2>
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
          <h2 className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase mb-5" style={{ fontFamily: "var(--font-cinzel)" }}>
            Launch Parameters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ fontFamily: "var(--font-cinzel)" }}>
                Projected Launch
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-transparent border-b border-[#c9a84c]/30 focus:border-[#c9a84c]/70 outline-none py-2.5 text-[#f0ead6] text-sm transition-colors [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ fontFamily: "var(--font-cinzel)" }}>
                Visibility
              </label>
              <div className="flex gap-2">
                {["public", "private"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setVisibility(v)}
                    className={`flex-1 text-[10px] tracking-wider uppercase px-3 py-2 border transition-all text-center ${
                      visibility === v
                        ? "border-[#c9a84c]/50 bg-[#c9a84c]/5 text-[#c9a84c]"
                        : "border-[#c9a84c]/10 text-[#8a8a9a] hover:border-[#c9a84c]/30"
                    }`}
                    style={{ fontFamily: "var(--font-cinzel)" }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Save ── */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#c9a84c] hover:bg-[#e8c96a] text-[#080810] font-bold py-4 tracking-[0.2em] text-[11px] uppercase transition-all duration-200 hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] disabled:opacity-50"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            {saving ? "Saving..." : "Save Modifications"}
          </button>
          <Link
            href={`/projects/${projectId}`}
            className="flex items-center justify-center border border-[#c9a84c]/25 text-[#8a8a9a] hover:text-[#f0ead6] py-4 px-8 text-[11px] tracking-[0.15em] uppercase transition-all"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
