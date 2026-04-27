import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { LogOut, Calendar, User, Clock } from "lucide-react";
import CancelBookingButton from "@/components/CancelBookingButton";

export const dynamic = "force-dynamic";
export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  // Fetch customer profile, residents, and bookings
  let profile: any = null;
  let bookings: any[] = [];
  let globals: any[] = [];
  let contactEmail = "houseofjessehostel@gmail.com";
  let whatsappLink = "https://wa.me/2348145416775";

  try {
    profile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
      include: { residents: { include: { listing: { include: { house: true } } } } },
    });

    bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: { listing: { include: { house: true } } },
      orderBy: { createdAt: "desc" },
    });

    globals = await prisma.notice.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 3
    });

    const contactEmailSetting = await prisma.setting.findUnique({ where: { key: "contact_email" } });
    if (contactEmailSetting?.value) {
      contactEmail = contactEmailSetting.value;
    }
    
    const whatsappSetting = await prisma.setting.findUnique({ where: { key: "whatsapp_number" } });
    if (whatsappSetting?.value) {
      whatsappLink = `https://wa.me/${whatsappSetting.value.replace(/\\D/g, '')}`;
    }
  } catch {
    // Database not ready yet
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
    APPROVED: "bg-green-500/20 text-green-400 border-green-500/20",
    REJECTED: "bg-red-500/20 text-red-400 border-red-500/20",
    CANCELLED: "bg-gray-500/20 text-gray-400 border-gray-500/20",
    COMPLETED: "bg-blue-500/20 text-blue-400 border-blue-500/20",
  };

  return (
    <div className="container mx-auto px-4 w-[92%] max-w-[1180px] py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="font-display text-4xl mb-2">My Dashboard</h1>
          <p className="text-[#b1b1ba]">Welcome back, {session.user.name || session.user.email}</p>
        </div>
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
        >
          <LogOut size={16} /> Sign Out
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-6">

          {/* Broadcast Board */}
          {globals.length > 0 && (
            <div className="space-y-4 mb-6">
              {globals.map(n => (
                <div key={n.id} className="relative overflow-hidden glass p-4 border-l-4 pr-10" style={{
                  borderLeftColor: n.type === 'URGENT' ? '#ef4444' : n.type === 'WARNING' ? '#eab308' : '#3b82f6'
                }}>
                  <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase text-white rounded-bl-lg ${n.type === 'URGENT' ? 'bg-red-500' : n.type === 'WARNING' ? 'bg-yellow-500' : 'bg-blue-500'}`}>
                    {n.type}
                  </div>
                  <h3 className="font-bold text-white mb-1.5">{n.title}</h3>
                  <p className="text-gray-300 text-sm">{n.content}</p>
                  <p className="text-xs text-gray-500 mt-2 font-medium">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}

          {/* Current Stay */}
          <div className="glass p-8">
            <h2 className="font-display text-2xl mb-6 flex items-center gap-2"><Clock size={20} className="text-[#ff7a1a]" /> Current Stay</h2>
            {profile?.residents?.filter((r: any) => r.status === "ACTIVE").length ? (
              profile.residents.filter((r: any) => r.status === "ACTIVE").map((res: any) => (
                <div key={res.id} className="p-5 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-2xl mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-[#ff7a1a]">{res.listing?.house?.name} — {res.listing?.title}</h3>
                      <p className="text-sm text-[#b1b1ba]">{res.listing?.house?.location}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                      {res.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)]">
                    <div>
                      <span className="text-gray-400 block mb-1">Check-in</span>
                      <strong className="text-white">{new Date(res.checkInDate).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">Due Date</span>
                      <strong className="text-[#ff7a1a]">{new Date(res.dueDate).toLocaleDateString()}</strong>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.1)] border rounded-2xl border-dashed">
                <p className="text-[#b1b1ba] mb-4">You have no active stays currently.</p>
                <Link
                  href="/book"
                  className="inline-flex px-5 py-2.5 bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold rounded-full"
                >
                  Book a Space
                </Link>
              </div>
            )}
          </div>

          {/* Booking History */}
          <div className="glass p-8">
            <h2 className="font-display text-2xl mb-6 flex items-center gap-2"><Calendar size={20} className="text-[#ff7a1a]" /> My Bookings</h2>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <div key={booking.id} className="p-5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-2xl">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-white">{booking.listing?.title}</h3>
                        <p className="text-xs text-[#b1b1ba]">{booking.listing?.house?.name} · {booking.listing?.house?.location}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusColors[booking.status] || ""}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                      <div>
                        <span className="text-gray-500 block text-xs">Check-in</span>
                        <span className="text-white text-sm">{new Date(booking.checkInDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Duration</span>
                        <span className="text-white text-sm">{booking.durationCount} {booking.duration?.toLowerCase()}</span>
                      </div>
                      {booking.totalPrice && (
                        <div>
                          <span className="text-gray-500 block text-xs">Est. Total</span>
                          <span className="text-[#ff7a1a] text-sm font-bold">₦{booking.totalPrice.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Submitted {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                    {booking.status === "PENDING" && (
                      <CancelBookingButton bookingId={booking.id} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No booking requests submitted yet.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="glass p-6">
            <h2 className="font-display text-xl mb-4 flex items-center gap-2"><User size={18} className="text-[#ff7a1a]" /> Profile</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Name</span>
                <span className="text-white font-medium">{session.user.name || "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className="text-white font-medium truncate max-w-[150px]">{session.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone</span>
                <span className="text-white font-medium">{profile?.phone || "Not set"}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass p-6">
            <h2 className="font-display text-xl mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/book"
                className="block text-center w-full py-3 rounded-xl bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold text-sm shadow-[0_10px_30px_rgba(255,122,26,0.28)]"
              >
                New Booking Request
              </Link>
              <Link
                href="/availability"
                className="block text-center w-full py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white font-bold text-sm hover:bg-[rgba(255,255,255,0.08)] transition"
              >
                Check Availability
              </Link>
              <Link
                href={whatsappLink}
                target="_blank"
                className="block text-center w-full py-3 rounded-xl bg-gradient-to-br from-[#25d366] to-[#18b453] text-white font-bold text-sm"
              >
                WhatsApp Support
              </Link>
              <Link
                href="/complaint"
                className="block text-center w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
              >
                Report an Issue / Complaint
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="glass p-6">
            <h2 className="font-display text-xl mb-3">Need Help?</h2>
            <p className="text-sm text-[#b1b1ba] mb-3">Contact us directly for any questions about your stay or account.</p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">📞 <span className="text-white">+234 814 541 6775</span></p>
              <p className="text-gray-400">📧 <span className="text-white text-xs">{contactEmail}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
