"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGitHubSignIn = () => {
    signIn("github", { callbackUrl: "/dashboard" });
  };

  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials. Access denied.");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0b0e] flex flex-col items-center justify-between overflow-hidden">
      {/* ─── Backgrounds ─── */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{ background: "radial-gradient(ellipse 80% 70% at 50% 40%, #1a1c24 0%, #0a0b0e 70%)" }} />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#c9a84c 1px, transparent 1px), linear-gradient(90deg, #c9a84c 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* ─── Header ─── */}
      <header className="relative z-10 flex flex-col items-center pt-10 sm:pt-14 pb-6 px-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 border border-[#c9a84c]/50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M11 5l-5 8h5V5z" strokeWidth="1.5" />
              <path d="M13 5v8h5.5C18.5 9 16 6.5 13 5z" strokeWidth="1.5" />
              <path d="M3.5 14.5h17l-1.5 2c-1.5 1-3.5 1-5 0s-3.5-1-5 0-3.5 1-5 0L3.5 14.5z" fill="currentColor" stroke="none" />
              <path d="M3.5 19.5c1.5 1 3.5 1 5 0s3.5-1 5 0 3.5 1 5 0" strokeWidth="1.5" />
            </svg>
          </div>
          <h1 className="text-[#c9a84c] tracking-[0.3em] text-base sm:text-lg font-medium uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>The Shipyard</h1>
        </div>
        <p className="text-[#c9a84c]/45 text-[9px] sm:text-[10px] tracking-[0.25em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Architectural Grade Development</p>
      </header>

      {/* ─── Login Card ─── */}
      <main className="relative z-10 w-full flex-1 flex items-start justify-center px-4 pb-6">
        <div className="w-full max-w-sm sm:max-w-md" style={{ background: "rgba(18, 20, 28, 0.85)", border: "1px solid rgba(201,168,76,0.15)", backdropFilter: "blur(12px)" }}>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#c9a84c]/50 to-transparent" />
          <div className="px-8 sm:px-10 pt-8 pb-10">
            <div className="text-center mb-8">
              <h2 className="text-white/90 text-2xl sm:text-3xl font-light mb-2" style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}>Enter the Atelier</h2>
              <p className="text-white/40 text-xs sm:text-sm">Secure access to your master blueprints.</p>
            </div>

            <button onClick={handleGitHubSignIn} className="w-full flex items-center justify-center gap-3 border border-[#c9a84c]/25 bg-transparent hover:border-[#c9a84c]/50 hover:bg-[#c9a84c]/5 text-white/70 hover:text-white/90 transition-all py-3.5 mb-6 group" style={{ fontFamily: "var(--font-cinzel)", fontSize: "11px", letterSpacing: "0.15em" }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 fill-white/70 group-hover:fill-white/90 transition-colors">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              <span>Authenticate via GitHub</span>
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[#c9a84c]/12" /><span className="text-white/20 text-[10px] tracking-widest uppercase">or</span><div className="flex-1 h-px bg-[#c9a84c]/12" />
            </div>

            <form className="flex flex-col gap-6" onSubmit={handleManualSignIn}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Registry Email</label>
                <input required value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="COMMAND@SHIPYARD.IO" className="w-full bg-transparent border-b border-[#c9a84c]/25 focus:border-[#c9a84c]/65 outline-none py-2 text-white/70 placeholder:text-white/18 text-sm tracking-wider uppercase transition-colors" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Cryptographic Key</label>
                <div className="relative">
                  <input required value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="············" className="w-full bg-transparent border-b border-[#c9a84c]/25 focus:border-[#c9a84c]/65 outline-none py-2 text-white/70 placeholder:text-white/25 text-sm tracking-[0.3em] transition-colors" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#c9a84c]/35 hover:text-[#c9a84c]/70 transition-colors p-1">
                    {showPassword ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                  </button>
                </div>
              </div>

              {error && <p className="text-rose-500 text-[10px] italic">{error}</p>}

              <button type="submit" disabled={isLoading} className="w-full bg-[#c9a84c] hover:bg-[#e8c96a] text-[#0d0d0d] font-bold py-4 mt-1 tracking-[0.2em] text-[11px] uppercase transition-all duration-200 hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] disabled:opacity-50">
                {isLoading ? "Validating..." : "Begin Session"}
              </button>
            </form>

            <div className="flex items-center justify-center mt-6 text-[9px] sm:text-[10px] tracking-[0.15em] uppercase">
              <Link href="/signup" className="text-[#c9a84c]/40 hover:text-[#c9a84c]/75 transition-colors" style={{ fontFamily: "var(--font-cinzel)" }}>Don't Have an account? Sign Up</Link>
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#c9a84c]/30 to-transparent" />
        </div>
      </main>

      <footer className="relative z-10 flex flex-col items-center gap-3 pb-8 px-6 text-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-px bg-[#c9a84c]/30" /><span className="text-white/20 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-cinzel)" }}>Registry Archive V.4.02</span><div className="w-10 h-px bg-[#c9a84c]/30" />
        </div>
      </footer>
    </div>
  );
}
