"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const problems = [
  {
    num: "01 —",
    title: '"I\'ll finish this after the weekend."',
    sub: "The weekend becomes a month. The month becomes a graveyard. There is no consequence, no witness, no record.",
  },
  {
    num: "02 —",
    title: "Shiny object syndrome is real.",
    sub: "Another idea sparks. You pivot. The previous project silently joins the seven others in your abandoned folders.",
  },
  {
    num: "03 —",
    title: "No one is watching. That's the problem.",
    sub: "Without public stakes, there is no friction to quitting. Accountability requires an audience — even a small one.",
  },
  {
    num: "04 —",
    title: "Your portfolio shows ships, not wrecks.",
    sub: "GitHub stars don't count half-built repos. ShipYard counts everything — including what you abandoned and why.",
  },
];

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]">
        <path d="M12 2l10 5-10 5L2 7l10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Project Declaration",
    desc: "Declare your build publicly. Name it, describe it, set a deadline, pick your stack. The moment it's public, the clock starts.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    title: "Task Architecture",
    desc: "Break every project into tasks. Drag them between To Do and Done. Your completion percentage is calculated live, visible to all.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "Community Leaderboard",
    desc: "Every builder ranked by streak and output. Your rank is public. Moving up requires shipping. Falling off requires explanation.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Daily Streak System",
    desc: "Complete at least one task per day. Your streak counter grows. Miss a day — it resets to zero. No mercy. No exceptions.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]">
        <rect x="3" y="3" width="18" height="18" rx="1" /><path d="M9 9h6M9 12h6M9 15h4" />
      </svg>
    ),
    title: "Activity Log",
    desc: "A timestamped trail of every task completed. Your building history, immutable and honest. A record you can be proud of — or ashamed of.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]">
        <path d="M10 17l-5-5 5-5M3 12h18" />
      </svg>
    ),
    title: "Public Profiles",
    desc: "Your ShipYard profile is your builder's ledger. Active projects, shipped builds, streak history — and yes, your graveyard. All public.",
  },
];

const steps = [
  { num: "01", title: "Declare", desc: "Name your build. Write a one-liner. Set a deadline. Choose your stack. Make it public. The commitment is now real." },
  { num: "02", title: "Architect", desc: "Break the project into tasks. Minimum three before you can begin. No task list, no build. Discipline before code." },
  { num: "03", title: "Build Daily", desc: "Complete at least one task per day to maintain your streak. Your progress is public. Your leaderboard rank is live." },
  { num: "04", title: "Ship or Bury", desc: "Complete every task and mark it shipped — or abandon it to the graveyard. Either way, you own the record forever." },
];

const tombstones = [
  { name: "landing-builder", pct: "23% complete" },
  { name: "accent-converter", pct: "8% complete" },
  { name: "fitnearn-v2", pct: "41% complete" },
  { name: "devlinks-clone", pct: "12% complete" },
  { name: "saas-boilerplate", pct: "55% complete" },
];

const leaderboard = [
  { rank: "01", initials: "RK", name: "raghav.k", pts: "980" },
  { rank: "02", initials: "PS", name: "priya.s", pts: "875" },
  { rank: "03", initials: "MD", name: "milan.d", pts: "760" },
];

/* ─────────────────────────────────────────
   SCROLL REVEAL HOOK
───────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".sy-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              (entry.target as HTMLElement).style.opacity = "1";
              (entry.target as HTMLElement).style.transform = "translateY(0)";
            }, i * 60);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─────────────────────────────────────────
   SMALL COMPONENTS
───────────────────────────────────────── */
function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`sy-reveal ${className}`}
      style={{ opacity: 0, transform: "translateY(24px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}
    >
      {children}
    </div>
  );
}

function GoldDivider() {
  return (
    <div
      className="h-px w-full opacity-40"
      style={{ background: "linear-gradient(90deg, transparent, #c9a84c, transparent)" }}
    />
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-px bg-[#c9a84c] opacity-50" />
      <p
        className="text-[#c9a84c] text-[8px] tracking-[0.3em] uppercase"
        style={{ fontFamily: "var(--font-cinzel)" }}
      >
        {children}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */
export default function LandingPage() {
  useScrollReveal();

  return (
    <div
      className="bg-[#080810] text-[#f0ead6] overflow-x-hidden min-h-screen"
      style={{ fontFamily: "var(--font-outfit)" }}
    >
      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-12 h-16"
        style={{
          borderBottom: "1px solid rgba(201,168,76,0.12)",
          background: "rgba(8,8,16,0.85)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div
            className="w-8 h-8 flex items-center justify-center"
            style={{ border: "1px solid rgba(201,168,76,0.25)" }}
          >
           <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#0B0F1A"/>

  <rect x="24" y="24" width="464" height="464"
        fill="none" stroke="#D4AF37" stroke-width="12"/>

  <g fill="#D4AF37">

    <path d="M180 270 L240 160 L240 270 Z"/>
    <path d="M205 250 L230 200 L230 250 Z" fill="#0B0F1A"/>

    <path d="M260 150
             Q340 190 350 270
             L260 270 Z"/>
    <path d="M280 180
             Q320 210 325 250
             L280 250 Z" fill="#0B0F1A"/>

    <path d="M160 290
             Q200 330 240 290
             Q280 330 320 290
             Q340 290 360 280
             L140 280
             Q150 290 160 290 Z"/>

    <path d="M150 340
             Q180 320 210 340
             Q240 360 270 340
             Q300 320 330 340
             L330 355
             Q300 335 270 355
             Q240 375 210 355
             Q180 335 150 355 Z"/>

    
  </g>
</svg>
          </div>
          <span
            className="text-[#f0ead6] text-[13px] tracking-[0.2em] font-medium"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            ShipYard
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-9">
          {["Features", "How It Works", "Community"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="text-[#8a8a9a] text-[9px] tracking-[0.18em] uppercase transition-colors hover:text-[#c9a84c] no-underline"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              {item}
            </Link>
          ))}
          <Link
            href="/signup"
            className="text-[#080810] bg-[#c9a84c] px-5 py-2 text-[9px] tracking-[0.18em] uppercase font-semibold transition-colors hover:bg-[#e8c96a] no-underline"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Enter the Yard
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-24 overflow-hidden"
        id="hero"
      >
        {/* radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.05) 0%, transparent 65%)" }}
        />

        {/* Est. rule */}
        <div
          className="flex items-center gap-5 mb-8"
          style={{ animation: "syFadeUp 0.8s ease 0.1s forwards", opacity: 0 }}
        >
          <div className="h-px w-12" style={{ background: "linear-gradient(90deg, transparent, #c9a84c, transparent)" }} />
          <span className="text-[#c9a84c] text-[8px] tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>
            Est. MMXXIV
          </span>
          <div className="h-px w-12" style={{ background: "linear-gradient(90deg, transparent, #c9a84c, transparent)" }} />
        </div>

        <p
          className="text-[#c9a84c] text-[8px] tracking-[0.35em] uppercase mb-6"
          style={{ fontFamily: "var(--font-cinzel)", animation: "syFadeUp 0.8s ease 0.2s forwards", opacity: 0 }}
        >
          The Developer Accountability Platform
        </p>

        <h1
          className="text-[#f0ead6] font-light italic leading-none mb-4 tracking-tight"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(56px, 8vw, 100px)",
            animation: "syFadeUp 1s ease 0.35s forwards",
            opacity: 0,
          }}
        >
          Declare.<br />
          <span className="text-[#c9a84c]">Ship.</span><br />
          Own the Graveyard.
        </h1>

        <p
          className="text-[#8a8a9a] italic font-light mb-12 max-w-xl leading-relaxed"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(18px, 2.5vw, 26px)",
            animation: "syFadeUp 0.8s ease 0.55s forwards",
            opacity: 0,
          }}
        >
          You have seven half-built projects. We know. ShipYard turns your ideas into public
          commitments — with streaks, leaderboards, and a graveyard that never lets you forget.
        </p>

        <div
          className="flex items-center gap-4 flex-wrap justify-center"
          style={{ animation: "syFadeUp 0.8s ease 0.75s forwards", opacity: 0 }}
        >
          <Link
            href="/signup"
            className="flex items-center gap-2 bg-[#c9a84c] text-[#080810] px-9 py-3.5 text-[9px] tracking-[0.2em] uppercase font-semibold transition-all hover:bg-[#e8c96a] hover:-translate-y-px no-underline"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
            </svg>
            Commission via GitHub
          </Link>
          <Link
            href="#features"
            className="flex items-center gap-2 text-[#8a8a9a] px-9 py-3.5 text-[9px] tracking-[0.2em] uppercase transition-all hover:text-[#c9a84c] no-underline"
            style={{
              fontFamily: "var(--font-cinzel)",
              border: "1px solid rgba(201,168,76,0.12)",
            }}
          >
            See How It Works
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </Link>
        </div>

        {/* Stat strip */}
        <div
          className="flex flex-wrap justify-center mt-16"
          style={{
            border: "1px solid rgba(201,168,76,0.12)",
            animation: "syFadeUp 0.8s ease 1s forwards",
            opacity: 0,
          }}
        >
          {[
            { val: "847", label: "Active Builders" },
            { val: "2,341", label: "Projects Declared" },
            { val: "612", label: "Ships Launched" },
            { val: "1,290", label: "Buried in Graveyard" },
          ].map((s, i) => (
            <div
              key={s.label}
              className="px-8 py-3.5 text-center"
              style={{
                borderRight: i < 3 ? "1px solid rgba(201,168,76,0.12)" : "none",
              }}
            >
              <span className="block text-[#c9a84c] text-xl font-mono leading-tight mb-1">{s.val}</span>
              <span className="block text-[#8a8a9a] text-[7px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes syFadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>

      <GoldDivider />

      {/* ── PROBLEM ── */}
      <section id="features" className="max-w-[1200px] mx-auto px-6 md:px-12 py-24">
        <Reveal><SectionEyebrow>The Problem</SectionEyebrow></Reveal>
        <Reveal>
          <h2
            className="italic font-light leading-tight mb-4"
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(36px, 5vw, 60px)" }}
          >
            Every developer<br />recognises this pattern.
          </h2>
        </Reveal>
        <Reveal>
          <p
            className="italic text-[#8a8a9a] font-light text-lg leading-relaxed mb-14 max-w-lg"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            You start with fire. Then a shinier idea appears. The original project quietly dies — no funeral, no accountability.
          </p>
        </Reveal>

        <Reveal>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-px"
            style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.12)" }}
          >
            {problems.map((p) => (
              <div
                key={p.num}
                className="bg-[#0e1018] p-9 transition-colors hover:bg-[#0d0d1a]"
              >
                <span className="block font-mono text-[11px] text-[#c9a84c] opacity-50 mb-3 tracking-[0.1em]">
                  {p.num}
                </span>
                <p
                  className="italic text-[#f0ead6] font-light text-[22px] leading-snug mb-2.5"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {p.title}
                </p>
                <p className="text-[#8a8a9a] text-[13px] leading-relaxed">{p.sub}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <GoldDivider />

      {/* ── FEATURES ── */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-12 py-24">
        <Reveal><SectionEyebrow>The Arsenal</SectionEyebrow></Reveal>
        <Reveal>
          <h2
            className="italic font-light leading-tight mb-4"
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(36px, 5vw, 60px)" }}
          >
            Every tool a builder needs<br />to stay on course.
          </h2>
        </Reveal>
        <Reveal>
          <p
            className="italic text-[#8a8a9a] font-light text-lg leading-relaxed mb-14 max-w-lg"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Built by a developer who abandoned six projects. Designed so you won&apos;t.
          </p>
        </Reveal>

        <Reveal>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.12)" }}
          >
            {features.map((f) => (
              <div
                key={f.title}
                className="relative bg-[#0e1018] p-10 transition-colors group hover:bg-[#0d0d1a] overflow-hidden"
              >
                {/* top gold line on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-60 transition-opacity"
                  style={{ background: "linear-gradient(90deg, transparent, #c9a84c, transparent)" }}
                />
                <div
                  className="w-10 h-10 flex items-center justify-center mb-6 text-[#c9a84c]"
                  style={{ border: "1px solid rgba(201,168,76,0.12)" }}
                >
                  {f.icon}
                </div>
                <p
                  className="text-[#f0ead6] text-[10px] tracking-[0.18em] uppercase mb-3"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  {f.title}
                </p>
                <p className="text-[#8a8a9a] text-[13px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <div
      id="community"
        className="py-24 px-6 md:px-12"
        style={{
          background: "#0d0d1a",
          borderTop: "1px solid rgba(201,168,76,0.12)",
          borderBottom: "1px solid rgba(201,168,76,0.12)",
        }}
      >
        <div className="max-w-[1200px] mx-auto">
          <Reveal><SectionEyebrow>The Dashboard</SectionEyebrow></Reveal>
          <Reveal>
            <h2
              className="italic font-light leading-tight mb-12"
              style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(36px, 5vw, 60px)" }}
            >
              Everything in view.<br />Nothing to hide behind.
            </h2>
          </Reveal>

          <Reveal>
            <div style={{ border: "1px solid rgba(201,168,76,0.25)", background: "#0e1018" }}>
              {/* titlebar */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: "1px solid rgba(201,168,76,0.12)", background: "rgba(8,8,16,0.6)" }}
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)" }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[10px] text-[#8a8a9a] tracking-[0.05em]">
                  shipyard-io.vercel.app/dashboard
                </span>
                <div />
              </div>

              {/* stat row */}
              <div
                className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-5"
                style={{ borderBottom: "1px solid rgba(201,168,76,0.08)" }}
              >
                {[
                  { label: "Active Projects", val: "03", w: "60%" },
                  { label: "Completion Rate", val: "67%", w: "67%" },
                  { label: "Tasks Remaining", val: "09", w: "30%" },
                  { label: "Points", val: "320", w: "32%" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="p-4"
                    style={{ background: "rgba(8,8,16,0.8)", border: "1px solid rgba(201,168,76,0.12)" }}
                  >
                    <p
                      className="text-[#8a8a9a] text-[7px] tracking-[0.2em] uppercase mb-2"
                      style={{ fontFamily: "var(--font-cinzel)" }}
                    >
                      {s.label}
                    </p>
                    <span className="block text-[#c9a84c] text-2xl font-mono mb-2.5">{s.val}</span>
                    <div className="h-[3px] w-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-full" style={{ width: s.w, background: "linear-gradient(90deg,#c9a84c,#e8c96a)" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* body */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 p-5">
                <div className="lg:col-span-2 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { name: "PaymentRecovery", sub: "Stripe failed payment SaaS", tasks: "12/18 tasks · 67%", w: "67%" },
                      { name: "AI Interview Bot", sub: "Webcam AI interviewer", tasks: "7/14 tasks · 50%", w: "50%" },
                    ].map((proj) => (
                      <div
                        key={proj.name}
                        className="p-4"
                        style={{ background: "rgba(8,8,16,0.8)", border: "1px solid rgba(201,168,76,0.12)" }}
                      >
                        <p
                          className="text-[7px] tracking-[0.2em] uppercase mb-2"
                          style={{ fontFamily: "var(--font-cinzel)", color: "#5ae0a0" }}
                        >
                          ● Active
                        </p>
                        <p
                          className="text-[#f0ead6] italic text-[13px] mb-1"
                          style={{ fontFamily: "var(--font-cormorant)" }}
                        >
                          {proj.name}
                        </p>
                        <p className="text-[#8a8a9a] text-[10px] mb-2.5">{proj.sub}</p>
                        <div className="h-[3px] w-full overflow-hidden mb-1" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <div className="h-full" style={{ width: proj.w, background: "linear-gradient(90deg,#c9a84c,#e8c96a)" }} />
                        </div>
                        <p className="text-[9px] text-[#8a8a9a] font-mono">{proj.tasks}</p>
                      </div>
                    ))}
                  </div>

                  <div
                    className="p-4"
                    style={{ background: "rgba(8,8,16,0.8)", border: "1px solid rgba(201,168,76,0.12)" }}
                  >
                    <p
                      className="text-[7px] tracking-[0.2em] uppercase text-[#8a8a9a] mb-2.5"
                      style={{ fontFamily: "var(--font-cinzel)" }}
                    >
                      Pending Tasks
                    </p>
                    {[
                      { label: "Setup Stripe webhook endpoint", done: true },
                      { label: "Build retry logic with backoff", done: false },
                      { label: "Integrate Gemini voice API", done: false },
                    ].map((t) => (
                      <div
                        key={t.label}
                        className="flex items-center gap-2 py-2 text-[11px] text-[#8a8a9a]"
                        style={{ borderBottom: "1px solid rgba(201,168,76,0.06)" }}
                      >
                        <div
                          className="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center"
                          style={{
                            border: t.done ? "none" : "1px solid rgba(201,168,76,0.12)",
                            background: t.done ? "#c9a84c" : "transparent",
                          }}
                        >
                          {t.done && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#080810" strokeWidth="3" className="w-2.5 h-2.5">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </div>
                        <span className={t.done ? "line-through opacity-40" : ""}>{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="p-4"
                  style={{ background: "rgba(8,8,16,0.8)", border: "1px solid rgba(201,168,76,0.12)" }}
                >
                  <p
                    className="text-[7px] tracking-[0.2em] uppercase text-[#8a8a9a] mb-3"
                    style={{ fontFamily: "var(--font-cinzel)" }}
                  >
                    Leaderboard
                  </p>
                  <div className="space-y-0">
                    {leaderboard.map((u) => (
                      <div
                        key={u.rank}
                        className="flex items-center gap-2 py-1.5"
                        style={{ borderBottom: "1px solid rgba(201,168,76,0.06)" }}
                      >
                        <span className="font-mono text-[10px] text-[#c9a84c] w-5">{u.rank}</span>
                        <div
                          className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] text-[#c9a84c]"
                          style={{ background: "rgba(201,168,76,0.2)" }}
                        >
                          {u.initials}
                        </div>
                        <span className="text-[11px] text-[#f0ead6] flex-1">{u.name}</span>
                        <span className="font-mono text-[10px] text-[#8a8a9a]">{u.pts}</span>
                      </div>
                    ))}
                    <div
                      className="flex items-center gap-2 py-1.5 px-1 -mx-1 mt-1"
                      style={{ background: "rgba(201,168,76,0.05)" }}
                    >
                      <span className="font-mono text-[10px] text-[#c9a84c] w-5">28</span>
                      <div
                        className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] text-[#c9a84c]"
                        style={{ background: "rgba(201,168,76,0.3)" }}
                      >
                        AN
                      </div>
                      <span className="text-[11px] text-[#c9a84c] flex-1">you</span>
                      <span className="font-mono text-[10px] text-[#c9a84c]">320</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <GoldDivider />

      {/* ── GRAVEYARD ── */}
      <div
        className="py-20 px-6 md:px-12 text-center"
        style={{
          background: "linear-gradient(180deg, #080810 0%, rgba(107,26,42,0.08) 50%, #080810 100%)",
          borderTop: "1px solid rgba(107,26,42,0.3)",
          borderBottom: "1px solid rgba(107,26,42,0.3)",
        }}
      >
        <div className="max-w-[680px] mx-auto">
          <Reveal>
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-8 h-px" style={{ background: "rgba(107,26,42,0.5)" }} />
              <span
                className="text-[8px] tracking-[0.3em] uppercase"
                style={{ fontFamily: "var(--font-cinzel)", color: "#a05060" }}
              >
                The Graveyard
              </span>
              <div className="w-8 h-px" style={{ background: "rgba(107,26,42,0.5)" }} />
            </div>
          </Reveal>
          <Reveal>
            <h2
              className="italic font-light leading-tight mb-4"
              style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(32px, 5vw, 52px)" }}
            >
              Every great builder<br />has a graveyard. Own it.
            </h2>
          </Reveal>
          <Reveal>
            <p
              className="italic text-[#8a8a9a] font-light text-[17px] leading-relaxed mb-9"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Abandoned projects don&apos;t disappear on ShipYard. They&apos;re preserved — with their completion percentage, their stack, and their date of death. Your graveyard is public. Let it haunt you into shipping.
            </p>
          </Reveal>
          <Reveal>
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {tombstones.map((t) => (
                <div
                  key={t.name}
                  className="px-4 py-3 text-center transition-colors"
                  style={{
                    border: "1px solid rgba(107,26,42,0.3)",
                    background: "rgba(107,26,42,0.06)",
                  }}
                >
                  <span
                    className="block italic text-[#8a8a9a] text-[14px] mb-1"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {t.name}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: "rgba(160,80,96,0.7)" }}>
                    {t.pct}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <GoldDivider />

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="max-w-[1200px] mx-auto px-6 md:px-12 py-24">
        <Reveal><SectionEyebrow>The Process</SectionEyebrow></Reveal>
        <Reveal>
          <h2
            className="italic font-light leading-tight mb-14"
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(36px, 5vw, 60px)" }}
          >
            From idea to shipped,<br />in four honest steps.
          </h2>
        </Reveal>

        <Reveal>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px"
            style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.12)" }}
          >
            {steps.map((s) => (
              <div key={s.num} className="bg-[#0e1018] p-10">
                <span
                  className="block font-mono text-[44px] leading-none mb-5 text-[#c9a84c]"
                  style={{ opacity: 0.1 }}
                >
                  {s.num}
                </span>
                <p
                  className="text-[#f0ead6] text-[9px] tracking-[0.2em] uppercase mb-2.5"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  {s.title}
                </p>
                <p className="text-[#8a8a9a] text-[13px] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── QUOTE ── */}
      <div className="max-w-[860px] mx-auto px-6 py-24 text-center">
        <Reveal>
          <span
            className="block text-[80px] leading-none text-[#c9a84c] mb-6"
            style={{ fontFamily: "var(--font-cormorant)", opacity: 0.2 }}
          >
            &ldquo;
          </span>
        </Reveal>
        <Reveal>
          <p
            className="italic font-light text-[#f0ead6] leading-relaxed mb-7"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(22px, 3vw, 32px)",
            }}
          >
            The ship that stays in the harbor is safe — but that&apos;s not what ships are built for.
            ShipYard made me realise I was building harbors, not ships.
          </p>
        </Reveal>
        <Reveal>
          <p
            className="text-[#c9a84c] text-[8px] tracking-[0.25em] uppercase"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            A developer, 3 weeks after joining
          </p>
        </Reveal>
      </div>

      <GoldDivider />

      {/* ── CTA ── */}
      <div className="px-6 md:px-12 py-24">
        <div
          className="relative text-center px-8 md:px-20 py-20 overflow-hidden"
          style={{
            border: "1px solid rgba(201,168,76,0.12)",
            background: "#0e1018",
          }}
        >
          {/* vertical center line */}
          <div
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px pointer-events-none"
            style={{ background: "linear-gradient(180deg, #c9a84c, transparent)", opacity: 0.15 }}
          />
          <Reveal>
            <h2
              className="italic font-light leading-tight mb-4"
              style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(36px, 5vw, 64px)" }}
            >
              Your next project<br />deserves to be shipped.
            </h2>
          </Reveal>
          <Reveal>
            <p
              className="italic text-[#8a8a9a] font-light text-lg leading-relaxed mb-11 max-w-md mx-auto"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Join hundreds of developers who declared their builds publicly — and actually finished them.
            </p>
          </Reveal>
          <Reveal>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-[#c9a84c] text-[#080810] px-10 py-3.5 text-[9px] tracking-[0.2em] uppercase font-semibold transition-all hover:bg-[#e8c96a] hover:-translate-y-px no-underline"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
              Forge Your Legacy
            </Link>
          </Reveal>
          <Reveal>
            <p
              className="mt-5 text-[8px] tracking-[0.15em] uppercase text-[#8a8a9a] opacity-50"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              Free to join · GitHub OAuth · No credit card
            </p>
          </Reveal>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer
        className="flex flex-wrap items-center justify-between gap-4 px-6 md:px-12 py-10"
        style={{ borderTop: "1px solid rgba(201,168,76,0.12)" }}
      >
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-4 h-4">
            <path d="M12 2l10 5-10 5L2 7l10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
          </svg>
          <span
            className="text-[#8a8a9a] text-[11px] tracking-[0.2em] uppercase"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            ShipYard
          </span>
        </div>

        <div className="flex gap-7">
          {["Features", "Community", "Graveyard", "Terms", "Privacy"].map((l) => (
            <Link
              key={l}
              href="#"
              className="text-[#8a8a9a] text-[8px] tracking-[0.15em] uppercase opacity-50 hover:opacity-100 hover:text-[#c9a84c] transition-all no-underline"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              {l}
            </Link>
          ))}
        </div>

        <span className="font-mono text-[10px] text-[#8a8a9a] opacity-30">V.1.0.0-Alpha</span>
      </footer>
    </div>
  );
}