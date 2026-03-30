"use client";

import Link from "next/link";
import { MessageCircle, Instagram, Facebook } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// TikTok SVG icon component (not in lucide-react)
function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.3 0 .59.04.86.12V9.01a6.16 6.16 0 0 0-.86-.06 6.29 6.29 0 0 0-6.29 6.29A6.29 6.29 0 0 0 9.49 21.5a6.29 6.29 0 0 0 6.29-6.29V8.86a8.28 8.28 0 0 0 3.81.94V6.69Z" />
    </svg>
  );
}

export default function Footer() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        setSettings(data);
      })
      .catch(() => { });
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <footer className="py-8 text-[#b1b1ba] relative z-10">
        <div className="container mx-auto px-4 w-[92%] max-w-[1180px]">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-[rgba(255,255,255,0.08)]">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl border border-[rgba(255,255,255,0.08)] flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#1c1c22] to-[#0e0e12]">
                  {settings.logo_url ? (
                    <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-display font-bold text-[#ff7a1a] text-sm relative z-10">HOJ</span>
                  )}
                </div>
                <div>
                  <strong className="text-white text-sm block">House of Jesse</strong>
                  <small className="text-xs text-[#b1b1ba]">HOJ Hostel</small>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-xs mb-4">
                {settings.footer_text || "Comfortable, affordable accommodation in Lagos. Flexible stays for students, NYSC members, and professionals."}
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                {settings.social_instagram && (
                  <Link href={settings.social_instagram} target="_blank" className="w-10 h-10 rounded-xl bg-[#E4405F]/10 text-[#E4405F] flex items-center justify-center hover:bg-[#E4405F]/20 transition-all border border-[#E4405F]/20 shadow-[0_5px_15px_rgba(228,64,95,0.1)]">
                    <Instagram size={18} strokeWidth={2.5} />
                  </Link>
                )}
                {settings.social_facebook && (
                  <Link href={settings.social_facebook} target="_blank" className="w-10 h-10 rounded-xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2]/20 transition-all border border-[#1877F2]/20 shadow-[0_5px_15px_rgba(24,119,242,0.1)]">
                    <Facebook size={18} strokeWidth={2.5} />
                  </Link>
                )}
                {settings.social_tiktok && (
                  <Link href={settings.social_tiktok} target="_blank" className="w-10 h-10 rounded-xl bg-[#00f2ea]/10 text-[#00f2ea] flex items-center justify-center hover:bg-[#00f2ea]/20 transition-all border border-[#00f2ea]/20 shadow-[0_5px_15px_rgba(0,242,234,0.1)]">
                    <TikTokIcon size={18} />
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Quick Links</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Link href="/" className="hover:text-white transition">Home</Link>
                <Link href="/availability" className="hover:text-white transition">Availability</Link>
                <Link href="/locations" className="hover:text-white transition">Locations</Link>
                <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
                <Link href="/book" className="hover:text-white transition">Book Now</Link>
                <Link href="/login" className="hover:text-white transition">Login</Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Contact</h4>
              <div className="space-y-2 text-sm">
                <p>📞 <span className="text-white">{settings.whatsapp_number || "+234 814 541 6775"}</span></p>
                <p>📧 <span className="text-white text-xs">{settings.contact_email || "houseofjessehostel@gmail.com"}</span></p>
                <p>📍 Golden Rays Estate, Olokonla, Ajah</p>
                <p>📍 Greenland Estate, Olokonla Ajah</p>
              </div>
              <Link
                href={`https://wa.me/${(settings.whatsapp_number || "+2348145416775").replace(/\D/g, '')}`}
                target="_blank"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold text-xs shadow-[0_8px_20px_rgba(255,122,26,0.2)]"
              >
                Chat on WhatsApp
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 flex flex-wrap justify-between gap-4 text-xs">
            <div>© {new Date().getFullYear()} House of Jesse / HOJ Hostel. All rights reserved.</div>
            <div>Ajah, Lagos · Safe · Clean · Comfortable</div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp button */}
      <Link
        href={`https://wa.me/${(settings.whatsapp_number || "2348145416775").replace(/\D/g, "")}`}
        target="_blank"
        aria-label="WhatsApp booking"
        className="fixed right-5 bottom-5 z-50 w-[60px] h-[60px] rounded-full flex items-center justify-center bg-gradient-to-br from-[#25d366] to-[#18b453] text-white shadow-[0_15px_40px_rgba(37,211,102,0.35)] hover:-translate-y-1 transition-transform"
      >
        <MessageCircle size={28} />
      </Link>
    </>
  );
}
