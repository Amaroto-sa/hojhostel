"use client";

import { useState } from "react";
import { CheckSquare, ShieldCheck, Download } from "lucide-react";

export default function ClearanceClient({ initialClearances, initialPending }: { initialClearances: any[], initialPending: any[] }) {
    const [clearances, setClearances] = useState(initialClearances);
    const [pending, setPending] = useState(initialPending);
    const [loading, setLoading] = useState(false);

    // Form state
    const [activeResident, setActiveResident] = useState<any>(null);
    const [form, setForm] = useState({
        keysReturned: false,
        roomDamages: "",
        finesDeducted: 0,
        cautionRefunded: 0
    });

    async function submitClearance(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const res = await fetch("/api/clearance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, residentId: activeResident.id })
        });

        if (res.ok) {
            const data = await res.json();
            // Move from pending to clearances
            setPending(pending.filter(p => p.id !== activeResident.id));
            setClearances([data, ...clearances]);
            setActiveResident(null);
            setForm({ keysReturned: false, roomDamages: "", finesDeducted: 0, cautionRefunded: 0 });
        }
        setLoading(false);
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-display text-3xl text-white">Move-Out Clearances</h1>
                <p className="text-[#b1b1ba] text-sm mt-1">Audit room assets, deduct damages, and safely log discharges.</p>
            </div>

            {/* Requires Clearance Section */}
            <div className="glass rounded-2xl overflow-hidden mb-8">
                <div className="p-6 border-b border-white/5 bg-[#ff7a1a]/10">
                    <h3 className="font-display text-xl text-[#ff7a1a] flex items-center gap-2"><ShieldAlert /> Pending Clearances</h3>
                    <p className="text-gray-400 text-sm mt-1">Residents who have Moved Out but lack an operational security checkout.</p>
                </div>
                {pending.map((res) => (
                    <div key={res.id} className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <p className="font-bold text-white text-lg">{res.name}</p>
                            <p className="text-sm text-gray-400">{res.listing?.title} • Left: {new Date(res.dueDate).toLocaleDateString()}</p>
                        </div>
                        <button
                            onClick={() => setActiveResident(res)}
                            className="bg-[#2d2d30]/50 border border-white/10 hover:border-[#ff7a1a] px-5 py-2.5 rounded-full text-white text-sm font-bold flex gap-2 items-center transition-colors">
                            <CheckSquare size={16} /> Begin Checkout
                        </button>
                    </div>
                ))}
                {pending.length === 0 && (
                    <div className="p-8 text-center text-green-400 text-sm font-bold">All move-outs have been successfully cleared!</div>
                )}
            </div>

            {/* Clearance Form Modal */}
            {activeResident && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={submitClearance} className="bg-[#121216] border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative">
                        <h2 className="font-display text-xl text-white mb-2">Check Out: {activeResident.name}</h2>
                        <p className="text-gray-400 text-sm mb-6 pb-4 border-b border-white/5">Room: {activeResident.listing?.title}</p>

                        <div className="space-y-4">
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer">
                                <input type="checkbox" checked={form.keysReturned} onChange={e => setForm({ ...form, keysReturned: e.target.checked })} className="w-5 h-5 accent-[#ff7a1a]" />
                                <span className="text-white text-sm">Room Key Returned to Admin</span>
                            </label>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Room Damages noted (Optional)</label>
                                <textarea placeholder="e.g. Broken AC switch, missing chair..." rows={2} value={form.roomDamages} onChange={e => setForm({ ...form, roomDamages: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white resize-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Damages Deducted (₦)</label>
                                    <input type="number" value={form.finesDeducted} onChange={e => setForm({ ...form, finesDeducted: Number(e.target.value) })} className="w-full bg-white/5 border text-red-400 text-lg font-bold border-white/10 rounded-xl px-4 py-2.5" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Caution Fee Refunded (₦)</label>
                                    <input type="number" value={form.cautionRefunded} onChange={e => setForm({ ...form, cautionRefunded: Number(e.target.value) })} className="w-full bg-white/5 border text-green-400 text-lg font-bold border-white/10 rounded-xl px-4 py-2.5" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end mt-8 border-t border-white/5 pt-4">
                            <button type="button" onClick={() => setActiveResident(null)} className="px-5 py-2.5 text-gray-400 hover:text-white">Cancel</button>
                            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-[#ff7a1a] hover:bg-[#e66a10] text-[#111] font-bold rounded-xl transition">
                                {loading ? "Securing..." : "Log Checkout & Clear"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Clearance History */}
            <div className="glass rounded-2xl overflow-hidden mt-8">
                <div className="p-6 border-b border-white/5">
                    <h3 className="font-display text-xl text-white">Historical Clearances</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-sm text-gray-400">
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Resident</th>
                                <th className="p-4 font-medium">Deductions</th>
                                <th className="p-4 font-medium">Refunded</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {clearances.map((c) => (
                                <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="p-4 text-gray-300">{new Date(c.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-white font-bold">{c.resident?.name}</td>
                                    <td className="p-4 text-red-500 font-bold">₦{c.finesDeducted.toLocaleString()}</td>
                                    <td className="p-4 text-green-500 font-bold">₦{c.cautionRefunded.toLocaleString()}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-400/10 w-fit px-2 py-1 rounded">
                                            <ShieldCheck size={14} /> CLEARED
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {clearances.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No clearance history available.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const ShieldAlert = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>;
