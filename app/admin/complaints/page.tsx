"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Clock, Trash2, Mail, Phone, Home } from "lucide-react";

export default function ComplaintsAdminPage() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/complaints")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setComplaints(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch("/api/admin/complaints", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            if (res.ok) {
                setComplaints(complaints.map(c => c.id === id ? { ...c, status } : c));
            }
        } catch (error) {
            console.error("Failed to update status");
        }
    };

    if (loading) {
        return (
            <div className="p-10 text-center">
                <h1 className="font-display text-3xl text-white mb-8">Complaints & Issues</h1>
                <div className="glass p-10 text-gray-500">Loading complaints...</div>
            </div>
        );
    }

    return (
        <div className="pb-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-display text-3xl text-white">Complaints & Issues</h1>
                    <p className="text-[#b1b1ba] text-sm mt-1">Manage resident reports and maintenance requests.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {complaints.length === 0 ? (
                    <div className="glass p-10 text-center text-gray-500 italic">No complaints reported yet.</div>
                ) : (
                    complaints.map((c) => (
                        <div key={c.id} className="glass p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.status === "RESOLVED" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                                c.status === "IN_PROGRESS" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                                    "bg-orange-500/10 text-[#ff7a1a] border border-[#ff7a1a]/20"
                                            }`}>
                                            {c.status.replace("_", " ")}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.priority === "URGENT" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                                c.priority === "HIGH" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                                                    "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                                            }`}>
                                            {c.priority} Priority
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-display text-white">{c.subject}</h2>
                                    <p className="text-sm text-[#ff7a1a] mt-1 font-medium italic">{c.category}</p>
                                </div>
                                <div className="flex gap-2">
                                    {c.status !== "IN_PROGRESS" && c.status !== "RESOLVED" && (
                                        <button onClick={() => updateStatus(c.id, "IN_PROGRESS")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all text-xs font-bold">
                                            <Clock size={14} /> Mark In Progress
                                        </button>
                                    )}
                                    {c.status !== "RESOLVED" && (
                                        <button onClick={() => updateStatus(c.id, "RESOLVED")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all text-xs font-bold">
                                            <CheckCircle size={14} /> Mark Resolved
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 mb-6 text-[#b1b1ba] text-sm leading-relaxed">
                                {c.description}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs border-t border-white/5 pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#ff7a1a]">
                                        <AlertCircle size={14} />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase tracking-widest text-[9px] font-bold mb-0.5">Reporter</p>
                                        <p className="text-white font-medium">{c.guestName || c.user?.name || "Anonymous"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#ff7a1a]">
                                        <Home size={14} />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase tracking-widest text-[9px] font-bold mb-0.5">Location</p>
                                        <p className="text-white font-medium">{c.house?.name || "Not Specified"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#ff7a1a]">
                                        <Phone size={14} />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase tracking-widest text-[9px] font-bold mb-0.5">Contact Phone</p>
                                        <p className="text-white font-medium">{c.guestPhone || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#ff7a1a]">
                                        <Clock size={14} />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase tracking-widest text-[9px] font-bold mb-0.5">Reported On</p>
                                        <p className="text-white font-medium">{new Date(c.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
