import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardOverview() {
  let totalListings = 0;
  let activeBookings = 0;
  let pendingRequests = 0;
  let totalResidents = 0;

  try {
    totalListings = await prisma.listing.count();
    activeBookings = await prisma.booking.count({ where: { status: "APPROVED" }});
    pendingRequests = await prisma.booking.count({ where: { status: "PENDING" }});
    totalResidents = await prisma.resident.count({ where: { status: "ACTIVE" }});
  } catch {
    // Tables may not exist yet on first deploy
  }

  return (
    <div>
      <h1 className="font-display text-4xl mb-2 text-white">Admin Dashboard</h1>
      <p className="text-[#b1b1ba] mb-10">Overview of house, listings, and resident occupancy.</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard title="Total Listings" value={totalListings} description="Apartments & bed spaces" />
        <StatCard title="Active Residents" value={totalResidents} description="Currently checked in" />
        <StatCard title="Pending Bookings" value={pendingRequests} description="Requires approval" alert={pendingRequests > 0} />
        <StatCard title="Active Bookings" value={activeBookings} description="Approved requests" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6">
          <h2 className="font-display text-xl mb-4 text-white">Recent Pending Bookings</h2>
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
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">No pending bookings at the moment.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass p-6">
          <h2 className="font-display text-xl mb-4 text-white">Upcoming Due Dates</h2>
          <div className="space-y-4">
            <div className="text-sm text-gray-500 text-center py-6 border border-dashed border-[rgba(255,255,255,0.1)] rounded-xl">
              No renewals due in the next 7 days.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, description, alert = false }: { title: string, value: number, description: string, alert?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border ${alert ? 'border-[#ff7a1a]/30 bg-[rgba(255,122,26,0.08)]' : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]'} relative overflow-hidden`}>
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <div className={`text-4xl font-display font-bold ${alert ? 'text-[#ff7a1a]' : 'text-white'} mb-2`}>{value}</div>
      <p className="text-xs text-[#b1b1ba]">{description}</p>
      {alert && <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-[#ff7a1a] animate-pulse"></div>}
    </div>
  );
}
