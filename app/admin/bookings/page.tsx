"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CheckCircle, XCircle, Search, Download, Loader2, ChevronDown, ChevronUp } from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);
  const bookingRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ message, type });
    toastTimeout.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => { fetchBookings(); }, []);

  async function fetchBookings() {
    try {
      const res = await fetch("/api/bookings");
      setBookings(await res.json());
    } catch {
      showToast("Failed to load bookings", "error");
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string, name: string) {
    if (!window.confirm(`Are you sure you want to mark this booking as ${status}?`)) return;

    setActionLoading(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed");

      await fetchBookings();

      const label = status === "APPROVED" ? "✅ Approved" : status === "REJECTED" ? "❌ Rejected" : status === "COMPLETED" ? "✔️ Completed" : "🚫 Cancelled";
      showToast(`${label}: ${name}`, "success");

      // Scroll to the card after re-render
      setTimeout(() => {
        bookingRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    } catch {
      showToast(`Failed to update booking for ${name}`, "error");
    }
    setActionLoading(null);
  }

  const filtered = bookings.filter((b: any) => {
    const matchesFilter = filter === "all" || b.status === filter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      b.residentName?.toLowerCase().includes(q) ||
      b.residentEmail?.toLowerCase().includes(q) ||
      b.user?.email?.toLowerCase().includes(q) ||
      b.residentPhone?.includes(q) ||
      b.listing?.title?.toLowerCase().includes(q) ||
      b.listing?.house?.name?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  function exportCSV() {
    const headers = ["Resident Name", "Email", "Phone", "Accommodation", "Check In", "Duration", "Status", "Total Price"];
    const rows = filtered.map(b => [
      `"${(b.residentName || '').replace(/"/g, '""')}"`,
      `"${(b.residentEmail || b.user?.email || '').replace(/"/g, '""')}"`,
      `"${b.residentPhone || ''}"`,
      `"1 Space in [${(b.listing?.title || '').replace(/"/g, '""')}]"`,
      `"${new Date(b.checkInDate).toLocaleDateString()}"`,
      `"${b.durationCount} ${b.duration}"`,
      `"${b.status}"`,
      `"${b.totalPrice || 0}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `hoj_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const statusColors: Record<string, string> = {
    PENDING: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    APPROVED: "text-green-400 bg-green-500/10 border-green-500/20",
    REJECTED: "text-red-400 bg-red-500/10 border-red-500/20",
    CANCELLED: "text-gray-400 bg-gray-500/10 border-gray-500/20",
    COMPLETED: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  };

  const counts: Record<string, number> = { all: bookings.length };
  bookings.forEach(b => { counts[b.status] = (counts[b.status] || 0) + 1; });

  return (
    <div className="relative">
      {/* FLOATING TOAST */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-2xl border text-sm font-bold animate-in slide-in-from-right fade-in duration-300 max-w-sm ${
          toast.type === "success"
            ? "bg-green-500/20 border-green-500/40 text-green-300 shadow-green-500/10"
            : "bg-red-500/20 border-red-500/40 text-red-300 shadow-red-500/10"
        }`} style={{ backdropFilter: "blur(16px)" }}>
          {toast.message}
        </div>
      )}

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-30 pb-4 pt-1" style={{ background: "linear-gradient(to bottom, var(--bg, #0a0a0c) 80%, transparent)" }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <h1 className="font-display text-3xl text-white">Booking Management</h1>
            <p className="text-[#b1b1ba] text-sm mt-1">Review, approve, or reject booking requests.</p>
          </div>

          <div className="flex items-center gap-3">
            {filtered.length > 0 && (
              <button onClick={exportCSV} title="Export to CSV" className="shrink-0 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition">
                <Download size={16} />
              </button>
            )}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full sm:w-[220px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff7a1a] transition-all placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Status Tabs with counts */}
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
          {["all", "PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${filter === f ? 'bg-[#ff7a1a] text-[#111]' : 'bg-[rgba(255,255,255,0.05)] text-[#b1b1ba] border border-[rgba(255,255,255,0.08)]'}`}>
              {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              {counts[f] ? <span className={`text-[10px] ${filter === f ? 'text-[#111]/60' : 'text-gray-500'}`}>({counts[f]})</span> : null}
            </button>
          ))}
        </div>
      </div>

      {/* BOOKING LIST */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass p-10 text-center text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={20} /> Loading bookings...
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass p-12 text-center flex flex-col items-center">
            <Search size={32} className="text-white/10 mb-3" />
            <p className="text-gray-400 font-medium">No {filter !== "all" ? filter.toLowerCase() : ""} bookings found.</p>
            {searchQuery && <p className="text-gray-600 text-sm mt-1">Try wiping your search string.</p>}
          </div>
        ) : (
          filtered.map((booking: any) => {
            const isExpanded = expandedId === booking.id;
            const isActioning = actionLoading === booking.id;

            return (
              <div
                key={booking.id}
                ref={el => { bookingRefs.current[booking.id] = el; }}
                className={`glass p-5 hover:border-[rgba(255,255,255,0.15)] transition-all ${isActioning ? 'opacity-60 pointer-events-none' : ''}`}
              >
                {/* COMPACT ROW — always visible */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="min-w-0">
                      <h3 className="font-bold text-white truncate">{booking.residentName}</h3>
                      <p className="text-xs text-[#b1b1ba] truncate">
                        {booking.listing?.title} · {booking.listing?.house?.name} · {new Date(booking.checkInDate).toLocaleDateString()}
                        {booking.totalPrice ? ` · ₦${booking.totalPrice.toLocaleString()}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[booking.status]}`}>
                      {booking.status}
                    </span>

                    {/* ACTION BUTTONS — right on the compact row */}
                    {booking.status === "PENDING" && (
                      <>
                        <button onClick={() => updateStatus(booking.id, "APPROVED", booking.residentName)}
                          disabled={isActioning}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/20 hover:bg-green-500/30 transition">
                          {isActioning ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Approve
                        </button>
                        <button onClick={() => updateStatus(booking.id, "REJECTED", booking.residentName)}
                          disabled={isActioning}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 hover:bg-red-500/30 transition">
                          {isActioning ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Reject
                        </button>
                      </>
                    )}
                    {booking.status === "APPROVED" && (
                      <>
                        <button onClick={() => updateStatus(booking.id, "COMPLETED", booking.residentName)}
                          disabled={isActioning}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/20 hover:bg-blue-500/30 transition">
                          {isActioning ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Complete
                        </button>
                        <button onClick={() => updateStatus(booking.id, "CANCELLED", booking.residentName)}
                          disabled={isActioning}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gray-500/20 text-gray-400 text-xs font-bold border border-gray-500/20 hover:bg-gray-500/30 transition">
                          <XCircle size={14} /> Cancel
                        </button>
                      </>
                    )}

                    {/* Expand toggle */}
                    <button onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition" title="View details">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* EXPANDED DETAILS — only when toggled */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 block mb-1">Email</span>
                        <span className="text-white">{booking.residentEmail || booking.user?.email || "No email"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Phone</span>
                        <span className="text-white">{booking.residentPhone}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Duration</span>
                        <span className="text-white">{booking.durationCount} {booking.duration?.toLowerCase()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Est. Total</span>
                        <span className="text-[#ff7a1a] font-bold">{booking.totalPrice ? `₦${booking.totalPrice.toLocaleString()}` : "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Emergency</span>
                        <span className="text-white">{booking.emergencyContact} ({booking.emergencyRel})</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Address</span>
                        <span className="text-white">{booking.residentAddress || "Not provided"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Submitted</span>
                        <span className="text-white">{new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Booking ID</span>
                        <span className="text-white font-mono text-xs">{booking.id.substring(booking.id.length - 8).toUpperCase()}</span>
                      </div>
                    </div>
                    {booking.notes && (
                      <div className="text-sm mt-4 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
                        <span className="text-gray-500">Notes: </span><span className="text-gray-300">{booking.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
