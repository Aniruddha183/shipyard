"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleGitHubSignUp = () => {
    signIn("github", { callbackUrl: "/dashboard" });
  };

  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Account created successfully. Entering the Atelier..." });
        setTimeout(() => signIn("credentials", { email, password, callbackUrl: "/dashboard" }), 1500);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to forge account." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "The shipyard is out of range." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0d0d0d] flex overflow-hidden">
      {/* ─── LEFT PANEL ─── */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d]/40 via-[#0d0d0d]/10 to-[#0d0d0d]/80 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1751676450446-6fb693453740?w=1200&q=90&auto=format&fit=crop')",
            filter: "brightness(0.55) saturate(0.4)",
          }}
        />
        <div className="relative z-20 p-8 flex items-center gap-3">
          <div className="w-10 h-10 border border-[#c9a84c]/70 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M11 5l-5 8h5V5z" strokeWidth="1.5" />
              <path d="M13 5v8h5.5C18.5 9 16 6.5 13 5z" strokeWidth="1.5" />
              <path d="M3.5 14.5h17l-1.5 2c-1.5 1-3.5 1-5 0s-3.5-1-5 0-3.5 1-5 0L3.5 14.5z" fill="currentColor" stroke="none" />
              <path d="M3.5 19.5c1.5 1 3.5 1 5 0s3.5-1 5 0 3.5 1 5 0" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="text-[#c9a84c] tracking-[0.25em] text-sm font-medium uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>The Shipyard</span>
        </div>
        <div className="relative z-20 p-8 pb-12">
          <p className="text-[#c9a84c] text-xs tracking-[0.2em] uppercase mb-6" style={{ fontFamily: "var(--font-cinzel)" }}>Status: Origin Site</p>
          <h2 className="text-white/90 text-4xl xl:text-5xl font-light leading-tight mb-4 italic" style={{ fontFamily: "var(--font-cormorant)" }}>Crafting Excellence<br />in the Shadows.</h2>
          <p className="text-white/55 text-sm leading-relaxed max-w-xs">Every project launched from this shipyard is a testament to the meticulous discipline of its architect.</p>
        </div>
        <div className="relative z-20 px-8 pb-5 flex gap-12 text-[10px] text-white/30 tracking-widest uppercase">
          <span>Est. MMXXIV</span><span>Lat: 40.7128° N</span><span>Long: 74.0060° W</span>
        </div>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div className="flex-1 flex flex-col min-h-screen bg-[#0e1018] relative overflow-y-auto">
        <Link href="/signin" className="absolute top-5 right-5 w-8 h-8 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c]/50 hover:border-[#c9a84c]/60 hover:text-[#c9a84c]/80 transition-all z-10" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </Link>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 px-6 pt-8 pb-4">
          <div className="w-8 h-8 border border-[#c9a84c]/70 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M11 5l-5 8h5V5z" strokeWidth="1.5" />
              <path d="M13 5v8h5.5C18.5 9 16 6.5 13 5z" strokeWidth="1.5" />
              <path d="M3.5 14.5h17l-1.5 2c-1.5 1-3.5 1-5 0s-3.5-1-5 0-3.5 1-5 0L3.5 14.5z" fill="currentColor" stroke="none" />
              <path d="M3.5 19.5c1.5 1 3.5 1 5 0s3.5-1 5 0 3.5 1 5 0" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="text-[#c9a84c] tracking-[0.2em] text-xs font-medium uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>The Shipyard</span>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 py-10">
          <div className="mb-8">
            <h1 className="text-white text-3xl sm:text-4xl font-light mb-2" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>Forge Your Legacy.</h1>
            <p className="text-white/45 text-sm">Join the most prestigious assembly of master builders.</p>
          </div>

          {/* GitHub Action */}
          <button 
            onClick={handleGitHubSignUp}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 border border-[#c9a84c]/25 bg-transparent hover:border-[#c9a84c]/50 hover:bg-[#c9a84c]/5 text-white/70 hover:text-white/90 transition-all py-3.5 mb-6 group disabled:opacity-50" 
            style={{ fontFamily: "var(--font-cinzel)", fontSize: "11px", letterSpacing: "0.15em" }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 fill-white/70 group-hover:fill-white/90 transition-colors">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            <span>Commission via GitHub</span>
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#c9a84c]/15" /><span className="text-[#c9a84c]/40 text-[10px] tracking-[0.2em] uppercase whitespace-nowrap" style={{ fontFamily: "var(--font-cinzel)" }}>Or Credentials</span><div className="flex-1 h-px bg-[#c9a84c]/15" />
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleManualSignUp}>
            <div className="flex flex-col gap-1.5">
              <label className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Username</label>
              <input required value={username} onChange={e => setUsername(e.target.value)} type="text" placeholder="ARCHITECT_NAME" className="w-full bg-transparent border-b border-[#c9a84c]/30 focus:border-[#c9a84c]/70 outline-none py-2 text-white placeholder:text-white/20 text-sm tracking-wider uppercase" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Email Address</label>
              <input required value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="COMMAND@GMAIL.COM" className="w-full bg-transparent border-b border-[#c9a84c]/30 focus:border-[#c9a84c]/70 outline-none py-2 text-white placeholder:text-white/20 text-sm tracking-wider uppercase" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Encryption Key</label>
              <div className="relative">
                <input required value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="············" className="w-full bg-transparent border-b border-[#c9a84c]/30 focus:border-[#c9a84c]/70 outline-none py-2 text-white placeholder:text-white/25 text-sm tracking-[0.3em]" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#c9a84c]/40 hover:text-[#c9a84c]/80 transition-colors p-1">
                  {showPassword ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                </button>
              </div>
            </div>

            {message.text && (
              <p className={`text-xs italic ${message.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>{message.text}</p>
            )}

            <button type="submit" disabled={isLoading} className="w-full bg-[#c9a84c] hover:bg-[#e8c96a] text-[#0d0d0d] font-semibold py-4 mt-2 tracking-[0.2em] text-[11px] uppercase transition-all duration-200 hover:shadow-[0_0_30px_rgba(201,168,76,0.2)] disabled:opacity-50">
              {isLoading ? "Commissioning..." : "Commission Account"}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-8">Already part of the assembly? <Link href="/signin" className="text-[#c9a84c] hover:text-[#e8c96a] transition-colors underline underline-offset-2">Sign In</Link></p>
        </div>

        <div className="px-6 sm:px-10 lg:px-16 xl:px-20 pb-6 flex items-center justify-between text-[9px] text-white/20 tracking-[0.15em] uppercase">
          <div className="flex gap-4"><Link href="#" className="hover:text-[#c9a84c]/60 transition-colors">Terms</Link><Link href="#" className="hover:text-[#c9a84c]/60 transition-colors">Privacy</Link></div>
          <span>V.1.0.0-Alpha</span>
        </div>
      </div>
    </div>
  );
}
