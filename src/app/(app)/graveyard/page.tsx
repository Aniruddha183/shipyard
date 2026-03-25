"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// ── Fallback mock data (shown when DB returns nothing) ──────────────────────
const MOCK_TOMBSTONES = [
  {
    _id: "g1",
    code: "SY-AT-701",
    name: "LuminaOS",
    description: "A distributed operating system for remote instrumented environments.",
    finalPulse: 64,
    stack: ["Rust", "Assembly"],
    mortem: "Nov 16, 7855",
    abandonedAt: null,
  },
  {
    _id: "g2",
    code: "SY-75-321",
    name: "Project Aether",
    description: "Real-time mesh networking protocol for satellite autonomous systems.",
    finalPulse: 12,
    stack: ["C++", "UX"],
    mortem: "May 12, 8813",
    abandonedAt: null,
  },
  {
    _id: "g3",
    code: "SY-AT-448",
    name: "Sentient-JS",
    description: "A framework that predicts the next line of code from developer bias.",
    finalPulse: 88,
    stack: ["TypeScript", "TensorFlow"],
    mortem: "Feb 22, 9021",
    abandonedAt: null,
  },
  {
    _id: "g4",
    code: "SY-BF-396",
    name: "Vault-Key",
    description: "Physical hardware security key built on non-volatile shuttle memory.",
    finalPulse: 45,
    stack: ["Solidity", "Hardware"],
    mortem: "Jul 04, 7810",
    abandonedAt: null,
  },
];

// ── Types ───────────────────────────────────────────────────────────────────
interface Tombstone {
  _id: string;
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
  const [tombstones, setTombstones] = useState<Tombstone[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fetch all abandoned projects (no userId filter — community graveyard)
    fetch("/api/projects?status=abandoned")
      .then((r) => r.json())
      .then((data: Tombstone[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setTombstones(data);
          setUsingMock(false);
        } else {
          setTombstones(MOCK_TOMBSTONES as Tombstone[]);
          setUsingMock(true);
        }
      })
      .catch(() => {
        setTombstones(MOCK_TOMBSTONES as Tombstone[]);
        setUsingMock(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* ── Hero ── */}
      <div className="mb-6">
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
        {usingMock && (
          <p className="text-[#e05a5a]/60 text-[9px] tracking-[0.12em] uppercase mt-2" style={{ fontFamily: "var(--font-cinzel)" }}>
            ◈ Preview data — retire a project to populate the graveyard
          </p>
        )}
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
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tombstones.map((t) => {
            const pulse  = calcFinalPulse(t);
            const code   = t.code ?? buildCode(t._id);
            const mortem = formatMortem(t);

            return (
              <div
                key={t._id}
                className="border border-[#6b1a2a]/20 bg-[#0e1018] p-5 hover:border-[#6b1a2a]/40 transition-all"
              >
                {/* Code + skull */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#8a8a9a] text-[9px] font-mono">{code}</span>
                  <span className="text-[#6b1a2a] opacity-60">💀</span>
                </div>

                {/* Name */}
                <h3
                  className="text-[#f0ead6] text-lg mb-2"
                  style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
                >
                  {t.name}
                </h3>

                <p className="text-[#8a8a9a] text-xs mb-4 line-clamp-2">{t.description}</p>

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
                  <Link
                    href={`/projects/${t._id}`}
                    className="text-[#c9a84c] tracking-[0.12em] uppercase hover:text-[#e8c96a] transition-colors"
                    style={{ fontFamily: "var(--font-cinzel)" }}
                  >
                    Review Autopsy
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Retire a Project CTA */}
          <div className="border border-dashed border-[#6b1a2a]/20 bg-transparent p-5 flex flex-col items-center justify-center text-center min-h-[200px]">
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
          </div>
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
