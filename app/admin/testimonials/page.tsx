"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Star } from "lucide-react";

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ authorName: "", role: "", content: "", rating: 5, isActive: true });

  useEffect(() => { fetchTestimonials(); }, []);

  async function fetchTestimonials() {
    const res = await fetch("/api/testimonials");
    if (res.ok) setTestimonials(await res.json());
    setLoading(false);
  }

  async function handleSave() {
    const url = editingId ? `/api/testimonials/${editingId}` : "/api/testimonials";
    const method = editingId ? "PATCH" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditingId(null);
    setForm({ authorName: "", role: "", content: "", rating: 5, isActive: true });
    fetchTestimonials();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    fetchTestimonials();
  }

  async function toggleActive(id: string, currentValue: boolean) {
    await fetch(`/api/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !currentValue }),
    });
    fetchTestimonials();
  }

  function startEdit(t: any) {
    setForm({ authorName: t.authorName, role: t.role || "", content: t.content, rating: t.rating, isActive: t.isActive });
    setEditingId(t.id);
    setShowForm(true);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-3xl text-white">Testimonials</h1>
          <p className="text-[#b1b1ba] text-sm mt-1">Manage client testimonials shown on the public site.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold text-sm">
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {showForm && (
        <div className="glass p-6 mb-8 border-[#ff7a1a]/20">
          <h2 className="font-display text-xl mb-4 text-white">{editingId ? "Edit Testimonial" : "Add New Testimonial"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Author Name *</label>
              <input type="text" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Role (e.g. Student, Corper)</label>
              <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]" />
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2 text-gray-300">Content *</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3}
              className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] resize-none" />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm text-gray-300">Rating:</label>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setForm({ ...form, rating: n })} className={`text-xl ${n <= form.rating ? "text-[#ff7a1a]" : "text-gray-600"}`}>★</button>
            ))}
            <label className="flex items-center gap-2 text-sm text-gray-300 ml-4 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-[#ff7a1a]" />
              Show on site
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="px-6 py-2.5 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold text-sm">{editingId ? "Save" : "Add"}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-6 py-2.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white font-bold text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="glass p-10 text-center text-gray-500">Loading...</div>
        ) : testimonials.length === 0 ? (
          <div className="glass p-10 text-center text-gray-500">
            <p className="mb-2">No testimonials added yet.</p>
            <p className="text-xs">Client testimonials will appear here once you add them.</p>
          </div>
        ) : (
          testimonials.map((t: any) => (
            <div key={t.id} className="glass p-5 flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-white">{t.authorName}</span>
                  {t.role && <span className="text-xs text-[#b1b1ba] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded-full">{t.role}</span>}
                  {!t.isActive && <span className="text-xs text-gray-500 bg-gray-500/10 px-2 py-0.5 rounded-full">Hidden</span>}
                </div>
                <p className="text-sm text-gray-300 mb-2">{t.content}</p>
                <div className="text-[#ff7a1a] text-sm">{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleActive(t.id, t.isActive)} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)]">
                  {t.isActive ? <Eye size={16} className="text-green-400" /> : <EyeOff size={16} className="text-gray-500" />}
                </button>
                <button onClick={() => startEdit(t)} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)]"><Edit size={16} className="text-[#b1b1ba]" /></button>
                <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-500/10"><Trash2 size={16} className="text-red-400" /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
