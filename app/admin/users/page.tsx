"use client";

import { useState, useEffect } from "react";
import { UserCircle, Mail, Calendar, Shield } from "lucide-react";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    }

    const filteredUsers = filter === "all" ? users : users.filter((u: any) => u.role === filter);

    const roleColors: Record<string, string> = {
        CUSTOMER: "text-[#b1b1ba] bg-[rgba(255,255,255,0.05)]",
        ADMIN: "text-blue-400 bg-blue-500/10",
        SUPER_ADMIN: "text-purple-400 bg-purple-500/10",
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="font-display text-3xl text-white">Registered Users</h1>
                    <p className="text-[#b1b1ba] text-sm mt-1">View all user and tenant accounts registered in the system.</p>
                </div>
                <div className="flex bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-full p-1">
                    <button onClick={() => setFilter("all")} className={`px-5 py-2 rounded-full text-sm font-bold transition ${filter === "all" ? "bg-[#ff7a1a] text-[#111]" : "text-[#b1b1ba] hover:text-white"}`}>All</button>
                    <button onClick={() => setFilter("CUSTOMER")} className={`px-5 py-2 rounded-full text-sm font-bold transition ${filter === "CUSTOMER" ? "bg-[#ff7a1a] text-[#111]" : "text-[#b1b1ba] hover:text-white"}`}>Customers</button>
                    <button onClick={() => setFilter("ADMIN")} className={`px-5 py-2 rounded-full text-sm font-bold transition ${filter === "ADMIN" ? "bg-[#ff7a1a] text-[#111]" : "text-[#b1b1ba] hover:text-white"}`}>Admins</button>
                </div>
            </div>

            <div className="glass overflow-hidden rounded-2xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#121216] text-[#b1b1ba] border-b border-[rgba(255,255,255,0.08)]">
                        <tr>
                            <th className="px-6 py-4 font-medium text-sm">Account</th>
                            <th className="px-6 py-4 font-medium text-sm">Role</th>
                            <th className="px-6 py-4 font-medium text-sm">Bookings Made</th>
                            <th className="px-6 py-4 font-medium text-sm">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="py-10 text-center text-gray-500">Loading user accounts...</td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-10 text-center text-gray-500">No {filter !== "all" ? filter.toLowerCase() : ""} users found in the system.</td>
                            </tr>
                        ) : (
                            filteredUsers.map((user: any) => (
                                <tr key={user.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
                                                <UserCircle size={20} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-white flex items-center gap-2">
                                                    {user.name || "Unnamed User"}
                                                    {user.emailVerified ? (
                                                        <span title="Email Verified"><Shield size={12} className="text-green-500" /></span>
                                                    ) : (
                                                        <span title="Pending Verification"><Mail size={12} className="text-yellow-500" /></span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${roleColors[user.role] || roleColors.CUSTOMER}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[#b1b1ba] font-medium">
                                        {user._count?.bookings || 0}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
                                        <Calendar size={12} />
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
