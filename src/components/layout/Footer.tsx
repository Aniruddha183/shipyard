import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#c9a84c]/8 px-6 py-3 flex items-center justify-between text-[9px] tracking-[0.15em] uppercase text-[#8a8a9a]/40">
      <div className="flex items-center gap-4" style={{ fontFamily: "var(--font-cinzel)" }}>
        <span>© 2026 ShipYard | All Rights Reserved</span>
        <span className="text-[#1a4a35]">System: Operational</span>
      </div>
      <div className="flex items-center gap-4" style={{ fontFamily: "var(--font-cinzel)" }}>
        <Link href="#" className="hover:text-[#c9a84c]/60 transition-colors">Manifesto</Link>
        <Link href="#" className="hover:text-[#c9a84c]/60 transition-colors">Terminal Protocol</Link>
      </div>
    </footer>
  );
}
