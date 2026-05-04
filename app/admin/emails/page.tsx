"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";

const emailSettings = [
  { key: "notification_email", label: "Admin Notification Target Email", type: "text" },
  { key: "contact_email", label: "Public Contact Email", type: "text" },
  { key: "email_booking_received", label: "Template: Booking Received (Initial Confirmation)", type: "textarea" },
  { key: "email_booking_approved", label: "Template: Booking Approved / Instructions", type: "textarea" },
  { key: "email_booking_rejected", label: "Template: Booking Rejected", type: "textarea" },
  { key: "house_rules", label: "Template: House Rules (Attached to approvals)", type: "textarea" },
];

export default function AdminEmailsPage() {
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

    const settingsArray = Object.entries(settings).map(([key, value]) => ({ key, value }));

    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bulk: true, settings: settingsArray }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div>
        <h1 className="font-display text-3xl text-white mb-8">Mailing & Emails</h1>
        <div className="glass p-10 text-center text-gray-500">Loading templates...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">Mailing & Emails</h1>
          <p className="text-[#b1b1ba] text-sm mt-1">Manage email targets, automated message templates, and communications.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold text-sm disabled:opacity-50 shrink-0 shadow-[0_4px_14px_0_rgba(255,122,26,0.2)]">
          <Save size={16} /> {saving ? "Saving..." : "Save Templates"}
        </button>
      </div>

      {saved && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl mb-6 text-sm text-center font-bold animate-in fade-in slide-in-from-top-4">
          Email templates and targets saved successfully!
        </div>
      )}

      <div className="glass p-6 md:p-8 space-y-8">
        {emailSettings.map((s) => (
          <div key={s.key} className="pb-6 border-b border-[rgba(255,255,255,0.05)] last:border-0 last:pb-0">
            <label className="block text-sm font-bold mb-2 text-white">{s.label}</label>
            {s.type === "textarea" ? (
              <textarea
                value={settings[s.key] || ""}
                onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })}
                rows={6}
                placeholder="Enter custom HTML or plain text message..."
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors resize-y leading-relaxed"
              />
            ) : (
              <input
                type="text"
                value={settings[s.key] || ""}
                onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })}
                placeholder="your@email.com"
                className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors"
              />
            )}
            <p className="text-xs text-gray-500 mt-2">
              {s.type === "textarea" ? "You can use basic line breaks. The system will auto-format it securely within the HOJ template wrapper." : "This address will receive automated updates."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
