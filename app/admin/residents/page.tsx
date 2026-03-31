"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, LogOut as MoveOut, Clock, X, RefreshCw, Search, User, Home, Filter, Download, MessageCircle } from "lucide-react";

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Renew modal state
  const [renewModal, setRenewModal] = useState<{ open: boolean; resident: any | null }>({ open: false, resident: null });
  const [renewForm, setRenewForm] = useState<{ extensionDuration: string, extensionCount: number | string }>({ extensionDuration: "WEEKLY", extensionCount: 1 });
  const [renewing, setRenewing] = useState(false);

  // Search and Filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => { fetchResidents(); }, []);

  async function fetchResidents() {
    const res = await fetch("/api/residents");
    if (res.ok) setResidents(await res.json());
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/residents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchResidents();
  }

  function openRenewModal(resident: any) {
    setRenewForm({ extensionDuration: resident.duration, extensionCount: 1 });
    setRenewModal({ open: true, resident });
  }

  async function handleRenew() {
    if (!renewModal.resident) return;
    setRenewing(true);

    try {
      await fetch(`/api/residents/${renewModal.resident.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RENEW",
          extensionDuration: renewForm.extensionDuration,
          extensionCount: Math.max(1, Number(renewForm.extensionCount) || 1),
        }),
      });
      setRenewModal({ open: false, resident: null });
      fetchResidents();
    } catch {
      alert("Failed to renew. Please try again.");
    }
    setRenewing(false);
  }

  // Calculate new due date preview
  function previewNewDueDate() {
    if (!renewModal.resident) return "";
    const current = new Date(renewModal.resident.dueDate);
    const count = Number(renewForm.extensionCount) || 1;
    const newDue = new Date(current);
    switch (renewForm.extensionDuration) {
      case "DAILY": newDue.setDate(newDue.getDate() + count); break;
      case "WEEKLY": newDue.setDate(newDue.getDate() + count * 7); break;
      case "MONTHLY": newDue.setMonth(newDue.getMonth() + count); break;
    }
    return newDue.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  }

  const isOverdue = (date: string) => new Date() > new Date(date);
  const isDueSoon = (date: string) => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + 7);
    const due = new Date(date);
    return due <= threshold && due >= new Date();
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "text-green-400 bg-green-500/10",
    OVERDUE: "text-red-400 bg-red-500/10",
    INACTIVE: "text-gray-400 bg-gray-500/10",
    MOVED_OUT: "text-blue-400 bg-blue-500/10",
  };

  const filteredResidents = residents.filter(r => {
    // Status matching
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;

    // Search matching (Name, email, phone, or accommodation)
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.phone?.includes(q) ||
      r.listing?.title?.toLowerCase().includes(q) ||
      r.listing?.house?.name?.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  function exportCSV() {
    const headers = ["Resident Name", "Email", "Phone", "Accommodation", "Check In", "Due Date", "Status"];
    const rows = filteredResidents.map(r => [
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${r.phone || ''}"`,
      `"${(r.listing?.title || '').replace(/"/g, '""')}"`,
      `"${new Date(r.checkInDate).toLocaleDateString()}"`,
      `"${new Date(r.dueDate).toLocaleDateString()}"`,
      `"${r.status}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `hoj_residents_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="font-display text-3xl text-white">Resident Management</h1>
          <p className="text-[#b1b1ba] text-sm mt-1">Track current residents, due dates, and renewals.</p>
        </div>

        {/* Search, Filter, and Export Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={exportCSV} title="Export to CSV" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition">
            <Download size={16} /> Export
          </button>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search residents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full sm:w-[250px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff7a1a] transition-all placeholder:text-gray-500"
            />
          </div>

          <div className="relative shrink-0">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl pl-10 pr-8 py-2.5 text-sm text-[#b1b1ba] focus:outline-none focus:border-[#ff7a1a] transition-all cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="OVERDUE">Overdue</option>
              <option value="MOVED_OUT">Moved Out</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={14} className="text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Due Date Alerts */}
      {residents.filter(r => r.status === "ACTIVE" && (isOverdue(r.dueDate) || isDueSoon(r.dueDate))).length > 0 && (
        <div className="bg-[rgba(255,122,26,0.08)] border border-[rgba(255,122,26,0.2)] rounded-2xl p-5 mb-8">
          <h3 className="flex items-center gap-2 font-bold text-[#ff7a1a] mb-3"><AlertTriangle size={18} /> Upcoming / Overdue Renewals</h3>
          <div className="space-y-2">
            {residents.filter(r => r.status === "ACTIVE" && (isOverdue(r.dueDate) || isDueSoon(r.dueDate))).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between text-sm p-3 rounded-xl bg-[rgba(0,0,0,0.2)]">
                <span className="text-white font-medium">{r.name} — {r.listing?.title}</span>
                <div className="flex items-center gap-3">
                  <span className={isOverdue(r.dueDate) ? "text-red-400 font-bold" : "text-yellow-400"}>
                    Due: {new Date(r.dueDate).toLocaleDateString()} {isOverdue(r.dueDate) ? "(OVERDUE)" : "(Due Soon)"}
                  </span>
                  <button onClick={() => openRenewModal(r)}
                    className="px-3 py-1 rounded-lg bg-green-500/10 text-green-400 font-medium text-xs hover:bg-green-500/20 transition flex items-center gap-1">
                    <RefreshCw size={12} /> Renew
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Residents Table */}
      <div className="glass overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#121216] text-[#b1b1ba] border-b border-[rgba(255,255,255,0.08)]">
            <tr>
              <th className="py-3 px-5 font-medium">Resident</th>
              <th className="py-3 px-5 font-medium">Listing</th>
              <th className="py-3 px-5 font-medium">Check-in</th>
              <th className="py-3 px-5 font-medium">Due Date</th>
              <th className="py-3 px-5 font-medium">Status</th>
              <th className="py-3 px-5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center text-gray-500">Loading...</td></tr>
            ) : filteredResidents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12">
                  <div className="text-center flex flex-col items-center">
                    <Search size={32} className="text-white/10 mb-3" />
                    <p className="text-gray-400 font-medium">No residents found</p>
                    {searchQuery && <p className="text-gray-600 text-sm mt-1">Try adjusting your search query.</p>}
                  </div>
                </td>
              </tr>
            ) : (
              filteredResidents.map((r: any) => (
                <tr key={r.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="py-4 px-5">
                    <span className="font-medium text-white block">{r.name}</span>
                    <span className="text-xs text-gray-500">{r.phone} {r.email ? `· ${r.email}` : ''}</span>
                    <br />
                    <span className="text-xs text-gray-600">{r.emergencyContact} ({r.emergencyRel})</span>
                  </td>
                  <td className="py-4 px-5 text-[#b1b1ba]">{r.listing?.house?.name} — {r.listing?.title}</td>
                  <td className="py-4 px-5 text-[#b1b1ba]">{new Date(r.checkInDate).toLocaleDateString()}</td>
                  <td className="py-4 px-5">
                    <span className={`font-medium ${isOverdue(r.dueDate) ? 'text-red-400' : isDueSoon(r.dueDate) ? 'text-yellow-400' : 'text-white'}`}>
                      {new Date(r.dueDate).toLocaleDateString()}
                    </span>
                    <br />
                    <span className="text-xs text-gray-600">
                      {r.durationCount} {r.duration === "DAILY" ? "day" : r.duration === "WEEKLY" ? "week" : "month"}{r.durationCount > 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    {r.status === "ACTIVE" && (
                      <div className="flex items-center justify-end gap-2">
                        {(isOverdue(r.dueDate) || isDueSoon(r.dueDate)) && r.phone && (
                          <a href={`https://wa.me/${r.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${r.name}, this is a gentle reminder from House of Jesse Hostel regarding your stay at ${r.listing?.title || 'our hostel'}. Your rent is ${isOverdue(r.dueDate) ? '*currently OVERDUE*' : '*DUE SOON*'} (Due Date: ${new Date(r.dueDate).toDateString()}). Please check in with administration and renew your stay to avoid inconveniences. Thank you!`)}`}
                            target="_blank" rel="noopener noreferrer"
                            title="Send WhatsApp Reminder"
                            className="p-2 mr-1 rounded-lg bg-[rgba(255,122,26,0.1)] hover:bg-[rgba(255,122,26,0.2)] transition text-[#ff7a1a]">
                            <MessageCircle size={16} />
                          </a>
                        )}
                        <button onClick={() => openRenewModal(r)} title="Renew / Extend Stay"
                          className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 font-medium text-xs hover:bg-green-500/20 transition flex items-center gap-1">
                          <RefreshCw size={14} /> Renew
                        </button>
                        <button onClick={() => updateStatus(r.id, "MOVED_OUT")} title="Mark moved out"
                          className="p-2 rounded-lg hover:bg-blue-500/10"><MoveOut size={16} className="text-blue-400" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── RENEW MODAL ── */}
      {renewModal.open && renewModal.resident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#14141a] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 relative">
            <button onClick={() => setRenewModal({ open: false, resident: null })}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition"><X size={20} /></button>

            <h2 className="font-display text-2xl text-white mb-1">Extend Stay</h2>
            <p className="text-[#b1b1ba] text-sm mb-6">Renew stay for <strong className="text-white">{renewModal.resident.name}</strong></p>

            {/* Current info */}
            <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Accommodation</span>
                <span className="text-white font-medium">{renewModal.resident.listing?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Current Due Date</span>
                <span className={`font-medium ${isOverdue(renewModal.resident.dueDate) ? 'text-red-400' : 'text-white'}`}>
                  {new Date(renewModal.resident.dueDate).toLocaleDateString()}
                  {isOverdue(renewModal.resident.dueDate) && " (OVERDUE)"}
                </span>
              </div>
            </div>

            {/* Extension form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Extension Duration</label>
                <select value={renewForm.extensionDuration}
                  onChange={(e) => setRenewForm({ ...renewForm, extensionDuration: e.target.value })}
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors">
                  <option value="DAILY" className="bg-[#0a0a0c]">Daily</option>
                  <option value="WEEKLY" className="bg-[#0a0a0c]">Weekly</option>
                  <option value="MONTHLY" className="bg-[#0a0a0c]">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Number of {renewForm.extensionDuration === "DAILY" ? "Days" : renewForm.extensionDuration === "WEEKLY" ? "Weeks" : "Months"}
                </label>
                <input type="number" min="1" value={renewForm.extensionCount}
                  onChange={(e) => setRenewForm({ ...renewForm, extensionCount: e.target.value })}
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors" />
              </div>
            </div>

            {/* New due date preview */}
            <div className="bg-[rgba(255,122,26,0.08)] border border-[rgba(255,122,26,0.15)] rounded-xl p-4 mb-6 flex items-center justify-between">
              <span className="text-sm text-[#ffd2b0] font-medium">New Due Date</span>
              <span className="text-[#ff7a1a] font-bold text-lg">{previewNewDueDate()}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => setRenewModal({ open: false, resident: null })}
                className="flex-1 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white font-medium text-sm hover:bg-[rgba(255,255,255,0.08)] transition">
                Cancel
              </button>
              <button onClick={handleRenew} disabled={renewing || renewForm.extensionCount === "" || Number(renewForm.extensionCount) < 1}
                className="flex-1 py-3 rounded-xl bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold text-sm disabled:opacity-50 shadow-[0_10px_30px_rgba(255,122,26,0.25)] hover:scale-[1.01] transition-transform flex items-center justify-center gap-2">
                <CheckCircle size={16} /> {renewing ? "Extending..." : "Confirm Extension"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
