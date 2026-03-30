"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff, Star } from "lucide-react";

export default function AdminListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showHouseForm, setShowHouseForm] = useState(false);

  const [activeTab, setActiveTab] = useState<"listings" | "houses">("listings");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingHouseId, setEditingHouseId] = useState<string | null>(null);

  const [form, setForm] = useState({
    houseId: "", title: "", type: "BED_SPACE", price: 0, capacity: 1,
    description: "", isFeatured: false, isPublished: true,
  });

  const [houseForm, setHouseForm] = useState({
    name: "", location: "", address: "", description: "", isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [listingsRes, housesRes] = await Promise.all([
      fetch("/api/listings"), fetch("/api/houses"),
    ]);
    setListings(await listingsRes.json());
    setHouses(await housesRes.json());
    setLoading(false);
  }

  async function handleSave() {
    const url = editingId ? `/api/listings/${editingId}` : "/api/listings";
    const method = editingId ? "PATCH" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setShowForm(false);
    setEditingId(null);
    setForm({ houseId: "", title: "", type: "BED_SPACE", price: 0, capacity: 1, description: "", isFeatured: false, isPublished: true });
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    fetchData();
  }

  async function toggleStatus(id: string, field: string, currentValue: any) {
    await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !currentValue }),
    });
    fetchData();
  }

  function startEdit(listing: any) {
    setForm({
      houseId: listing.houseId, title: listing.title, type: listing.type,
      price: listing.price, capacity: listing.capacity, description: listing.description || "",
      isFeatured: listing.isFeatured, isPublished: listing.isPublished,
    });
    setEditingId(listing.id);
    setShowForm(true);
  }

  async function handleSaveHouse() {
    const url = editingHouseId ? `/api/houses/${editingHouseId}` : "/api/houses";
    const method = editingHouseId ? "PATCH" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(houseForm),
    });

    setShowHouseForm(false);
    setEditingHouseId(null);
    setHouseForm({ name: "", location: "", address: "", description: "", isActive: true });
    fetchData();
  }

  async function handleDeleteHouse(id: string) {
    if (!confirm("Are you sure? This will delete the house AND all its associated listings and bookings!")) return;
    await fetch(`/api/houses/${id}`, { method: "DELETE" });
    fetchData();
  }

  function startEditHouse(house: any) {
    setHouseForm({
      name: house.name, location: house.location, address: house.address || "",
      description: house.description || "", isActive: house.isActive,
    });
    setEditingHouseId(house.id);
    setShowHouseForm(true);
  }

  const statusColors: Record<string, string> = {
    AVAILABLE: "text-green-400 bg-green-500/10", LIMITED: "text-yellow-400 bg-yellow-500/10",
    OCCUPIED: "text-red-400 bg-red-500/10", MAINTENANCE: "text-gray-400 bg-gray-500/10",
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">Listings & Houses</h1>
          <p className="text-[#b1b1ba] text-sm mt-1">Manage physical houses and their individual listings.</p>
        </div>
        <div className="flex bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-full p-1">
          <button onClick={() => setActiveTab("houses")} className={`px-5 py-2 rounded-full text-sm font-bold transition ${activeTab === "houses" ? "bg-[#ff7a1a] text-[#111]" : "text-[#b1b1ba] hover:text-white"}`}>Houses</button>
          <button onClick={() => setActiveTab("listings")} className={`px-5 py-2 rounded-full text-sm font-bold transition ${activeTab === "listings" ? "bg-[#ff7a1a] text-[#111]" : "text-[#b1b1ba] hover:text-white"}`}>Listings</button>
        </div>
        <button onClick={() => {
          if (activeTab === "listings") { setShowForm(true); setEditingId(null); }
          else { setShowHouseForm(true); setEditingHouseId(null); }
        }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold text-sm">
          <Plus size={16} /> {activeTab === "listings" ? "New Listing" : "New House"}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="glass p-6 mb-8 border-[#ff7a1a]/20">
          <h2 className="font-display text-xl mb-4 text-white">{editingId ? "Edit Listing" : "Create New Listing"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">House / Location *</label>
              <select value={form.houseId} onChange={(e) => setForm({ ...form, houseId: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]">
                <option value="">Select house</option>
                {houses.map((h: any) => <option key={h.id} value={h.id}>{h.name} — {h.location}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 7 Bed Spaces" className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]">
                <option value="BED_SPACE">Bed Space</option>
                <option value="SINGLE_ROOM">Single Room</option>
                <option value="APARTMENT">Apartment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Price (₦ / week) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Capacity *</label>
              <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} min="1"
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]" />
            </div>
          </div>
          <div className="flex items-center gap-6 mb-6">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-[#ff7a1a]" />
              Mark as Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="accent-[#ff7a1a]" />
              Published (visible on site)
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="px-6 py-2.5 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold text-sm">
              {editingId ? "Save Changes" : "Create Listing"}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-6 py-2.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white font-bold text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* House Management (visible only when activeTab === "houses") */}
      {activeTab === "houses" && (
        <div className="space-y-6">
          {showHouseForm && (
            <div className="glass p-6 border-[#ff7a1a]/20">
              <h2 className="font-display text-xl mb-4 text-white">{editingHouseId ? "Edit House" : "Create New House"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">House Name *</label>
                  <input type="text" value={houseForm.name} onChange={(e) => setHouseForm({ ...houseForm, name: e.target.value })}
                    placeholder="e.g. Royal Villa" className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Location Label *</label>
                  <input type="text" value={houseForm.location} onChange={(e) => setHouseForm({ ...houseForm, location: e.target.value })}
                    placeholder="e.g. Yaba" className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Full Address</label>
                  <input type="text" value={houseForm.address} onChange={(e) => setHouseForm({ ...houseForm, address: e.target.value })}
                    className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Description</label>
                  <input type="text" value={houseForm.description} onChange={(e) => setHouseForm({ ...houseForm, description: e.target.value })}
                    className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a]" />
                </div>
              </div>
              <div className="flex items-center gap-6 mb-6">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={houseForm.isActive} onChange={(e) => setHouseForm({ ...houseForm, isActive: e.target.checked })} className="accent-[#ff7a1a]" />
                  Active / Open for bookings
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSaveHouse} className="px-6 py-2.5 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold text-sm">
                  {editingHouseId ? "Save Changes" : "Create House"}
                </button>
                <button onClick={() => { setShowHouseForm(false); setEditingHouseId(null); }} className="px-6 py-2.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white font-bold text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {loading ? (
              <div className="text-gray-500 text-center col-span-3">Loading...</div>
            ) : houses.length === 0 ? (
              <div className="glass p-10 text-center text-gray-500 rounded-2xl col-span-3">No houses created yet. Create a house to add listings.</div>
            ) : (
              houses.map((h: any) => (
                <div key={h.id} className="glass p-5 flex flex-col items-start gap-2 relative">
                  <h3 className="font-bold text-lg text-white">{h.name}</h3>
                  <p className="text-[#b1b1ba] text-sm">{h.location}</p>
                  <div className="text-xs text-gray-500 mb-2">
                    {h.listings?.length || 0} Listings inside
                  </div>
                  <div className="flex gap-2 mt-auto w-full pt-4 border-t border-[rgba(255,255,255,0.05)]">
                    <button onClick={() => startEditHouse(h)} className="flex-1 px-3 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-xl text-sm font-medium text-white transition flex items-center justify-center gap-2"><Edit size={14} /> Edit</button>
                    <button onClick={() => handleDeleteHouse(h.id)} className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-500 font-medium transition flex items-center justify-center"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Listings Table (visible only when activeTab === "listings") */}
      {activeTab === "listings" && (
        <div className="glass overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#121216] text-[#b1b1ba] border-b border-[rgba(255,255,255,0.08)]">
              <tr>
                <th className="py-3 px-5 font-medium">Listing</th>
                <th className="py-3 px-5 font-medium">House</th>
                <th className="py-3 px-5 font-medium">Price</th>
                <th className="py-3 px-5 font-medium">Capacity</th>
                <th className="py-3 px-5 font-medium">Status</th>
                <th className="py-3 px-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-gray-500">Loading...</td></tr>
              ) : listings.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-gray-500">No listings yet. Create your first listing above.</td></tr>
              ) : (
                listings.map((l: any) => (
                  <tr key={l.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        {l.isFeatured && <Star size={14} className="text-[#ff7a1a]" />}
                        <span className="font-medium text-white">{l.title}</span>
                      </div>
                      <span className="text-xs text-gray-500">{l.type.replace("_", " ")}</span>
                    </td>
                    <td className="py-4 px-5 text-[#b1b1ba]">{l.house?.name}</td>
                    <td className="py-4 px-5 text-[#ff7a1a] font-semibold">₦{l.price?.toLocaleString()}/wk</td>
                    <td className="py-4 px-5 text-[#b1b1ba]">{l.occupied}/{l.capacity}</td>
                    <td className="py-4 px-5">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[l.status]}`}>{l.status}</span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleStatus(l.id, "isPublished", l.isPublished)} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)]" title={l.isPublished ? "Unpublish" : "Publish"}>
                          {l.isPublished ? <Eye size={16} className="text-green-400" /> : <EyeOff size={16} className="text-gray-500" />}
                        </button>
                        <button onClick={() => startEdit(l)} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)]"><Edit size={16} className="text-[#b1b1ba]" /></button>
                        <button onClick={() => handleDelete(l.id)} className="p-2 rounded-lg hover:bg-red-500/10"><Trash2 size={16} className="text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
