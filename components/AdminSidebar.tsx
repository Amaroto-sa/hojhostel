"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Users, Home, Calendar, Settings,
    LogOut, Star, ImageIcon, UserCircle, Menu, X, AlertCircle, Mail
} from "lucide-react";

interface AdminSidebarProps {
    session: any;
    logoUrl?: string | null;
}

export default function AdminSidebar({ session, logoUrl }: AdminSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/users", label: "User Accounts", icon: UserCircle },
        { href: "/admin/listings", label: "Listings & Houses", icon: Home },
        { href: "/admin/bookings", label: "Bookings", icon: Calendar },
        { href: "/admin/residents", label: "Residents", icon: Users },
        { href: "/admin/complaints", label: "Complaints", icon: AlertCircle },
        { href: "/admin/inquiries", label: "Inquiries", icon: Mail },
        { href: "/admin/testimonials", label: "Testimonials", icon: Star },
        { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
        { href: "/admin/settings", label: "Settings", icon: Settings },
    ];

    const adminName = session?.user?.name || session?.user?.email || "Admin";

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5 px-5 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center bg-gradient-to-br from-[#1c1c22] to-[#0e0e12] overflow-hidden">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <span className="font-display font-bold text-[#ff7a1a] text-[10px]">HOJ</span>
                        )}
                    </div>
                    <span className="text-white text-sm font-semibold tracking-tight">Admin Console</span>
                </Link>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-[70] 
        w-[280px] bg-[#0a0a0c] border-r border-white/5 
        flex flex-col transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
                {/* Logo Section */}
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-[45px] h-[45px] rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#1c1c22] to-[#0e0e12] group-hover:border-[#ff7a1a]/50 transition-colors">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <span className="font-display font-bold text-[#ff7a1a] text-sm">HOJ</span>
                            )}
                        </div>
                        <div>
                            <strong className="text-white text-sm block group-hover:text-[#ff7a1a] transition-colors leading-tight">Admin Panel</strong>
                            <small className="text-[#b1b1ba] text-[11px]">House of Jesse</small>
                        </div>
                    </Link>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                            flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group
                            ${isActive
                                        ? "bg-[#ff7a1a] text-[#111] font-bold shadow-lg shadow-[#ff7a1a]/20"
                                        : "text-[#b1b1ba] hover:bg-white/5 hover:text-white font-medium"}
                        `}
                            >
                                <item.icon size={19} className={isActive ? "text-[#111]" : "text-[#ff7a1a] opacity-80 group-hover:opacity-100"} />
                                <span className="text-sm tracking-wide">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User / Sign Out */}
                <div className="p-6 border-t border-white/5 mt-auto">
                    <div className="mb-4 px-3 py-3 rounded-2xl bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] text-[#b1b1ba] uppercase tracking-widest font-bold mb-1">Authenticated</p>
                        <p className="text-white text-sm font-medium truncate">{adminName}</p>
                    </div>
                    <Link
                        href="/api/auth/signout"
                        className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all font-bold text-sm"
                    >
                        <LogOut size={18} /> Sign Out
                    </Link>
                </div>
            </aside>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}</style>
        </>
    );
}
