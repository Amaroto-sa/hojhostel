"use client";

import { useState, useEffect } from "react";
import { Lock, Save, User, Mail, ShieldCheck } from "lucide-react";

export default function AdminSecurityPage() {
    const [profile, setProfile] = useState({ name: "", email: "" });
    const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetch("/api/admin/security")
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setProfile({ name: data.user.name || "", email: data.user.email || "" });
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setSaving(true);

        try {
            const res = await fetch("/api/admin/security", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "UPDATE_PROFILE", ...profile }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to update profile");

            setMessage({ type: "success", text: "Profile details updated successfully." });
        } catch (error: any) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (passwords.newPassword && passwords.newPassword.length < 8) {
            return setMessage({ type: "error", text: "New password must be at least 8 characters long." });
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            return setMessage({ type: "error", text: "Passwords do not match." });
        }

        setSaving(true);
        try {
            const res = await fetch("/api/admin/security", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "UPDATE_PASSWORD", ...passwords }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to update password");

            setMessage({ type: "success", text: "Password changed successfully." });
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-10 text-center animate-pulse text-[#b1b1ba]">Loading Security Settings...</div>;
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-display text-3xl text-white flex items-center gap-3">
                    <ShieldCheck className="text-[#ff7a1a]" size={32} /> Security Settings
                </h1>
                <p className="text-[#b1b1ba] text-sm mt-1">Manage your admin profile, email address, and account password.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2 font-medium animate-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                    {message.type === 'success' ? <ShieldCheck size={18} /> : <Lock size={18} />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Settings */}
                <div className="glass p-6 md:p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                        <User size={100} />
                    </div>
                    <form onSubmit={handleUpdateProfile}>
                        <h2 className="text-xl font-display text-white mb-6 border-b border-white/10 pb-4">Personal Information</h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User size={16} className="text-gray-500" />
                                    </div>
                                    <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}
                                        className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Email Address (Login ID)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail size={16} className="text-gray-500" />
                                    </div>
                                    <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} required
                                        className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors" />
                                </div>
                                <p className="text-xs text-yellow-500/80 mt-2">Warning: Changing this modifies the email you use to sign in.</p>
                            </div>

                            <button type="submit" disabled={saving}
                                className="mt-4 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center gap-2 disabled:opacity-50">
                                <Save size={16} /> Update Profile
                            </button>
                        </div>
                    </form>
                </div>

                {/* Password Settings */}
                <div className="glass p-6 md:p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                        <Lock size={100} />
                    </div>
                    <form onSubmit={handleUpdatePassword}>
                        <h2 className="text-xl font-display text-white mb-6 border-b border-white/10 pb-4">Change Password</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Current Password</label>
                                <input type="password" required value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">New Password</label>
                                <input type="password" required minLength={8} value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Confirm New Password</label>
                                <input type="password" required minLength={8} value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border--[#ff7a1a] transition-colors" />
                            </div>

                            <button type="submit" disabled={saving}
                                className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold shadow-[0_10px_30px_rgba(255,122,26,0.2)] hover:scale-[1.02] transition-transform flex items-center gap-2 disabled:opacity-50">
                                <Lock size={16} /> Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
