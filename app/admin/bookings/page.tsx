"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Search, Download, X, Calendar, Loader2 } from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Approval Modal
  const [approvalModal, setApprovalModal] = useState<any>(null);
  const [approvalForm, setApprovalForm] = useState({ checkInDate: "", priceOverride: "", adminNotes: "" });
  const [modalLoading, setModalLoading] = useState(false);

  // Rejection Modal
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => { fetchBookings(); }, []);

  async function fetchBookings() {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) setBookings(await res.json());
    } catch {
      // network error
    }
    setLoading(false);
  }

  // --- Modal openers ---

  function openApprovalModal(booking: any) {
    setApprovalForm({
      checkInDate: new Date(booking.checkInDate).toISOString().split("T")[0],
      priceOverride: booking.totalPrice?.toString() || "",
      adminNotes: "",
    });
    setModalLoading(false);
    setApprovalModal(booking);
  }

  function openRejectModal(booking: any) {
    setRejectReason("");
    setModalLoading(false);
    setRejectModal(booking);
  }

  // --- Modal confirmations ---

  async function confirmApproval() {
    if (!approvalModal) return;
    setModalLoading(true);
    try {
      const res = await fetch(`/api/bookings/${approvalModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "APPROVED",
          checkInOverride: approvalForm.checkInDate || undefined,
          priceOverride: approvalForm.priceOverride ? Number(approvalForm.priceOverride) : undefined,
          adminNotes: approvalForm.adminNotes || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to approve booking.");
      } else {
        setApprovalModal(null);
        fetchBookings();
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setModalLoading(false);
  }

  async function confirmRejection() {
    if (!rejectModal) return;
    setModalLoading(true);
    try {
      const res = await fetch(`/api/bookings/${rejectModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", adminNotes: rejectReason || undefined }),
      });
      if (!res.ok) {
        alert("Failed to reject booking.");
      } else {
        setRejectModal(null);
        fetchBookings();
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setModalLoading(false);
  }

  // --- Simple status update (for Complete / Cancel on approved) ---

  async function updateStatus(id: string, status: string) {
    if (!window.confirm(`Are you sure you want to mark this booking as ${status}?`)) return;
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchBookings();
  }

  // --- Filters ---

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

  const counts = bookings.reduce((acc: Record<string, number>, b: any) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // --- CSV Export ---

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

          {/* Status Tabs with Counts */}
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {["all", "PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${filter === f ? 'bg-[#ff7a1a] text-[#111]' : 'bg-[rgba(255,255,255,0.05)] text-[#b1b1ba] border border-[rgba(255,255,255,0.08)]'}`}>
                {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                {f === "all" ? (
                  <span className={`text-[10px] ${filter === f ? 'text-[#111]/60' : 'text-gray-500'}`}>({bookings.length})</span>
                ) : counts[f] ? (
                  <span className={`text-[10px] ${filter === f ? 'text-[#111]/60' : 'text-gray-500'}`}>({counts[f]})</span>
                ) : null}
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
                  <button onClick={() => openApprovalModal(booking)}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-bold border border-green-500/20 hover:bg-green-500/30 transition">
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button onClick={() => openRejectModal(booking)}
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

      {/* ═══════════════════════ APPROVAL MODAL ═══════════════════════ */}
      {approvalModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={() => !modalLoading && setApprovalModal(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full md:max-w-[520px] max-h-[92vh] overflow-y-auto bg-[#111113] border border-white/10 rounded-t-3xl md:rounded-2xl p-6 md:p-8 animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button onClick={() => !modalLoading && setApprovalModal(null)} className="absolute top-4 right-4 p-1 text-gray-500 hover:text-white transition rounded-lg hover:bg-white/10">
              <X size={20} />
            </button>

            <h2 className="font-display text-2xl text-white mb-1">Approve Booking</h2>
            <p className="text-sm text-[#b1b1ba] mb-6">Review and confirm details before approving.</p>

            {/* Booking Summary */}
            <div className="bg-white/5 border border-white/[0.08] rounded-xl p-4 mb-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-white">{approvalModal.residentName}</p>
                  <p className="text-xs text-[#b1b1ba]">{approvalModal.residentEmail || approvalModal.user?.email || "No email"} · {approvalModal.residentPhone}</p>
                </div>
                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold rounded-full">PENDING</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block mb-0.5">Accommodation</span>
                  <span className="text-white font-medium">{approvalModal.listing?.title}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">House</span>
                  <span className="text-white font-medium">{approvalModal.listing?.house?.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Duration</span>
                  <span className="text-white font-medium">{approvalModal.durationCount} {approvalModal.duration?.toLowerCase()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Original Price</span>
                  <span className="text-white font-medium">₦{approvalModal.totalPrice?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Override Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar size={14} className="text-[#ff7a1a]" />
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={approvalForm.checkInDate}
                  onChange={e => setApprovalForm(f => ({ ...f, checkInDate: e.target.value }))}
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors"
                />
                <p className="text-[11px] text-gray-500 mt-1.5">You can backdate this for residents who already checked in.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total Price (₦)
                </label>
                <input
                  type="number"
                  value={approvalForm.priceOverride}
                  onChange={e => setApprovalForm(f => ({ ...f, priceOverride: e.target.value }))}
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors"
                  placeholder="Leave as-is or override"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Notes <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <textarea
                  value={approvalForm.adminNotes}
                  onChange={e => setApprovalForm(f => ({ ...f, adminNotes: e.target.value }))}
                  rows={2}
                  placeholder="Internal note for this approval..."
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setApprovalModal(null)}
                disabled={modalLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmApproval}
                disabled={modalLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500/20 text-green-400 font-bold text-sm border border-green-500/20 hover:bg-green-500/30 transition disabled:opacity-50"
              >
                {modalLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Approving...</>
                ) : (
                  <><CheckCircle size={16} /> Confirm Approval</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════ REJECTION MODAL ═══════════════════════ */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={() => !modalLoading && setRejectModal(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full md:max-w-[460px] bg-[#111113] border border-white/10 rounded-t-3xl md:rounded-2xl p-6 md:p-8 animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => !modalLoading && setRejectModal(null)} className="absolute top-4 right-4 p-1 text-gray-500 hover:text-white transition rounded-lg hover:bg-white/10">
              <X size={20} />
            </button>

            <h2 className="font-display text-2xl text-white mb-1">Reject Booking</h2>
            <p className="text-sm text-[#b1b1ba] mb-6">This will notify <strong className="text-white">{rejectModal.residentName}</strong> via email.</p>

            <div className="bg-white/5 border border-white/[0.08] rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block mb-0.5">Accommodation</span>
                  <span className="text-white font-medium">{rejectModal.listing?.title}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">House</span>
                  <span className="text-white font-medium">{rejectModal.listing?.house?.name}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Rejection Reason <span className="text-gray-500 font-normal">(optional)</span></label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                placeholder="e.g. No availability, duplicate request..."
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal(null)}
                disabled={modalLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejection}
                disabled={modalLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 text-red-400 font-bold text-sm border border-red-500/20 hover:bg-red-500/30 transition disabled:opacity-50"
              >
                {modalLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Rejecting...</>
                ) : (
                  <><XCircle size={16} /> Confirm Rejection</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
