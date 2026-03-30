"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BookPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    listingId: "",
    checkInDate: "",
    duration: "WEEKLY",
    durationCount: 1,
    residentName: "",
    residentPhone: "",
    residentEmail: "",
    residentAddress: "",
    emergencyContact: "",
    emergencyRel: "",
    notes: "",
  });

  const [accommodations, setAccommodations] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const list = data.map((l: any) => ({
            id: l.id,
            label: `${l.title} @ ${l.house?.name || "HOJ"} — ₦${l.price.toLocaleString()}/wk`
          }));
          setAccommodations(list);
        }
      })
      .catch(() => {
        // Fallback or ignore
      });
  }, []);

  const [isGuestAllowed, setIsGuestAllowed] = useState(false);
  const [whatsapp, setWhatsapp] = useState("2348145416775");

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data.enable_guest_booking === "true") setIsGuestAllowed(true);
        if (data.whatsapp_number) setWhatsapp(data.whatsapp_number);
      })
      .catch(() => { });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session && !isGuestAllowed) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          durationCount: Number(form.durationCount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Booking submission failed");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("An unexpected error occurred");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 w-[92%] max-w-[1180px] py-14">
        <div className="glass p-10 max-w-lg mx-auto text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-4xl mb-6">✓</div>
          <h1 className="font-display text-3xl mb-3">Booking Submitted!</h1>
          <p className="text-[#b1b1ba] mb-6">Your booking request has been received. Our team will review and get back to you shortly via email or WhatsApp.</p>
          <p className="text-sm text-[#b1b1ba] mb-8">House rules will be included in your welcome email once your booking is approved.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard" className="px-6 py-3 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold">View Dashboard</Link>
            <Link href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" className="px-6 py-3 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white font-bold">WhatsApp</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 w-[92%] max-w-[1180px] py-14">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <h1 className="font-display text-4xl tracking-tight mb-2">Book Your Space</h1>
          <p className="text-[#b1b1ba] mb-8">Fill out the form below to submit a booking request. Our team will review and confirm your booking.</p>

          {!session && !isGuestAllowed && (
            <div className="bg-[rgba(255,122,26,0.1)] border border-[rgba(255,122,26,0.2)] p-4 rounded-xl mb-8 flex items-center justify-between">
              <span className="text-[#ffd2b0] text-sm font-medium">Please sign in or create an account to submit a booking.</span>
              <Link href="/login" className="px-4 py-2 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold text-sm">Sign In</Link>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="glass p-6 md:p-8 space-y-6">
            <h2 className="font-display text-xl mb-1">Resident Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Full Name *</label>
                <input type="text" name="residentName" value={form.residentName} onChange={handleChange} required
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Phone Number *</label>
                <input type="tel" name="residentPhone" value={form.residentPhone} onChange={handleChange} required
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Email Address * <span className="text-[#b1b1ba] font-normal">(for booking updates & confirmations)</span></label>
              <input type="email" name="residentEmail" value={form.residentEmail} onChange={handleChange} required placeholder="your@email.com"
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Address</label>
              <input type="text" name="residentAddress" value={form.residentAddress} onChange={handleChange}
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Emergency Contact *</label>
                <input type="tel" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} required
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Relationship *</label>
                <input type="text" name="emergencyRel" value={form.emergencyRel} onChange={handleChange} required placeholder="e.g. Parent, Sibling, Guardian"
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors" />
              </div>
            </div>

            <hr className="border-[rgba(255,255,255,0.08)]" />
            <h2 className="font-display text-xl mb-1">Booking Details</h2>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Accommodation Type *</label>
              <select name="listingId" value={form.listingId} onChange={handleChange} required
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors">
                <option value="" className="bg-[#0a0a0c]">Select accommodation</option>
                {accommodations.map((a) => (
                  <option key={a.id} value={a.id} className="bg-[#0a0a0c]">{a.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Stay Duration *</label>
                <select name="duration" value={form.duration} onChange={handleChange}
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors">
                  <option value="DAILY" className="bg-[#0a0a0c]">Daily</option>
                  <option value="WEEKLY" className="bg-[#0a0a0c]">Weekly</option>
                  <option value="MONTHLY" className="bg-[#0a0a0c]">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Number of {form.duration === "DAILY" ? "Days" : form.duration === "WEEKLY" ? "Weeks" : "Months"} *</label>
                <input type="number" name="durationCount" value={form.durationCount} onChange={handleChange} min="1" required
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Preferred Check-in Date *</label>
                <input type="date" name="checkInDate" value={form.checkInDate} onChange={handleChange} required
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Additional Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Any special requests or questions..."
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors resize-none" />
            </div>

            <button
              type="submit"
              disabled={loading || (!session && !isGuestAllowed)}
              className="w-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(255,122,26,0.28)] hover:scale-[1.01] transition-transform disabled:opacity-50 text-lg"
            >
              {loading ? "Submitting..." : "Submit Booking Request"}
            </button>

            <p className="text-xs text-[#b1b1ba] text-center mt-2">
              House rules will be shared in the welcome email sent upon booking approval.
            </p>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass p-6">
            <h3 className="font-display text-lg mb-4">Quick Contact</h3>
            <p className="text-sm text-[#b1b1ba] mb-4">Prefer to book directly? Reach us on WhatsApp for instant response.</p>
            <Link href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" className="block text-center w-full py-3 rounded-full bg-gradient-to-br from-[#25d366] to-[#18b453] text-white font-bold text-sm">
              Chat on WhatsApp
            </Link>
          </div>

          <div className="glass p-6">
            <h3 className="font-display text-lg mb-4">What Happens Next?</h3>
            <ol className="space-y-4 text-sm text-[#b1b1ba]">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[rgba(255,122,26,0.15)] border border-[rgba(255,122,26,0.2)] flex-shrink-0 flex items-center justify-center text-[#ff7a1a] text-xs font-bold">1</span>
                <span>Submit your booking request through this form</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[rgba(255,122,26,0.15)] border border-[rgba(255,122,26,0.2)] flex-shrink-0 flex items-center justify-center text-[#ff7a1a] text-xs font-bold">2</span>
                <span>Our team reviews your request and confirms availability</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[rgba(255,122,26,0.15)] border border-[rgba(255,122,26,0.2)] flex-shrink-0 flex items-center justify-center text-[#ff7a1a] text-xs font-bold">3</span>
                <span>You receive confirmation with house rules via email</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[rgba(255,122,26,0.15)] border border-[rgba(255,122,26,0.2)] flex-shrink-0 flex items-center justify-center text-[#ff7a1a] text-xs font-bold">4</span>
                <span>Check in on your selected date and enjoy your stay!</span>
              </li>
            </ol>
          </div>

          <div className="glass p-6">
            <h3 className="font-display text-lg mb-3">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#b1b1ba]">
                <span>WhatsApp</span>
                <span className="text-white font-medium">{whatsapp}</span>
              </div>
              <div className="flex justify-between text-[#b1b1ba]">
                <span>Email</span>
                <span className="text-white font-medium text-xs">houseofjessehostel@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
