"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, LogOut as MoveOut, Clock } from "lucide-react";

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white">Resident Management</h1>
        <p className="text-[#b1b1ba] text-sm mt-1">Track current residents, due dates, and renewals.</p>
      </div>

      {/* Due Date Alerts */}
      {residents.filter(r => r.status === "ACTIVE" && (isOverdue(r.dueDate) || isDueSoon(r.dueDate))).length > 0 && (
        <div className="bg-[rgba(255,122,26,0.08)] border border-[rgba(255,122,26,0.2)] rounded-2xl p-5 mb-8">
          <h3 className="flex items-center gap-2 font-bold text-[#ff7a1a] mb-3"><AlertTriangle size={18} /> Upcoming / Overdue Renewals</h3>
          <div className="space-y-2">
            {residents.filter(r => r.status === "ACTIVE" && (isOverdue(r.dueDate) || isDueSoon(r.dueDate))).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between text-sm p-3 rounded-xl bg-[rgba(0,0,0,0.2)]">
                <span className="text-white font-medium">{r.name} — {r.listing?.title}</span>
                <span className={isOverdue(r.dueDate) ? "text-red-400 font-bold" : "text-yellow-400"}>
                  Due: {new Date(r.dueDate).toLocaleDateString()} {isOverdue(r.dueDate) ? "(OVERDUE)" : "(Due Soon)"}
                </span>
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
            ) : residents.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-gray-500">No residents found.</td></tr>
            ) : (
              residents.map((r: any) => (
                <tr key={r.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="py-4 px-5">
                    <span className="font-medium text-white block">{r.name}</span>
                    <span className="text-xs text-gray-500">{r.phone} · {r.emergencyContact} ({r.emergencyRel})</span>
                  </td>
                  <td className="py-4 px-5 text-[#b1b1ba]">{r.listing?.house?.name} — {r.listing?.title}</td>
                  <td className="py-4 px-5 text-[#b1b1ba]">{new Date(r.checkInDate).toLocaleDateString()}</td>
                  <td className="py-4 px-5">
                    <span className={`font-medium ${isOverdue(r.dueDate) ? 'text-red-400' : isDueSoon(r.dueDate) ? 'text-yellow-400' : 'text-white'}`}>
                      {new Date(r.dueDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    {r.status === "ACTIVE" && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => updateStatus(r.id, "ACTIVE")} title="Mark renewed/paid"
                          className="p-2 rounded-lg hover:bg-green-500/10"><CheckCircle size={16} className="text-green-400" /></button>
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
    </div>
  );
}
