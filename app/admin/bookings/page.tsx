"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Eye, Search, Download, X, AlertTriangle } from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Approval modal state (allows admin to set/backdate check-in date)
  const [approvalModal, setApprovalModal] = useState<{ open: boolean; booking: any | null }>({ open: false, booking: null });
  const [approvalCheckInDate, setApprovalCheckInDate] = useState("");
  const [approving, setApproving] = useState(false);

  useEffect(() => { fetchBookings(); }, []);

  async function fetchBookings() {
    const res = await fetch("/api/bookings");
    setBookings(await res.json());
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    if (!window.confirm(`Are you sure you want to mark this booking as ${status}?`)) return;
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchBookings();
  }

  // Open approval modal — pre-fills with the booking's original check-in date
  function openApprovalModal(booking: any) {
    const d = new Date(booking.checkInDate);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setApprovalCheckInDate(dateStr);
    setApprovalModal({ open: true, booking });
  }

  // Approve with optional check-in date override (supports backdating)
  async function handleApprove() {
    if (!approvalModal.booking) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/bookings/${approvalModal.booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "APPROVED",
          checkInDate: approvalCheckInDate,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to approve booking");
        setApproving(false);
        return;
      }
      setApprovalModal({ open: false, booking: null });
      fetchBookings();
    } catch {
      alert("Failed to approve. Please try again.");
    }
    setApproving(false);
  }

  // Preview the calculated due date in the approval modal
  function previewDueDate() {
    if (!approvalModal.booking || !approvalCheckInDate) return "";
    const checkIn = new Date(approvalCheckInDate);
    if (isNaN(checkIn.getTime())) return "Invalid date";
    const count = approvalModal.booking.durationCount || 1;
    const duration = approvalModal.booking.duration;
    const due = new Date(checkIn);
    switch (duration) {
      case "DAILY": due.setDate(due.getDate() + count); break;
      case "WEEKLY": due.setDate(due.getDate() + count * 7); break;
      case "MONTHLY": due.setMonth(due.getMonth() + count); break;
    }
    return due.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  }

  // Check if the selected approval date is in the past
  function isCheckInPast() {
    if (!approvalCheckInDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(approvalCheckInDate);
    return selected < today;
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
                  <button onClick={() => openApprovalModal(booking)}
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

      {/* ── APPROVAL MODAL (supports backdating check-in) ── */}
      {approvalModal.open && approvalModal.booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#14141a] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 relative">
            <button onClick={() => setApprovalModal({ open: false, booking: null })}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition"><X size={20} /></button>

            <h2 className="font-display text-2xl text-white mb-1">Approve Booking</h2>
            <p className="text-[#b1b1ba] text-sm mb-6">Confirm check-in details for <strong className="text-white">{approvalModal.booking.residentName}</strong></p>

            {/* Booking summary */}
            <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Accommodation</span>
                <span className="text-white font-medium">{approvalModal.booking.listing?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">House</span>
                <span className="text-white font-medium">{approvalModal.booking.listing?.house?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="text-white font-medium">{approvalModal.booking.durationCount} {approvalModal.booking.duration?.toLowerCase()}</span>
              </div>
              {approvalModal.booking.totalPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Est. Total</span>
                  <span className="text-[#ff7a1a] font-bold">₦{approvalModal.booking.totalPrice?.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Editable check-in date — NO min restriction so admin can backdate */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-300">Check-In Date</label>
              <input
                type="date"
                value={approvalCheckInDate}
                onChange={(e) => setApprovalCheckInDate(e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1.5">You can set a past date if the guest checked in earlier than scheduled.</p>
            </div>

            {/* Past date warning */}
            {isCheckInPast() && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-4 text-sm text-yellow-400 flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>This check-in date is in the past. The due date will be calculated from this backdated date.</span>
              </div>
            )}

            {/* Calculated due date preview */}
            <div className="bg-[rgba(255,122,26,0.08)] border border-[rgba(255,122,26,0.15)] rounded-xl p-4 mb-6 flex items-center justify-between">
              <span className="text-sm text-[#ffd2b0] font-medium">Calculated Due Date</span>
              <span className="text-[#ff7a1a] font-bold text-lg">{previewDueDate()}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => setApprovalModal({ open: false, booking: null })}
                className="flex-1 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white font-medium text-sm hover:bg-[rgba(255,255,255,0.08)] transition">
                Cancel
              </button>
              <button onClick={handleApprove} disabled={approving || !approvalCheckInDate}
                className="flex-1 py-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-sm disabled:opacity-50 shadow-lg hover:scale-[1.01] transition-transform flex items-center justify-center gap-2">
                <CheckCircle size={16} /> {approving ? "Approving..." : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
