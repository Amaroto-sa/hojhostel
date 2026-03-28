import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Home, Calendar, Settings, LogOut, MessageSquare, Star } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/listings", label: "Listings & Houses", icon: Home },
    { href: "/admin/bookings", label: "Bookings", icon: Calendar },
    { href: "/admin/residents", label: "Residents", icon: Users },
    { href: "/admin/testimonials", label: "Testimonials", icon: Star },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#080809] flex">
      {/* Sidebar */}
      <aside className="w-[260px] border-r border-[rgba(255,255,255,0.08)] bg-[#0a0a0c] p-6 hidden lg:flex flex-col shrink-0">
        <Link href="/" className="mb-10 flex items-center gap-3">
          <div className="w-[45px] h-[45px] rounded-xl border border-[rgba(255,255,255,0.08)] flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#1c1c22] to-[#0e0e12]">
            <span className="font-display font-bold text-[#ff7a1a] relative z-10 text-sm">HOJ</span>
          </div>
          <div>
            <strong className="text-white text-sm block">Admin Panel</strong>
            <small className="text-[#b1b1ba] text-xs">HOJ Hostel</small>
          </div>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#b1b1ba] hover:bg-[rgba(255,255,255,0.06)] hover:text-white transition text-sm font-medium"
            >
              <item.icon size={18} /> {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-10 pt-6 border-t border-[rgba(255,255,255,0.08)]">
          <div className="text-xs text-[#b1b1ba] mb-3 px-4">
            Signed in as <span className="text-white font-medium">{session.user.name || session.user.email}</span>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-medium transition cursor-pointer text-sm"
          >
            <LogOut size={18} /> Sign Out
          </Link>
        </div>
      </aside>

      {/* Mobile header for admin */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0c] border-b border-[rgba(255,255,255,0.08)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border border-[rgba(255,255,255,0.08)] flex items-center justify-center bg-gradient-to-br from-[#1c1c22] to-[#0e0e12]">
            <span className="font-display font-bold text-[#ff7a1a] text-xs">HOJ</span>
          </div>
          <span className="text-white text-sm font-semibold">Admin</span>
        </div>
        <div className="flex gap-2">
          {navItems.slice(0, 4).map((item) => (
            <Link key={item.href} href={item.href} className="p-2 rounded-lg text-[#b1b1ba] hover:text-white hover:bg-[rgba(255,255,255,0.05)]">
              <item.icon size={18} />
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto w-full lg:pt-0 pt-16">
        <div className="p-6 md:p-10 w-full max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
