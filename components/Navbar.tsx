"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(data => {
      if (data.logo_url) setLogoUrl(data.logo_url);
    }).catch(() => { });
  }, []);

  // On homepage, use anchor links; on other pages, link to /#section
  const isHome = pathname === "/";
  const sectionLink = (section: string) => isHome ? `#${section}` : `/#${section}`;

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[rgba(8,8,10,0.72)] border-b border-[rgba(255,255,255,0.06)]">
      <div className="container mx-auto px-4 w-[92%] max-w-[1180px]">
        <div className="flex items-center justify-between min-h-[78px] gap-5">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-[50px] h-[50px] rounded-2xl border border-[rgba(255,255,255,0.08)] flex items-center justify-center relative overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.35)] bg-gradient-to-br from-[#1c1c22] to-[#0e0e12]">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,122,26,0.16)] to-transparent opacity-60"></div>
                  <span className="font-display font-bold text-[#ff7a1a] text-lg relative z-10">HOJ</span>
                </>
              )}
            </div>
            <div>
              <strong className="block text-base tracking-wide font-semibold text-[#f5f5f7]">HOJ Hostel</strong>
              <small className="block text-[#b1b1ba] mt-0.5 text-xs tracking-widest uppercase">House of Jesse</small>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link href={sectionLink("home")} className="text-[#b1b1ba] font-medium text-[0.92rem] hover:text-white transition-colors duration-300">Home</Link>
            <Link href={sectionLink("about")} className="text-[#b1b1ba] font-medium text-[0.92rem] hover:text-white transition-colors duration-300">About</Link>
            <Link href="/locations" className="text-[#b1b1ba] font-medium text-[0.92rem] hover:text-white transition-colors duration-300">Locations</Link>
            <Link href="/availability" className="text-[#b1b1ba] font-medium text-[0.92rem] hover:text-white transition-colors duration-300">Availability</Link>
            <Link href="/pricing" className="text-[#b1b1ba] font-medium text-[0.92rem] hover:text-white transition-colors duration-300">Pricing</Link>
            <Link href={sectionLink("amenities")} className="text-[#b1b1ba] font-medium text-[0.92rem] hover:text-white transition-colors duration-300">Amenities</Link>
            <Link href={sectionLink("gallery")} className="text-[#b1b1ba] font-medium text-[0.92rem] hover:text-white transition-colors duration-300">Gallery</Link>
            <Link href="/book" className="text-[#b1b1ba] font-medium text-[0.92rem] hover:text-white transition-colors duration-300">Book Now</Link>
            <Link href={sectionLink("contact")} className="text-[#b1b1ba] font-medium text-[0.92rem] hover:text-white transition-colors duration-300">Contact</Link>

            {session ? (
              <Link
                href={session.user?.role === "ADMIN" || session.user?.role === "SUPER_ADMIN" ? "/admin" : "/dashboard"}
                className="text-[#b1b1ba] font-medium text-[0.92rem] hover:text-white transition-colors duration-300"
              >
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-[#b1b1ba] font-medium text-[0.92rem] hover:text-white transition-colors duration-300">Login</Link>
            )}

            <Link
              href="https://wa.me/2348145416775"
              target="_blank"
              className="ml-1 px-5 py-2.5 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-extrabold text-sm shadow-[0_10px_30px_rgba(255,122,26,0.28)] hover:-translate-y-0.5 transition-transform"
            >
              WhatsApp
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden w-12 h-12 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] flex items-center justify-center text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <nav className="lg:hidden flex flex-col items-start gap-4 p-5 rounded-2xl bg-[rgba(10,10,12,0.96)] border border-[rgba(255,255,255,0.08)] shadow-[0_25px_70px_rgba(0,0,0,0.35)] absolute top-[80px] left-[4%] right-[4%] z-40">
            <Link href="/" className="text-[#f5f5f7] font-medium text-lg w-full" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href={sectionLink("about")} className="text-[#f5f5f7] font-medium text-lg w-full" onClick={() => setIsOpen(false)}>About</Link>
            <Link href="/locations" className="text-[#f5f5f7] font-medium text-lg w-full" onClick={() => setIsOpen(false)}>Locations</Link>
            <Link href="/availability" className="text-[#f5f5f7] font-medium text-lg w-full" onClick={() => setIsOpen(false)}>Availability</Link>
            <Link href="/pricing" className="text-[#f5f5f7] font-medium text-lg w-full" onClick={() => setIsOpen(false)}>Pricing</Link>
            <Link href={sectionLink("amenities")} className="text-[#f5f5f7] font-medium text-lg w-full" onClick={() => setIsOpen(false)}>Amenities</Link>
            <Link href={sectionLink("gallery")} className="text-[#f5f5f7] font-medium text-lg w-full" onClick={() => setIsOpen(false)}>Gallery</Link>
            <Link href="/book" className="text-[#f5f5f7] font-medium text-lg w-full" onClick={() => setIsOpen(false)}>Book Now</Link>
            <Link href={sectionLink("contact")} className="text-[#f5f5f7] font-medium text-lg w-full" onClick={() => setIsOpen(false)}>Contact</Link>

            {session ? (
              <Link
                href={session.user?.role === "ADMIN" || session.user?.role === "SUPER_ADMIN" ? "/admin" : "/dashboard"}
                className="text-[#f5f5f7] font-medium text-lg w-full"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-[#f5f5f7] font-medium text-lg w-full" onClick={() => setIsOpen(false)}>Login / Register</Link>
            )}

            <Link
              href="https://wa.me/2348145416775"
              target="_blank"
              className="mt-2 w-full text-center px-5 py-3 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-extrabold"
              onClick={() => setIsOpen(false)}
            >
              Book via WhatsApp
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
