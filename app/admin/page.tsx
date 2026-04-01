import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardOverview() {
  let totalListings = 0;
  let activeBookings = 0;
  let pendingRequests = 0;
  let totalResidents = 0;
  let pendingComplaints = 0;
  let unreadInquiries = 0;
  let estimatedRevenue = 0;

  let recentPending: any[] = [];
  let recentInquiries: any[] = [];
  let upcomingRenewals: any[] = [];
  let expectedCheckins: any[] = [];

  try {
    totalListings = await prisma.listing.count();
    activeBookings = await prisma.booking.count({
      where: { status: "APPROVED" },
    });
    pendingRequests = await prisma.booking.count({
      where: { status: "PENDING" },
    });
    totalResidents = await prisma.resident.count({
      where: { status: "ACTIVE" },
    });

    pendingComplaints =
      (await prisma.complaint.count({ where: { status: "OPEN" } })) +
      (await prisma.complaint.count({ where: { status: "PENDING" } }));

    unreadInquiries = await prisma.inquiry.count({
      where: { status: "UNREAD" },
    });

    const revenueBookings = await prisma.booking.findMany({
      where: { status: { in: ["APPROVED", "COMPLETED"] } },
      select: { totalPrice: true },
    });

    estimatedRevenue = revenueBookings.reduce(
      (sum, booking) => sum + Number(booking.totalPrice ?? 0),
      0
    );

    recentPending = await prisma.booking.findMany({
      where: { status: "PENDING" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { listing: { include: { house: true } } },
    });

    recentInquiries = await prisma.inquiry.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
    });

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 14);

    upcomingRenewals = await prisma.resident.findMany({
      where: {
        status: "ACTIVE",
        dueDate: {
          lte: nextWeek,
        },
      },
      take: 5,
      orderBy: { dueDate: "asc" },
      include: { listing: true },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    expectedCheckins = await prisma.booking.findMany({
      where: {
        status: "APPROVED",
        checkInDate: {
          gte: today,
          lte: nextWeek,
        },
      },
      take: 4,
      orderBy: { checkInDate: "asc" },
      include: { listing: true },
    });
  } catch {
    // Tables may not exist yet on first deploy
  }

  return (
    <div>
      <h1 className="font-display text-4xl mb-2 text-white">
        Admin Dashboard
      </h1>
      <p className="text-[#b1b1ba] mb-10">
        Overview of house, listings, and resident occupancy.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-10">
        <StatCard
          title="Total Revenue"
          value={`₦${estimatedRevenue.toLocaleString()}`}
          description="From approved bookings"
        />
        <StatCard
          title="Total Listings"
          value={totalListings}
          description="Apartments & bed spaces"
        />
        <StatCard
          title="Active Residents"
          value={totalResidents}
          description="Currently checked in"
        />
        <StatCard
          title="Pending Bookings"
          value={pendingRequests}
          description="Requires approval"
          alert={pendingRequests > 0}
        />
        <StatCard
          title="Pending Tickets"
          value={pendingComplaints}
          description="Reported issues"
          alert={pendingComplaints > 0}
        />
        <StatCard
          title="Unread Msgs"
          value={unreadInquiries}
          description="New contact msgs"
          alert={unreadInquiries > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl text-white">
                Recent Pending Bookings
              </h2>
              <Link
                href="/admin/bookings"
                className="text-sm text-[#ff7a1a] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden bg-[rgba(255,255,255,0.03)]">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#121216] text-[#b1b1ba] border-b border-[rgba(255,255,255,0.08)]">
                  <tr>
                    <th className="py-3 px-4 font-medium">Customer</th>
                    <th className="py-3 px-4 font-medium">Requested Space</th>
                    <th className="py-3 px-4 font-medium">Check-In</th>
                    <th className="py-3 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPending.length > 0 ? (
                    recentPending.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]"
                      >
                        <td className="py-3 px-4 text-white">
                          <div className="font-medium">
                            {booking.residentName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.residentPhone}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {booking.listing?.title}
                          <div className="text-xs text-gray-500">
                            {booking.durationCount} {booking.duration}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {new Date(booking.checkInDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href="/admin/bookings"
                            className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-gray-500"
                      >
                        No pending bookings at the moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-xl text-white">
                  Recent Inquiries
                </h2>
                <Link
                  href="/admin/inquiries"
                  className="text-sm text-[#ff7a1a] hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                {recentInquiries.length > 0 ? (
                  recentInquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className={`p-4 rounded-xl border ${inq.status === "UNREAD"
                          ? "border-[#ff7a1a]/30 bg-[rgba(255,122,26,0.05)]"
                          : "border-white/5 bg-white/5"
                        }`}
                    >
                      <div className="flex justify-between mb-1">
                        <strong className="text-white text-sm truncate">
                          {inq.name}
                        </strong>
                        {inq.status === "UNREAD" && (
                          <span className="text-[10px] bg-[#ff7a1a] text-[#111] font-bold px-1.5 rounded">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="text-[#b1b1ba] text-xs mb-2">
                        {inq.subject}
                      </div>
                      <p className="text-gray-400 text-xs line-clamp-2 italic">
                        "{inq.message}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-500 text-sm italic">
                    No inquiries received yet.
                  </div>
                )}
              </div>
            </div>

            <div className="glass p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-xl text-white">
                  Expected Check-Ins
                </h2>
                <Link
                  href="/admin/bookings"
                  className="text-sm text-[#ff7a1a] hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                {expectedCheckins.length > 0 ? (
                  expectedCheckins.map((booking) => {
                    const isToday =
                      new Date(booking.checkInDate).toDateString() ===
                      new Date().toDateString();

                    return (
                      <div
                        key={booking.id}
                        className={`p-4 rounded-xl border flex flex-col ${isToday
                            ? "border-green-500/30 bg-green-500/5"
                            : "border-blue-500/20 bg-blue-500/5"
                          }`}
                      >
                        <div className="flex justify-between mb-1">
                          <strong className="text-white text-sm truncate">
                            {booking.residentName}
                          </strong>
                          {isToday && (
                            <span className="text-[10px] bg-green-500 text-green-950 font-bold px-1.5 rounded">
                              ARRIVING TODAY
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-gray-400 mb-2">
                          {booking.listing?.title} • {booking.durationCount}{" "}
                          {booking.duration}
                        </div>

                        <div className="mt-auto pt-2 justify-between flex items-center border-t border-white/5 w-full text-xs">
                          <span className="text-gray-300 font-medium">
                            Date:{" "}
                            {new Date(
                              booking.checkInDate
                            ).toLocaleDateString()}
                          </span>
                          <span className="text-gray-500">
                            {booking.residentPhone}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-gray-500 text-sm italic border border-dashed border-[rgba(255,255,255,0.1)] rounded-xl">
                    No upcoming check-ins scheduled.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-xl text-white">
              Upcoming Due Dates
            </h2>
            <Link
              href="/admin/residents"
              className="text-sm text-[#b1b1ba] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingRenewals.length > 0 ? (
              upcomingRenewals.map((resident) => {
                const isOverdue = new Date(resident.dueDate) < new Date();

                return (
                  <div
                    key={resident.id}
                    className={`p-4 rounded-xl border ${isOverdue
                        ? "border-red-500/30 bg-red-500/5"
                        : "border-[#ff7a1a]/20 bg-[rgba(255,122,26,0.05)]"
                      } flex flex-col`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <strong className="text-white text-sm">
                        {resident.name}
                      </strong>
                      <span
                        className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 font-bold ${isOverdue
                            ? "bg-red-500/20 text-red-400"
                            : "bg-[#ff7a1a]/20 text-[#ff7a1a]"
                          }`}
                      >
                        {isOverdue ? "OVERDUE" : "DUE SOON"}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 mb-2">
                      {resident.listing?.title} • {resident.durationCount}{" "}
                      {resident.duration}
                    </div>

                    <div className="mt-auto pt-2 border-t border-white/5 flex justify-between items-center">
                      <span className="text-xs text-gray-300">
                        {new Date(resident.dueDate).toLocaleDateString()}
                      </span>
                      <Link
                        href="/admin/residents"
                        className="text-xs text-[#b1b1ba] hover:text-white"
                      >
                        Manage &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-gray-500 text-center py-6 border border-dashed border-[rgba(255,255,255,0.1)] rounded-xl">
                No renewals due in the next 14 days.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  alert = false,
}: {
  title: string;
  value: string | number;
  description: string;
  alert?: boolean;
}) {
  const numericValue =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^\d.-]/g, ""));

  const showAlert = alert && !Number.isNaN(numericValue) && numericValue > 0;

  return (
    <div
      className={`p-6 rounded-2xl border ${showAlert
          ? "border-[#ff7a1a]/30 bg-[rgba(255,122,26,0.08)]"
          : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
        } relative overflow-hidden`}
    >
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <div
        className={`text-4xl font-display font-bold ${showAlert ? "text-[#ff7a1a]" : "text-white"
          } mb-2`}
      >
        {value}
      </div>
      <p className="text-xs text-[#b1b1ba]">{description}</p>
      {showAlert && (
        <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-[#ff7a1a] animate-pulse"></div>
      )}
    </div>
  );
}