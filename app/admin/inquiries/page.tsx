"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, Calendar, Trash2, CheckCircle, Clock } from "lucide-react";

export default function AdminInquiries() {
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/inquiries")
            .then(res => res.json())
            .then(data => {
                setInquiries(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            await fetch(`/api/inquiries/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            setInquiries(inquiries.map(inq => inq.id === id ? { ...inq, status } : inq));
        } catch (err) {
            console.error(err);
        }
    };

    const deleteInquiry = async (id: string) => {
        if (!confirm("Are you sure you want to delete this inquiry?")) return;
        try {
            await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
            setInquiries(inquiries.filter(inq => inq.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return <div className="p-10 text-center animate-pulse text-[#b1b1ba]">Loading Inquiries...</div>;
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-display text-white mb-2">Website Inquiries</h1>
                    <p className="text-[#b1b1ba]">Manage and respond to messages from the contact form.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs text-[#b1b1ba] flex items-center gap-2">
                        <Mail size={14} className="text-[#ff7a1a]" />
                        Total: {inquiries.length}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {inquiries.length === 0 ? (
                    <div className="glass p-20 text-center text-[#b1b1ba]">
                        <Mail size={40} className="mx-auto mb-4 opacity-10" />
                        <p>No inquiries found.</p>
                    </div>
                ) : (
                    inquiries.map((inquiry) => (
                        <div key={inquiry.id} className={`glass p-6 md:p-8 transition-all hover:bg-white/[0.04] ${inquiry.status === 'UNREAD' ? 'border-l-4 border-l-[#ff7a1a]' : ''}`}>
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-display text-white font-semibold flex items-center gap-2">
                                        {inquiry.subject}
                                        {inquiry.status === 'UNREAD' && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff7a1a] text-[#111] font-bold">NEW</span>
                                        )}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#b1b1ba]">
                                        <span className="flex items-center gap-1.5 text-white font-medium">
                                            {inquiry.name}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Mail size={14} className="text-[#ff7a1a]" />
                                            {inquiry.email}
                                        </span>
                                        {inquiry.phone && (
                                            <span className="flex items-center gap-1.5">
                                                <Phone size={14} className="text-[#ff7a1a]" />
                                                {inquiry.phone}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-[#ff7a1a]" />
                                            {new Date(inquiry.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateStatus(inquiry.id, inquiry.status === 'READ' ? 'UNREAD' : 'READ')}
                                        className={`p-2.5 rounded-xl border transition-all ${inquiry.status === 'READ' 
                                            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                                        title={inquiry.status === 'READ' ? "Mark as Unread" : "Mark as Read"}
                                    >
                                        {inquiry.status === 'READ' ? <CheckCircle size={18} /> : <Clock size={18} />}
                                    </button>
                                    <button
                                        onClick={() => deleteInquiry(inquiry.id)}
                                        className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                        title="Delete Inquiry"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-[#ececf0] leading-relaxed">
                                {inquiry.message}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
 Linda
