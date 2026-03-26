"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

const topNavItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Graveyard", href: "/graveyard" },
  { label: "Community", href: "/community" },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session, status: sessionStatus } = useSession();
  const sessionUser = session?.user as any;
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30  py-3 bg-[#0a0b12]/90 backdrop-blur-md border-b border-[#c9a84c]/10 flex items-center justify-between px-6">
      {/* Left — Logo + nav */}
      <div className="flex items-center gap-6">
        {/* Mobile Logo */}
        <Link
          href="/dashboard"
          className="flex lg:hidden items-center gap-3 group mr-2"
        >
          <div className="w-8 h-8 border border-[#c9a84c]/40 flex items-center justify-center bg-[#c9a84c]/5 group-hover:bg-[#c9a84c]/10 group-hover:border-[#c9a84c]/70 transition-all shadow-[0_0_10px_rgba(201,168,76,0.05)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-4 h-4">
              <path d="M3 18 Q6 10 12 8 Q18 6 21 18" /><line x1="12" y1="8" x2="12" y2="18" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </div>
          <span className="text-[#c9a84c] tracking-[0.2em] text-[11px] font-bold uppercase transition-colors" style={{ fontFamily: "var(--font-cinzel)" }}>
            ShipYard
          </span>
        </Link>

        {/* Top nav links (Desktop Only - hidden where Sidebar acts as nav) */}
        {/* We actually fully hide this if we want because Sidebar is the main nav, but for now we hide it on medium screens to avoid mobile tab bar overlap */}
        <nav className="hidden xl:flex items-center gap-1">
          {topNavItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-xs transition-all ${
                  isActive
                    ? "text-[#c9a84c] underline underline-offset-[18px] decoration-[#c9a84c]"
                    : "text-[#8a8a9a] hover:text-[#f0ead6]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right — Search, CTA, notification, profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 border border-[#c9a84c]/15 bg-white/[0.02] px-3 py-1.5 min-w-[180px] lg:min-w-[220px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="#8a8a9a" strokeWidth="1.5" className="w-3.5 h-3.5 flex-shrink-0">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search manifest..."
            className="bg-transparent outline-none text-[#f0ead6] placeholder:text-[#8a8a9a]/50 text-xs w-full"
          />
        </div>

        {/* Declare a Build CTA */}
        <Link
          href="/projects/new"
          className="hidden sm:flex items-center gap-2 bg-[#c9a84c] text-[#080810] text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 hover:bg-[#e8c96a] transition-all"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          New Project
        </Link>

        {/* Notification bell */}
        <button className="relative text-[#8a8a9a] hover:text-[#c9a84c] transition-colors p-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4.5 h-4.5">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#c9a84c] rounded-full text-[7px] text-[#080810] font-bold flex items-center justify-center">
            7
          </span>
        </button>

        {/* Profile / Auth Section */}
        {sessionStatus === "loading" ? (
          <div className="w-8 h-8 rounded-full bg-[#1a1c28] border border-[#c9a84c]/25 animate-pulse" />
        ) : sessionStatus === "authenticated" && sessionUser ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              {sessionUser.image ? (
                <img
                  src={sessionUser.image}
                  alt={sessionUser.name || "Profile"}
                  className="w-8 h-8 rounded-full border border-[#c9a84c]/25 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1a1c28] border border-[#c9a84c]/25 flex items-center justify-center">
                  <span className="text-[#c9a84c] text-[10px] font-bold">
                    {(sessionUser.name || "U").slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <svg viewBox="0 0 24 24" fill="none" stroke="#8a8a9a" strokeWidth="1.5" className={`w-3 h-3 transition-transform ${profileOpen ? "rotate-180" : ""}`}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#0e1018] border border-[#c9a84c]/20 shadow-xl shadow-black/40 z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-[#c9a84c]/10">
                  <p className="text-[#f0ead6] text-sm font-medium truncate">{sessionUser.name || "Shipbuilder"}</p>
                  <p className="text-[#8a8a9a] text-[10px] truncate mt-0.5">{sessionUser.email || ""}</p>
                  {sessionUser.totalPoints !== undefined && (
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[#c9a84c] text-[9px] tracking-wider uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>
                        {sessionUser.totalPoints?.toLocaleString() || 0} PTS
                      </span>
                      {sessionUser.streak > 0 && (
                        <span className="text-[#5ae0a0] text-[9px] tracking-wider flex items-center gap-1">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-2.5 h-2.5"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 2.4 5.6a8.3 8.3 0 11-14.3-6.4c1.5 1.5 3 2.5 3 4.5 0 .5.3 1 1.4 1.3z" /></svg>
                          {sessionUser.streak} day streak
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Links */}
                <div className="py-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[#8a8a9a] text-xs hover:text-[#f0ead6] hover:bg-white/[0.02] transition-all"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Profile
                  </Link>
                  <Link
                    href="/projects"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[#8a8a9a] text-xs hover:text-[#f0ead6] hover:bg-white/[0.02] transition-all"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                    My Projects
                  </Link>
                  <Link
                    href="/community"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[#8a8a9a] text-xs hover:text-[#f0ead6] hover:bg-white/[0.02] transition-all"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87" />
                      <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                    Community
                  </Link>
                </div>

                {/* Sign out */}
                <div className="border-t border-[#c9a84c]/10 py-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      signOut({ callbackUrl: "/signin" });
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-[#e05a5a] text-xs hover:text-[#ff7a7a] hover:bg-[#e05a5a]/5 transition-all w-full text-left"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/signin"
            className="flex items-center gap-2 border border-[#c9a84c]/30 text-[#c9a84c] text-[10px] tracking-[0.12em] uppercase px-3 py-1.5 hover:bg-[#c9a84c]/8 transition-all"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
