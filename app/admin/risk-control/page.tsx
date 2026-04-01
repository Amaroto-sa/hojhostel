"use client";

import { useState, useEffect } from "react";
import { Key, Copy, CheckCircle, Search, AlertOctagon } from "lucide-react";

export default function RiskControlPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [resettingId, setResettingId] = useState<string | null>(null);
    const [newPasswords, setNewPasswords] = useState<Record<string, string>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/risk-control").then(r => r.json()).then(data => {
            if (Array.isArray(data)) {
                setUsers(data);
            }
            setLoading(false);
        });
    }, []);

    const handleReset = async (userId: string) => {
        if (!confirm("⚠️ WARNING: This will immediately overwrite the user's password. They will be locked out until you give them the new code. Proceed?")) return;

        setResettingId(userId);
        try {
            const res = await fetch("/api/admin/risk-control", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });
            const data = await res.json();
            if (data.success) {
                setNewPasswords(prev => ({ ...prev, [userId]: data.newPassword }));
            } else {
                alert("Failed to reset password: " + data.error);
            }
        } catch (e) {
            alert("Error resetting password.");
        } finally {
            setResettingId(null);
        }
    };

    const copyToClipboard = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filtered = users.filter((u: any) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="glass p-10 text-center text-[#ff7a1a]">Scanning network...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-display text-4xl text-white flex items-center gap-3">
                        <AlertOctagon className="text-red-500" size={32} />
                        Risk Control
                    </h1>
                    <p className="text-[#b1b1ba] text-sm mt-1">Force-reset compromised accounts or assist locked-out users.</p>
                </div>
            </div>

            <div className="glass p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full md:w-1/2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search accounts by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto border border-[rgba(255,255,255,0.08)] rounded-2xl bg-[rgba(255,255,255,0.015)]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#121216] text-[#b1b1ba] border-b border-[rgba(255,255,255,0.08)]">
                            <tr>
                                <th className="py-4 px-5 font-medium">User Details</th>
                                <th className="py-4 px-5 font-medium">Joined Date</th>
                                <th className="py-4 px-5 font-medium text-right">Reset Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? (
                                filtered.map((u) => (
                                    <tr key={u.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]">
                                        <td className="py-4 px-5">
                                            <div className="text-white font-medium text-base mb-1">{u.name || "Unknown"}</div>
                                            <div className="text-xs text-gray-500 font-mono">{u.email}</div>
                                        </td>
                                        <td className="py-4 px-5 text-gray-400">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-5 text-right">
                                            {newPasswords[u.id] ? (
                                                <div className="inline-flex flex-col items-end gap-1">
                                                    <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">New Password:</span>
                                                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 py-1.5 px-3 rounded-lg">
                                                        <span className="font-mono text-red-400 font-bold">{newPasswords[u.id]}</span>
                                                        <button
                                                            onClick={() => copyToClipboard(u.id, newPasswords[u.id])}
                                                            className="text-red-400 hover:text-white transition"
                                                            title="Copy to clipboard"
                                                        >
                                                            {copiedId === u.id ? <CheckCircle size={16} /> : <Copy size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleReset(u.id)}
                                                    disabled={resettingId === u.id}
                                                    className="inline-flex mx-auto items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl transition border border-red-500/20 font-medium disabled:opacity-50"
                                                >
                                                    <Key size={16} /> {resettingId === u.id ? "Overwriting..." : "Force Reset"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="py-12 text-center text-gray-500 border border-dashed border-[rgba(255,255,255,0.05)] rounded-2xl m-4">
                                        No user accounts match your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
