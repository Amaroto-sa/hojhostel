import Link from "next/link";

export const metadata = {
  title: "Our Locations | HOJ Hostel",
  description: "Find House of Jesse Hostel locations in Olokonla and Olokonla Ajah, Lagos State.",
};

export default function LocationsPage() {
  return (
    <div className="container mx-auto px-4 w-[92%] max-w-[1180px] py-14">
      <div className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-3">Our Locations</h1>
        <p className="text-[#b1b1ba] text-lg max-w-2xl">
          House of Jesse operates across two well-located properties in the Ajah axis of Lagos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14">
        {/* HOJ 1 */}
        <div className="glass overflow-hidden group">
          <div className="h-[260px] bg-[url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-5 left-5 right-5">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">Active</span>
            </div>
          </div>
          <div className="p-7">
            <h2 className="font-display text-2xl mb-2">HOJ 1: Golden Rays Estate</h2>
            <p className="text-[#b1b1ba] text-sm mb-1">📍 Olokonla, Ajah, Lagos</p>
            <p className="text-[#b1b1ba] leading-relaxed mt-4 mb-6">
              Our primary, fully operational hostel location. Equipped with CCTV surveillance, steady electricity, backup generator, inverter/solar support, constant water supply, high-speed Wi-Fi, wardrobes, cleaning services, kitchen access, and parking space.
            </p>
            <div className="flex gap-3">
              <Link href="/availability" className="flex-1 text-center py-2.5 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold text-sm">
                Check Availability
              </Link>
              <Link href="https://wa.me/2348145416775" target="_blank" className="px-5 py-2.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white font-bold text-sm">
                WhatsApp
              </Link>
            </div>
          </div>
        </div>

        {/* HOJ 2 */}
        <div className="glass overflow-hidden group">
          <div className="h-[260px] bg-gradient-to-br from-[#1a1a20] to-[#0e0e12] flex items-center justify-center relative border-b border-[rgba(255,255,255,0.06)]">
            <div className="text-center px-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[rgba(255,122,26,0.15)] border border-[rgba(255,122,26,0.2)] flex items-center justify-center text-2xl mb-4">🏗️</div>
              <p className="text-[#b1b1ba] text-sm font-medium">More pictures coming soon</p>
            </div>
          </div>
          <div className="p-7">
            <h2 className="font-display text-2xl mb-2">HOJ 2: Greenland Estate</h2>
            <p className="text-[#b1b1ba] text-sm mb-1">📍 Olokonla Ajah, Lagos</p>
            <p className="text-[#b1b1ba] leading-relaxed mt-4 mb-6">
              Our second location in Greenland Estate. We are currently finalizing our premium setup to offer the highest level of comfort. Same trusted HOJ standards applied.
            </p>
            <div className="flex gap-3">
              <Link href="https://wa.me/2348145416775?text=Hi%2C+I+am+interested+in+HOJ+2+Greenland+Estate.+Please+share+more+info." target="_blank" className="flex-1 text-center py-2.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white font-bold text-sm">
                Inquire on WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities across all locations */}
      <div className="glass p-8 md:p-10">
        <h2 className="font-display text-2xl mb-6">Amenities Across All Locations</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: "🎥", label: "CCTV Surveillance" },
            { icon: "⚡", label: "Steady Electricity" },
            { icon: "🔋", label: "Backup Generator" },
            { icon: "☀️", label: "Solar/Inverter" },
            { icon: "💧", label: "Water Supply" },
            { icon: "📶", label: "High-Speed Wi-Fi" },
            { icon: "🗄️", label: "Wardrobes & Storage" },
            { icon: "🧹", label: "Cleaning Services" },
            { icon: "🍳", label: "Kitchen Access" },
            { icon: "🅿️", label: "Parking Space" },
          ].map((a) => (
            <div key={a.label} className="p-4 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-center transition hover:-translate-y-0.5">
              <div className="text-2xl mb-2">{a.icon}</div>
              <p className="text-sm text-gray-300 font-medium">{a.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
