"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";

const defaultSettings = [
  { key: "hostel_intro", label: "Hostel Introduction Text", type: "textarea" },
  { key: "whatsapp_number", label: "WhatsApp Number", type: "text" },
  { key: "contact_email", label: "Contact Email", type: "text" },
  { key: "footer_text", label: "Footer Text", type: "text" },
  { key: "house_rules", label: "House Rules / Welcome Message", type: "textarea" },
  { key: "logo_url", label: "Logo URL (from Cloudinary)", type: "text" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(data => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    for (const [key, value] of Object.entries(settings)) {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div>
        <h1 className="font-display text-3xl text-white mb-8">Settings</h1>
        <div className="glass p-10 text-center text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-3xl text-white">Site Settings</h1>
          <p className="text-[#b1b1ba] text-sm mt-1">Manage hostel content, contact info, and site configuration.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold text-sm disabled:opacity-50">
          <Save size={16} /> {saving ? "Saving..." : "Save All"}
        </button>
      </div>

      {saved && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-xl mb-6 text-sm text-center font-medium">
          Settings saved successfully!
        </div>
      )}

      <div className="glass p-6 md:p-8 space-y-6">
        {defaultSettings.map((s) => (
          <div key={s.key}>
            <label className="block text-sm font-medium mb-2 text-gray-300">{s.label}</label>
            {s.type === "textarea" ? (
              <textarea
                value={settings[s.key] || ""}
                onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })}
                rows={4}
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors resize-none"
              />
            ) : (
              <input
                type="text"
                value={settings[s.key] || ""}
                onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors"
              />
            )}
          </div>
        ))}
      </div>

      {/* Default Info */}
      <div className="glass p-6 mt-6">
        <h3 className="font-display text-lg mb-4 text-white">Default Contact Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <span className="text-gray-500 block mb-1">Default WhatsApp</span>
            <span className="text-white font-medium">+234 814 541 6775</span>
          </div>
          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <span className="text-gray-500 block mb-1">Default Email</span>
            <span className="text-white font-medium">houseofjessehostel@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
