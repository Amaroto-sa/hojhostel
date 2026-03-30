"use client";

import { useState, useEffect } from "react";
import { Send, AlertTriangle, ShieldCheck } from "lucide-react";

export default function ComplaintPublicPage() {
    const [houses, setHouses] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        guestName: "",
        guestPhone: "",
        houseId: "",
        category: "MAINTENANCE",
        priority: "MEDIUM",
        subject: "",
        description: "",
    });

    useEffect(() => {
        fetch("/api/houses").then(r => r.json()).then(data => {
            if (Array.isArray(data)) setHouses(data);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/complaints", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) setSubmitted(true);
        } catch (error) {
            alert("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="glass p-10 text-center max-w-md">
                    <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                        <ShieldCheck size={40} />
                    </div>
                    <h1 className="font-display text-3xl text-white mb-2">Report Received</h1>
                    <p className="text-[#b1b1ba] mb-8">Your issue has been logged. Our management team will review it and take action as soon as possible.</p>
                    <button onClick={() => window.location.href = "/"} className="px-8 py-3 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold">Back to Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="mb-10 text-center">
                <h1 className="font-display text-4xl text-white mb-3">Report an Issue</h1>
                <p className="text-[#b1b1ba]">Help us serve you better by reporting maintenance issues or complaints.</p>
            </div>

            <div className="glass p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Your Full Name</label>
                            <input required value={formData.guestName} onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]" placeholder="Ex: John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                            <input required value={formData.guestPhone} onChange={e => setFormData({ ...formData, guestPhone: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]" placeholder="Ex: 08012345678" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Your Location (House)</label>
                            <select required value={formData.houseId} onChange={e => setFormData({ ...formData, houseId: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]">
                                <option value="" className="bg-[#111]">Select House</option>
                                {houses.map(h => <option key={h.id} value={h.id} className="bg-[#111]">{h.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]">
                                <option value="MAINTENANCE" className="bg-[#111]">Maintenance</option>
                                <option value="ELECTRICITY" className="bg-[#111]">Electricity / Power</option>
                                <option value="WATER" className="bg-[#111]">Water Supply</option>
                                <option value="SECURITY" className="bg-[#111]">Security</option>
                                <option value="NOISE" className="bg-[#111]">Noise Disturbance</option>
                                <option value="OTHER" className="bg-[#111]">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                        <input required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]" placeholder="Brief summary of the issue" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Detailed Description</label>
                        <textarea required rows={5} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] resize-none" placeholder="Provide as much detail as possible..." />
                    </div>

                    <div className="flex items-center gap-2 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 text-orange-200/70 text-xs">
                        <AlertTriangle size={16} className="shrink-0" />
                        <p>Urgent safety issues should be reported via WhatsApp immediately for faster response.</p>
                    </div>

                    <button type="submit" disabled={submitting}
                        className="w-full py-4 rounded-xl bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-extrabold text-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-[0_10px_25px_rgba(255,122,26,0.3)]">
                        {submitting ? "Submitting Report..." : (
                            <><Send size={20} /> Send Report</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
