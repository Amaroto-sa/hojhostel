"use client";

import { useState } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function FinanceClient({ initialReceipts, initialExpenses }: { initialReceipts: any[], initialExpenses: any[] }) {
    const [expenses, setExpenses] = useState(initialExpenses);
    const [receipts] = useState(initialReceipts);

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ amount: "", category: "GENERAL", description: "" });
    const [loading, setLoading] = useState(false);

    const totalIncome = receipts.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    async function handleSaveExpense(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const res = await fetch("/api/finance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: Number(form.amount),
                category: form.category,
                description: form.description
            })
        });

        if (res.ok) {
            const newExp = await res.json();
            setExpenses([newExp, ...expenses]);
            setShowForm(false);
            setForm({ amount: "", category: "GENERAL", description: "" });
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this expense?")) return;
        await fetch(`/api/finance?id=${id}`, { method: "DELETE" });
        setExpenses(expenses.filter(e => e.id !== id));
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-display text-3xl text-white">Finance & Net Profit</h1>
                    <p className="text-[#b1b1ba] text-sm mt-1">Track income, log expenses, and calculate operational revenue.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all text-sm">
                    <Plus size={16} /> Log Expense
                </button>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass p-6 border-l-4 border-l-green-500">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="text-green-500" size={20} />
                        <h3 className="text-gray-400 font-medium">Gross Income</h3>
                    </div>
                    <p className="text-3xl font-display text-white">₦{totalIncome.toLocaleString()}</p>
                </div>
                <div className="glass p-6 border-l-4 border-l-red-500">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingDown className="text-red-500" size={20} />
                        <h3 className="text-gray-400 font-medium">Gross Expenses</h3>
                    </div>
                    <p className="text-3xl font-display text-white">₦{totalExpenses.toLocaleString()}</p>
                </div>
                <div className="glass p-6 border-l-4 border-l-[#ff7a1a]">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="text-[#ff7a1a]" size={20} />
                        <h3 className="text-gray-400 font-medium">Net Profit</h3>
                    </div>
                    <p className={`text-3xl font-display ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                        ₦{netProfit.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSaveExpense} className="glass p-6 mb-8 mt-4 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-display text-xl mb-4 text-white">Record New Expense</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Amount (₦)</label>
                            <input type="number" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white">
                                <option value="GENERAL" className="bg-[#111]">General</option>
                                <option value="GENERATOR" className="bg-[#111]">Generator/Fuel</option>
                                <option value="MAINTENANCE" className="bg-[#111]">Maintenance</option>
                                <option value="SALARY" className="bg-[#111]">Staff Salary</option>
                                <option value="UTILITY" className="bg-[#111]">Utility/Internet</option>
                                <option value="SUPPLIES" className="bg-[#111]">Supplies/Cleaning</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Description</label>
                            <input type="text" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Bought 50L Fuel" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                        <button type="submit" disabled={loading} className="px-5 py-2 bg-red-500 text-white font-bold rounded-xl">{loading ? "Saving..." : "Save Expense"}</button>
                    </div>
                </form>
            )}

            {/* Expenses Ledger */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="font-display text-xl text-white">Expense Ledger</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-sm text-gray-400">
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Description</th>
                                <th className="p-4 font-medium">Category</th>
                                <th className="p-4 font-medium">Amount</th>
                                <th className="p-4 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {expenses.length > 0 ? expenses.map((exp) => (
                                <tr key={exp.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="p-4 text-gray-300">{new Date(exp.date).toLocaleDateString()}</td>
                                    <td className="p-4 text-white font-medium">{exp.description}</td>
                                    <td className="p-4">
                                        <span className="px-2.5 py-1 bg-white/10 text-gray-300 text-xs rounded-lg">{exp.category}</span>
                                    </td>
                                    <td className="p-4 text-red-400 font-bold">- ₦{exp.amount.toLocaleString()}</td>
                                    <td className="p-4">
                                        <button onClick={() => handleDelete(exp.id)} className="text-gray-500 hover:text-red-500 transition">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No expenses recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
