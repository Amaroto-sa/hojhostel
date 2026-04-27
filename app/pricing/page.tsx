import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pricing | HOJ Hostel",
  description: "View pricing for bed spaces and rooms at House of Jesse Hostel, Ajah Lagos. Flexible daily, weekly, and monthly plans.",
};

export default async function PricingPage() {
  let listings: any[] = [];

  try {
    listings = await prisma.listing.findMany({
      where: { isPublished: true },
      include: { house: true },
      orderBy: { price: "asc" }
    });
  } catch {
    // DB not ready yet
  }

  // Fallbacks if empty
  const plans = listings.length > 0 ? listings : [
    {
      title: "7 Bed Spaces",
      price: 30000,
      amenities: ["Shared accommodation", "Access to all amenities", "CCTV security", "Storage & wardrobe", "Cleaning services", "High-speed Wi-Fi"],
      isFeatured: false,
    },
    {
      title: "14 Bed Spaces",
      price: 40000,
      amenities: ["Premium shared space", "Extra ventilation", "Access to all amenities", "CCTV security", "Storage & wardrobe", "Kitchen access"],
      isFeatured: false,
    },
    {
      title: "Single Room A",
      price: 40000,
      amenities: ["Private room", "Standard size", "Personal space", "All amenities included", "Steady electricity", "Parking space"],
      isFeatured: false,
    },
    {
      title: "Single Room B",
      price: 70000,
      amenities: ["Premium private room", "Maximum privacy", "Enhanced features", "All amenities included", "Priority support", "Best-in-class comfort"],
      isFeatured: true,
    },
  ];

  return (
    <div className="container mx-auto px-4 w-[92%] max-w-[1180px] py-14">
      <div className="text-center mb-14">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-3">Simple, Transparent Pricing</h1>
        <p className="text-[#b1b1ba] text-lg max-w-2xl mx-auto">
          Affordable accommodation options across our locations. All prices include access to premium amenities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
        {plans.map((plan: any) => (
          <div key={plan.id || plan.title} className={`glass p-7 relative overflow-hidden transition-transform hover:-translate-y-1 ${plan.isFeatured ? 'border-[#ff7a1a]/30' : ''}`}>
            {plan.isFeatured && (
              <div className="absolute top-0 right-0 bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] text-xs font-bold px-4 py-1.5 rounded-bl-2xl">Premium</div>
            )}
            <h3 className="font-display text-xl mb-2">{plan.title}</h3>
            {plan.house && <p className="text-xs text-gray-400 mb-3">{plan.house.name} - {plan.house.location}</p>}
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-[#ff7a1a] text-3xl font-bold">₦{plan.price.toLocaleString()}</span>
              <span className="text-[#b1b1ba] text-sm">/ week</span>
            </div>

            <ul className="space-y-3 mb-8">
              {(plan.amenities && plan.amenities.length > 0 ? plan.amenities : ["Shared space", "All amenities", "Flexible stays"]).slice(0, 6).map((f: string) => (
                <li key={f} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-[#ff7a1a] mt-0.5">✔</span> {f}
                </li>
              ))}
            </ul>

            <Link href={plan.id ? `/book?listingId=${plan.id}` : "/book"} className={`block text-center w-full py-3 rounded-full font-bold text-sm transition mt-auto ${plan.isFeatured
              ? 'bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] shadow-[0_10px_30px_rgba(255,122,26,0.28)]'
              : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.1)]'
              }`}>
              Book Now
            </Link>
          </div>
        ))}
      </div>

      {/* Stay Duration Info */}
      <div className="glass p-8 md:p-10">
        <h2 className="font-display text-2xl mb-6">Flexible Stay Durations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]">
            <h3 className="font-bold text-lg mb-2">Daily</h3>
            <p className="text-sm text-[#b1b1ba] leading-relaxed">Perfect for visitors, travelers, and short stopovers who need quick, comfortable accommodation.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]">
            <h3 className="font-bold text-lg mb-2">Weekly</h3>
            <p className="text-sm text-[#b1b1ba] leading-relaxed">Great for trainees, temporary assignments, and guests staying for several days with flexible schedules.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]">
            <h3 className="font-bold text-lg mb-2">Monthly</h3>
            <p className="text-sm text-[#b1b1ba] leading-relaxed">Ideal for students, NYSC members, young professionals, and long-term guests seeking affordable stability.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
