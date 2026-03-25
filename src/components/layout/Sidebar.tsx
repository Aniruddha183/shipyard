"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Projects",
    href: "/projects",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    label: "Graveyard",
    href: "/graveyard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h3l2-2 2 2h3a2 2 0 012 2v14a2 2 0 01-2 2z" />
        <path d="M12 12v4" />
        <path d="M12 8h.01" />
      </svg>
    ),
  },
  {
    label: "Community",
    href: "/community",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed left-0 top-0 bottom-0 w-[200px] bg-[#0a0b12] border-r border-[#c9a84c]/10 flex flex-col z-40 hidden lg:flex">
      {/* Branding & Atelier heading */}
      <div className="px-5 pt-8 pb-6 border-b border-[#c9a84c]/8 flex flex-col gap-6 bg-gradient-to-b from-[#c9a84c]/[0.02] to-transparent">
        {/* Branding Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 border border-[#c9a84c]/50 flex items-center justify-center flex-shrink-0 bg-[#0a0b12] shadow-[0_0_15px_rgba(201,168,76,0.1)] group-hover:shadow-[0_0_20px_rgba(201,168,76,0.25)] group-hover:border-[#c9a84c] transition-all">
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
          <div className="flex flex-col">
            <h2 className="text-[#c9a84c] tracking-[0.2em] text-[13px] font-bold uppercase transition-colors group-hover:text-[#e8c96a]" style={{ fontFamily: "var(--font-cinzel)" }}>
              Shipyard
            </h2>
            <p className="text-[#8a8a9a] text-[8px] tracking-[0.3em] uppercase mt-0.5 group-hover:text-[#c9a84c]/70 transition-colors">
              Est. MMXXIV
            </p>
          </div>
        </Link>

        <div>
          <p
            className="text-[#f0ead6] text-sm italic"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            The Master&apos;s Atelier
          </p>
          <p className="text-[#8a8a9a] text-[9px] tracking-[0.2em] uppercase mt-0.5" style={{ fontFamily: "var(--font-cinzel)" }}>
            Precision &amp; Prestige
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 pt-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all relative ${
                isActive
                  ? "text-[#c9a84c] bg-[#c9a84c]/5"
                  : "text-[#8a8a9a] hover:text-[#f0ead6] hover:bg-white/[0.02]"
              }`}
            >
              {/* Gold left bar for active */}
              {isActive && (
                <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#c9a84c] rounded-r" />
              )}
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* New Blueprint CTA */}
      <div className="px-4 pb-4">
        <Link
          href="/projects/new"
          className="flex items-center justify-center gap-2 w-full border border-[#c9a84c]/40 text-[#c9a84c] text-[10px] tracking-[0.18em] uppercase py-2.5 hover:bg-[#c9a84c]/8 transition-all"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          New Project
        </Link>
      </div>

      {/* Bottom links */}
      <div className="px-5 pb-5 flex flex-col gap-2 border-t border-[#c9a84c]/8 pt-4">
        <Link href="#" className="flex items-center gap-2 text-[#8a8a9a] text-xs hover:text-[#f0ead6] transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
          Settings
        </Link>
        <Link href="#" className="flex items-center gap-2 text-[#8a8a9a] text-xs hover:text-[#f0ead6] transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8" />
            <path d="M12 17v4" />
          </svg>
          Support
        </Link>
      </div>
      </aside>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#0a0b12]/95 backdrop-blur-md border-t border-[#c9a84c]/20 z-50 flex items-center justify-between px-2 sm:px-6 lg:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1.5 w-full h-full transition-colors ${
                isActive ? "text-[#c9a84c]" : "text-[#8a8a9a] hover:text-[#f0ead6]"
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? "bg-[#c9a84c]/10" : ""}`}>
                {item.icon}
              </div>
              <span className="text-[8px] tracking-[0.15em] uppercase font-bold" style={{ fontFamily: "var(--font-cinzel)" }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
