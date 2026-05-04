"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, XCircle, Clock, Eye, Search, Download } from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [approvalModal, setApprovalModal] = useState({ isOpen: false, bookingId: "", residentName: "", checkInDate: "", adminNotes: "" });

  useEffect(() => { fetchBookings(); }, []);

  async function fetchBookings() {
    const res = await fetch("/api/bookings");
    setBookings(await res.json());
    setLoading(false);
  }

  async function updateStatus(id: string, status: string, overrides: any = {}) {
    if (status !== "APPROVED" && !window.confirm(`Are you sure you want to mark this booking as ${status}?`)) return;
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...overrides }),
    });
    fetchBookings();
  }

  function handleApproveSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateStatus(approvalModal.bookingId, "APPROVED", {
      checkInDate: approvalModal.checkInDate,
      adminNotes: approvalModal.adminNotes
    });
    setApprovalModal(prev => ({ ...prev, isOpen: false }));
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
    PENDING: "text-yellow-400 bg-yellow-500/10",
    APPROVED: "text-green-400 bg-green-500/10",
    REJECTED: "text-red-400 bg-red-500/10",
    CANCELLED: "text-gray-400 bg-gray-500/10",
    COMPLETED: "text-blue-400 bg-blue-500/10",
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">Booking Management</h1>
          <p className="text-[#b1b1ba] text-sm mt-1">Review, approve, or reject booking requests.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {filtered.length > 0 && (
            <button onClick={exportCSV} title="Export to CSV" className="shrink-0 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition">
              <Download size={16} />
            </button>
          )}

          {/* Search Bar */}
          <div className="relative w-full sm:w-[250px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff7a1a] transition-all placeholder:text-gray-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {["all", "PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${filter === f ? 'bg-[#ff7a1a] text-[#111]' : 'bg-[rgba(255,255,255,0.05)] text-[#b1b1ba] border border-[rgba(255,255,255,0.08)]'}`}>
                {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="glass p-10 text-center text-gray-500">Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div className="glass p-12 text-center flex flex-col items-center">
            <Search size={32} className="text-white/10 mb-3" />
            <p className="text-gray-400 font-medium">No {filter !== "all" ? filter.toLowerCase() : ""} bookings found.</p>
            {searchQuery && <p className="text-gray-600 text-sm mt-1">Try wiping your search string.</p>}
          </div>
        ) : (
          filtered.map((booking: any) => (
            <div key={booking.id} className="glass p-6 hover:border-[rgba(255,255,255,0.15)] transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-white">{booking.residentName}</h3>
                  <p className="text-sm text-[#b1b1ba]">{booking.residentEmail || booking.user?.email || 'No email'} · {booking.residentPhone}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[booking.status]}`}>
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4 pb-4 border-b border-[rgba(255,255,255,0.06)]">
                <div>
                  <span className="text-gray-500 block mb-1">Requested Space</span>
                  <span className="text-white font-medium">1 Space in [{booking.listing?.title}]</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">House</span>
                  <span className="text-white font-medium">{booking.listing?.house?.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Check-in</span>
                  <span className="text-white font-medium">{new Date(booking.checkInDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Duration</span>
                  <span className="text-white font-medium">{booking.durationCount} {booking.duration?.toLowerCase()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500 block mb-1">Emergency Contact</span>
                  <span className="text-white">{booking.emergencyContact} ({booking.emergencyRel})</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Address</span>
                  <span className="text-white">{booking.residentAddress || "Not provided"}</span>
                </div>
                {booking.totalPrice && (
                  <div>
                    <span className="text-gray-500 block mb-1">Est. Total</span>
                    <span className="text-[#ff7a1a] font-bold">₦{booking.totalPrice?.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {booking.notes && (
                <div className="text-sm mb-4 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
                  <span className="text-gray-500">Notes: </span><span className="text-gray-300">{booking.notes}</span>
                </div>
              )}

              {booking.status === "PENDING" && (
                <div className="flex gap-3">
                  <button onClick={() => setApprovalModal({ isOpen: true, bookingId: booking.id, residentName: booking.residentName, checkInDate: new Date(booking.checkInDate).toISOString().split('T')[0], adminNotes: "" })}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-bold border border-green-500/20 hover:bg-green-500/30 transition">
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button onClick={() => updateStatus(booking.id, "REJECTED")}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/20 text-red-400 text-sm font-bold border border-red-500/20 hover:bg-red-500/30 transition">
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              )}
              {booking.status === "APPROVED" && (
                <div className="flex gap-3">
                  <button onClick={() => updateStatus(booking.id, "COMPLETED")}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold border border-blue-500/20 hover:bg-blue-500/30 transition">
                    <CheckCircle size={16} /> Mark Completed
                  </button>
                  <button onClick={() => updateStatus(booking.id, "CANCELLED")}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-gray-500/20 text-gray-400 text-sm font-bold border border-gray-500/20 hover:bg-gray-500/30 transition">
                    <XCircle size={16} /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {approvalModal.isOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start pt-[15vh] justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111] border border-white/10 p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in slide-in-from-top-10 duration-200 mb-10">
            <h2 className="text-2xl font-display text-white mb-2">Approve Booking</h2>
            <p className="text-gray-400 text-sm mb-6">Review details for <strong className="text-white">{approvalModal.residentName}</strong>.</p>

            <form onSubmit={handleApproveSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Confirmed Check-In Date</label>
                <input
                  type="date"
                  value={approvalModal.checkInDate}
                  onChange={(e) => setApprovalModal({ ...approvalModal, checkInDate: e.target.value })}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Admin Notes (Optional)</label>
                <textarea
                  value={approvalModal.adminNotes}
                  onChange={(e) => setApprovalModal({ ...approvalModal, adminNotes: e.target.value })}
                  placeholder="Will be appended to booking notes..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] min-h-[100px] resize-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setApprovalModal({ ...approvalModal, isOpen: false })}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition shadow-[0_4px_14px_0_rgba(34,197,94,0.39)]"
                >
                  Confirm Approval
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
