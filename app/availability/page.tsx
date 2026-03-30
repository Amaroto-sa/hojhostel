import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Availability | HOJ Hostel",
  description: "Check current availability of bed spaces and rooms at House of Jesse Hostel, Ajah Lagos.",
};

export default async function AvailabilityPage() {
  let listings: any[] = [];
  let houses: any[] = [];
  let whatsappLink = "https://wa.me/2348145416775";

  try {
    listings = await prisma.listing.findMany({
      where: { isPublished: true },
      include: { house: true },
      orderBy: { createdAt: "desc" },
    });
    houses = await prisma.house.findMany({ where: { isActive: true } });
    
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => { settingsMap[s.key] = s.value; });
    const whatsapp = settingsMap["whatsapp_number"] || "2348145416775";
    const whatsappLinkNumber = whatsapp.replace(/\D/g, '');
    whatsappLink = `https://wa.me/${whatsappLinkNumber}`;
  } catch {
    // Database not connected yet — show static data
  }

  // Fallback static data when DB is not ready
  const staticListings = [
    { id: "1", title: "7 Bed Spaces", type: "BED_SPACE", price: 30000, capacity: 7, occupied: 0, status: "AVAILABLE", house: { name: "HOJ 1", location: "Golden Rays Estate, Olokonla" } },
    { id: "2", title: "14 Bed Spaces", type: "BED_SPACE", price: 40000, capacity: 14, occupied: 0, status: "AVAILABLE", house: { name: "HOJ 1", location: "Golden Rays Estate, Olokonla" } },
    { id: "3", title: "Single Room A", type: "SINGLE_ROOM", price: 40000, capacity: 1, occupied: 0, status: "AVAILABLE", house: { name: "HOJ 1", location: "Golden Rays Estate, Olokonla" } },
    { id: "4", title: "Single Room B", type: "SINGLE_ROOM", price: 70000, capacity: 1, occupied: 0, status: "AVAILABLE", house: { name: "HOJ 2", location: "Greenland Estate, Olokonla Ajah" } },
  ];

  const displayListings = listings.length > 0 ? listings : staticListings;

  const statusColors: Record<string, string> = {
    AVAILABLE: "bg-green-500/20 text-green-400 border-green-500/30",
    LIMITED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    OCCUPIED: "bg-red-500/20 text-red-400 border-red-500/30",
    MAINTENANCE: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  return (
    <div className="container mx-auto px-4 w-[92%] max-w-[1180px] py-14">
      <div className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-3">Current Availability</h1>
        <p className="text-[#b1b1ba] text-lg max-w-2xl">
          View real-time availability of bed spaces and rooms across our locations. Availability syncs with our booking system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayListings.map((listing: any) => (
          <div key={listing.id} className="glass p-6 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display text-xl font-semibold">{listing.title}</h3>
                <p className="text-sm text-[#b1b1ba] mt-1">{listing.house?.name} · {listing.house?.location}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[listing.status] || statusColors.AVAILABLE}`}>
                {listing.status === "AVAILABLE" ? "Available" : listing.status === "LIMITED" ? "Limited" : listing.status === "OCCUPIED" ? "Occupied" : "Maintenance"}
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-[#ff7a1a] text-2xl font-bold">₦{listing.price.toLocaleString()}</span>
              <span className="text-[#b1b1ba] text-sm">/ week</span>
            </div>

            <div className="flex items-center justify-between text-sm text-[#b1b1ba] mb-5 pb-4 border-b border-[rgba(255,255,255,0.08)]">
              <span>Capacity: {listing.capacity}</span>
              <span>Available: {Math.max(0, listing.capacity - (listing.occupied || 0))}</span>
            </div>

            <div className="flex gap-3">
              {listing.status !== "OCCUPIED" ? (
                <>
                  <Link href="/book" className="flex-1 text-center py-2.5 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold text-sm transition hover:shadow-[0_10px_30px_rgba(255,122,26,0.28)]">
                    Book Now
                  </Link>
                  <Link href={`${whatsappLink}?text=${encodeURIComponent(`Hi, I want to inquire about ${listing.title}`)}`} target="_blank" className="px-4 py-2.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-sm font-bold transition hover:bg-[rgba(255,255,255,0.1)]">
                    WhatsApp
                  </Link>
                </>
              ) : (
                <span className="flex-1 text-center py-2.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#b1b1ba] text-sm">
                  Currently Full
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 glass p-8 text-center">
        <h2 className="font-display text-2xl mb-3">Can't find what you're looking for?</h2>
        <p className="text-[#b1b1ba] mb-6 max-w-lg mx-auto">Reach out to us directly on WhatsApp for personalized assistance with your accommodation needs.</p>
        <Link href={whatsappLink} target="_blank" className="inline-flex px-6 py-3 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold shadow-[0_10px_30px_rgba(255,122,26,0.28)]">
          Chat on WhatsApp
        </Link>
      </div>
    </div>
  );
}
