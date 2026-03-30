"use client";

import Link from "next/link";
import { MessageCircle, Instagram, Facebook, Twitter } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

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
                  <Link href={settings.social_instagram} target="_blank" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#ff7a1a] hover:text-[#111] transition-all">
                    <Instagram size={14} />
                  </Link>
                )}
                {settings.social_facebook && (
                  <Link href={settings.social_facebook} target="_blank" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#ff7a1a] hover:text-[#111] transition-all">
                    <Facebook size={14} />
                  </Link>
                )}
                {settings.social_twitter && (
                  <Link href={settings.social_twitter} target="_blank" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#ff7a1a] hover:text-[#111] transition-all">
                    <Twitter size={14} />
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
