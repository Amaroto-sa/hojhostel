"use client";

import { useState } from "react";
import { Megaphone, Trash2, Globe, ShieldAlert } from "lucide-react";

export default function NoticesClient({ initialNotices }: { initialNotices: any[] }) {
    const [notices, setNotices] = useState(initialNotices);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    // form state
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [type, setType] = useState("INFO");

    async function handlePost(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const res = await fetch("/api/notices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, type })
        });

        if (res.ok) {
            const data = await res.json();
            setNotices([data, ...notices]);
            setShowForm(false);
            setTitle("");
            setContent("");
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Remove this notice?")) return;
        await fetch(`/api/notices?id=${id}`, { method: "DELETE" });
        setNotices(notices.filter(n => n.id !== id));
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-display text-3xl text-white">Broadcast Notices</h1>
                    <p className="text-[#b1b1ba] text-sm mt-1">Publish global announcements to all resident dashboards.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold hover:bg-blue-500 hover:text-white transition-all text-sm">
                    <Megaphone size={16} /> New Broadcast
                </button>
            </div>

            {showForm && (
                <form onSubmit={handlePost} className="glass p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h2 className="font-display text-xl mb-4 text-white">Post New Announcement</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Notice Title</label>
                            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Generator Maintenance Scheduled" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Severity Type</label>
                            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white">
                                <option value="INFO" className="bg-[#111]">Information (Blue)</option>
                                <option value="WARNING" className="bg-[#111]">Warning (Yellow)</option>
                                <option value="URGENT" className="bg-[#111]">Emergency (Red)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Content details</label>
                            <textarea required value={content} onChange={e => setContent(e.target.value)} rows={3} placeholder="Type announcement here..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white resize-none" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-5">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                        <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-500 text-white font-bold rounded-xl">{loading ? "Broadcasting..." : "Broadcast Notice"}</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notices.map((n) => (
                    <div key={n.id} className="glass p-6 border-l-4" style={{
                        borderLeftColor: n.type === 'URGENT' ? '#ef4444' : n.type === 'WARNING' ? '#eab308' : '#3b82f6'
                    }}>
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg text-white pr-4">{n.title}</h3>
                            <button onClick={() => handleDelete(n.id)} className="text-gray-500 hover:text-red-500">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <p className="text-gray-300 text-sm mb-4 leading-relaxed">{n.content}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                            <span className="flex items-center gap-1.5"><Globe size={14} /> Global</span>
                            <span className="flex items-center gap-1.5"><ShieldAlert size={14} /> {n.type}</span>
                            <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
                {notices.length === 0 && (
                    <div className="col-span-2 text-center p-10 text-gray-500">No active broadcasts.</div>
                )}
            </div>
        </div>
    );
}
