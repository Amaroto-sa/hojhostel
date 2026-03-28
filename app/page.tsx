import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 w-[92%] max-w-[1180px] pb-24">

      {/* ── HERO ── */}
      <section className="pt-14 pb-11 relative" id="home">
        <div className="grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-6 items-stretch">
          <div className="glass p-8 md:p-12 relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,122,26,0.15)] border border-[rgba(255,122,26,0.22)] text-[#ffd2b0] text-sm font-bold mb-6">
              Safe · Clean · Comfortable Accommodation
            </div>
            <h1 className="font-display text-[clamp(2.5rem,5.5vw,4.5rem)] leading-none tracking-tight mb-5 max-w-[12ch]">
              Safe, Clean & <span className="text-[#ff7a1a]">Comfortable Hostel</span> in Ajah, Lagos.
            </h1>
            <p className="text-[#b1b1ba] leading-relaxed text-base md:text-lg max-w-[620px] mb-8">
              House of Jesse Hostel isn't just a place to sleep — it's your comfortable, affordable, and conveniently located accommodation with flexible payment. Suitable for starters, NYSC members, students, young professionals, and travelers in need of a clean, safe space for a night, week, or a month — we've got you covered.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <Link href="/availability" className="inline-flex items-center justify-center px-6 py-3.5 rounded-full font-extrabold transition-transform hover:-translate-y-0.5 bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#101010] shadow-[0_12px_30px_rgba(255,122,26,0.25)]">
                Check Availability
              </Link>
              <Link href="https://wa.me/2348145416775" target="_blank" className="inline-flex items-center justify-center px-6 py-3.5 rounded-full font-extrabold transition-transform hover:-translate-y-0.5 bg-white/5 border border-white/10 text-white">
                Book via WhatsApp
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center px-6 py-3.5 rounded-full font-extrabold transition-transform hover:-translate-y-0.5 bg-white/5 border border-white/10 text-white">
                Login / Register
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["🎥 CCTV", "⚡ Steady Electricity", "📶 Wi-Fi", "📅 Flexible Stay"].map((trust) => (
                <div key={trust} className="px-3 py-3 rounded-2xl bg-white/5 border border-white/10 text-[0.85rem] text-[#e9e9ec] text-center font-bold">
                  {trust}
                </div>
              ))}
            </div>
          </div>
          <div className="glass p-[18px] flex flex-col gap-[14px]">
            <div className="min-h-[350px] md:min-h-[430px] rounded-3xl overflow-hidden relative border border-white/10 bg-[url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center">
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60"></div>
              <div className="absolute bottom-[18px] left-[18px] right-[18px] p-5 rounded-2xl bg-gradient-to-b from-[#14141859] to-[#141418d1] backdrop-blur-md border border-white/10">
                <strong className="text-lg block mb-1">Modern & Secure Layout</strong>
                <span className="text-gray-300 text-sm leading-relaxed block">CCTV surveillance, parking space, constant water supply, and backup solar support.</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <strong className="block mb-1 text-white">Daily, Weekly, Monthly</strong>
                <span className="text-[#b1b1ba] text-[0.9rem]">Flexible stay options tailored to your schedule and duration needs.</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <strong className="block mb-1 text-white">Premium Amenities</strong>
                <span className="text-[#b1b1ba] text-[0.9rem]">Wardrobes, kitchen, cleaning services, and high-speed Wi-Fi included.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="py-10" id="about">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="glass p-8 md:p-10">
            <h2 className="font-display text-2xl md:text-3xl mb-4">About House of Jesse</h2>
            <p className="text-[#b1b1ba] leading-relaxed mb-4">
              House of Jesse (HOJ) Hostel is a bed space hostel providing safe, clean, and comfortable accommodation in the Ajah axis of Lagos. We operate across well-structured properties with all essential amenities for modern living.
            </p>
            <p className="text-[#b1b1ba] leading-relaxed mb-4">
              Our hostel model offers affordable bed spaces and private rooms, making quality accommodation accessible to a wider range of guests. Whether you need a space for a night, a week, or several months, HOJ is designed for comfort and trust.
            </p>
            <p className="text-[#b1b1ba] leading-relaxed">
              We cater to starters, NYSC members, students, young professionals, and travelers who value clean spaces, security, and a welcoming environment at an honest price.
            </p>
          </div>
          <div className="glass p-8 md:p-10">
            <h2 className="font-display text-2xl md:text-3xl mb-4">Who Is It For?</h2>
            <div className="grid gap-3">
              {[
                "🎓 Students seeking affordable accommodation near campus or work areas",
                "🏅 NYSC members looking for a reliable, safe base during service year",
                "💼 Young professionals who need a clean, convenient space in Lagos",
                "✈️ Travelers and visitors needing short-term comfortable lodging",
                "🌱 Starters beginning their Lagos journey who need an affordable base"
              ].map((item) => (
                <div key={item} className="p-4 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#ececf0] font-medium text-sm leading-relaxed">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AMENITIES ── */}
      <section className="py-10" id="amenities">
        <div className="mb-8">
          <h2 className="font-display text-3xl md:text-4xl tracking-tight mb-2">Premium Amenities</h2>
          <p className="text-[#b1b1ba] max-w-2xl">Everything you need for a comfortable, productive, and secure stay.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { icon: "🎥", title: "CCTV Surveillance", desc: "24/7 security monitoring" },
            { icon: "⚡", title: "Steady Electricity", desc: "Reliable power supply" },
            { icon: "🔋", title: "Backup Generator", desc: "Uninterrupted power" },
            { icon: "☀️", title: "Inverter / Solar", desc: "Renewable energy backup" },
            { icon: "💧", title: "Water Supply", desc: "Constant clean water" },
            { icon: "📶", title: "High-Speed Wi-Fi", desc: "Fast internet access" },
            { icon: "🗄️", title: "Wardrobes & Storage", desc: "Secure personal space" },
            { icon: "🧹", title: "Cleaning Services", desc: "Regular maintenance" },
            { icon: "🍳", title: "Kitchen Access", desc: "Self-catering available" },
            { icon: "🅿️", title: "Parking Space", desc: "Vehicle convenience" },
          ].map((a) => (
            <div key={a.title} className="glass p-5 text-center group hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[rgba(255,122,26,0.15)] border border-[rgba(255,122,26,0.2)] flex items-center justify-center text-xl mb-3">{a.icon}</div>
              <h3 className="font-bold text-sm mb-1">{a.title}</h3>
              <p className="text-xs text-[#b1b1ba]">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING / ACCOMMODATIONS ── */}
      <section className="py-10" id="pricing">
        <div className="mb-8">
          <h2 className="font-display text-3xl md:text-4xl tracking-tight mb-2">Our Accommodations</h2>
          <p className="text-[#b1b1ba] max-w-2xl">Clean, comfortable, and affordable room options across our key locations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { title: "7 Bed Spaces", price: "₦30,000", features: ["Shared accommodation", "Storage included", "All amenities access"], featured: false },
            { title: "14 Bed Spaces", price: "₦40,000", features: ["Premium shared space", "Extra ventilation", "All amenities access"], featured: false },
            { title: "Single Room A", price: "₦40,000", features: ["Private convenience", "Standard size", "All amenities included"], featured: false },
            { title: "Single Room B", price: "₦70,000", features: ["Maximum privacy", "Enhanced features", "Priority support"], featured: true },
          ].map((item) => (
            <div key={item.title} className={`glass p-6 group hover:-translate-y-1 transition-transform ${item.featured ? 'border-[#ff7a1a]/30 relative overflow-hidden' : ''}`}>
              {item.featured && <div className="absolute top-0 right-0 bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] text-xs font-bold px-3 py-1 rounded-bl-xl">Premium</div>}
              <h3 className="font-display text-xl mb-1">{item.title}</h3>
              <p className="text-[#ff7a1a] font-bold text-xl mb-4">{item.price} <span className="text-sm text-[#b1b1ba] font-normal">/ week</span></p>
              <ul className="space-y-2 mb-6 text-sm text-gray-300">
                {item.features.map((f) => <li key={f}>✔ {f}</li>)}
              </ul>
              <Link href="/book" className={`block text-center w-full py-2.5 rounded-full font-bold transition ${
                item.featured ? 'bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] shadow-[0_10px_30px_rgba(255,122,26,0.28)]' : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}>Inquire</Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── LOCATIONS ── */}
      <section className="py-10" id="locations">
        <div className="mb-8">
          <h2 className="font-display text-3xl md:text-4xl tracking-tight mb-2">Our Locations</h2>
          <p className="text-[#b1b1ba] max-w-2xl">Two well-located properties in the Ajah axis of Lagos.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="glass p-8 md:p-10">
            <h3 className="font-display text-2xl mb-3">HOJ 1: Golden Rays Estate</h3>
            <p className="text-[#b1b1ba] text-sm mb-1">📍 Olokonla, Ajah, Lagos</p>
            <p className="text-[#b1b1ba] leading-relaxed mt-3 mb-6">Our primary operational location. Fully fitted with CCTV, steady electricity, and all premium amenities for a comfortable extended stay.</p>
            <Link href="/availability" className="inline-flex items-center text-[#ff7a1a] font-bold hover:text-[#ff9f5a] transition">Check Availability →</Link>
          </div>
          <div className="glass p-8 md:p-10 relative overflow-hidden">
            <h3 className="font-display text-2xl mb-3">HOJ 2: Greenland Estate</h3>
            <p className="text-[#b1b1ba] text-sm mb-1">📍 Olokonla Ajah, Lagos</p>
            <p className="text-[#b1b1ba] leading-relaxed mt-3 mb-6">Our second location. We are currently finalizing our premium setup to offer the highest level of comfort. Same trusted HOJ standards.</p>
            <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm font-semibold text-gray-300">More pictures coming soon</div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="py-10" id="gallery">
        <div className="mb-8">
          <h2 className="font-display text-3xl md:text-4xl tracking-tight mb-2">Gallery</h2>
          <p className="text-[#b1b1ba] max-w-2xl">A glimpse into the HOJ Hostel living experience.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5">
          <div className="rounded-3xl overflow-hidden relative border border-white/10 min-h-[400px] bg-[url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center shadow-[0_25px_70px_rgba(0,0,0,0.35)]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-gradient-to-b from-[#12121640] to-[#121216d6] backdrop-blur-sm border border-white/10">
              <strong className="block mb-1">HOJ 1 — Golden Rays Estate</strong>
              <span className="text-gray-300 text-sm">Clean, spacious, and welcoming accommodation spaces.</span>
            </div>
          </div>
          <div className="grid gap-5">
            <div className="rounded-3xl overflow-hidden relative border border-white/10 min-h-[190px] bg-[url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center shadow-[0_25px_70px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[#121216a0] backdrop-blur-sm border border-white/10">
                <strong className="text-sm block">Comfortable Room Setup</strong>
                <span className="text-gray-400 text-xs">Built for rest and productivity.</span>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden relative border border-white/10 min-h-[190px] bg-gradient-to-br from-[#1a1a20] to-[#0e0e12] flex items-center justify-center shadow-[0_25px_70px_rgba(0,0,0,0.35)]">
              <div className="text-center px-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[rgba(255,122,26,0.12)] border border-[rgba(255,122,26,0.15)] flex items-center justify-center text-2xl mb-3">🏗️</div>
                <p className="font-bold text-sm mb-1">HOJ 2 Gallery</p>
                <p className="text-xs text-[#b1b1ba]">More pictures coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-10" id="testimonials">
        <div className="mb-8">
          <h2 className="font-display text-3xl md:text-4xl tracking-tight mb-2">What Our Guests Say</h2>
          <p className="text-[#b1b1ba] max-w-2xl">Real experiences from real residents.</p>
        </div>
        <div className="glass p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(255,122,26,0.12)] border border-[rgba(255,122,26,0.15)] flex items-center justify-center text-2xl mb-4">💬</div>
          <h3 className="font-display text-xl mb-2">Client Testimonials Will Be Added Here</h3>
          <p className="text-[#b1b1ba] text-sm max-w-lg mx-auto">More reviews coming soon. Our admin team will publish verified guest testimonials as they come in.</p>
        </div>
      </section>

      {/* ── BOOKING / INQUIRY ── */}
      <section className="py-10" id="book">
        <div className="glass p-8 md:p-10 bg-gradient-to-br from-[rgba(255,122,26,0.1)] to-[rgba(255,255,255,0.02)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] tracking-tight mb-3">Ready to book or make an inquiry?</h2>
              <p className="text-[#b1b1ba] max-w-xl leading-relaxed">
                Submit a booking request through our online form, or reach out directly on WhatsApp for personalized assistance. House rules will be included in your welcome email.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Link href="/book" className="px-8 py-3.5 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold shadow-[0_12px_30px_rgba(255,122,26,0.25)] text-center hover:-translate-y-0.5 transition-transform">
                Book Online
              </Link>
              <Link href="https://wa.me/2348145416775" target="_blank" className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-white font-bold text-center hover:-translate-y-0.5 transition-transform">
                Book via WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="py-10" id="contact">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="glass p-8">
            <h2 className="font-display text-2xl mb-5">Get in Touch</h2>
            <div className="space-y-4">
              {[
                { label: "Brand", value: "HOJ Hostel / House of Jesse" },
                { label: "WhatsApp / Booking", value: "+234 814 541 6775" },
                { label: "Email", value: "houseofjessehostel@gmail.com" },
                { label: "HOJ 1", value: "Golden Rays Estate, Olokonla, Ajah" },
                { label: "HOJ 2", value: "Greenland Estate, Olokonla Ajah" },
                { label: "Suitable For", value: "Students, NYSC members, professionals, travelers" },
              ].map((c) => (
                <div key={c.label} className="p-4 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]">
                  <strong className="block text-sm mb-1">{c.label}</strong>
                  <span className="text-[#b1b1ba] text-sm">{c.value}</span>
                </div>
              ))}
            </div>
            <Link href="https://wa.me/2348145416775" target="_blank" className="inline-flex items-center justify-center mt-6 px-6 py-3 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold shadow-[0_10px_30px_rgba(255,122,26,0.28)]">
              Chat on WhatsApp
            </Link>
          </div>
          <div className="glass p-8 flex flex-col justify-between">
            <div>
              <h2 className="font-display text-2xl mb-3">Ajah, Lagos</h2>
              <p className="text-[#b1b1ba] leading-relaxed">Both HOJ locations are situated in the rapidly growing Ajah corridor of Lagos, offering easy access to Lekki, Victoria Island, and surrounding areas.</p>
            </div>
            <div className="mt-6 rounded-2xl min-h-[250px] border border-white/10 bg-gradient-to-b from-black/20 to-black/40 bg-[url('https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center flex items-end p-5">
              <div className="px-4 py-2 rounded-full bg-[rgba(10,10,12,0.75)] border border-white/10 text-white font-bold text-sm backdrop-blur-sm">
                📍 Olokonla, Ajah, Lagos
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
