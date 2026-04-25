import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResidentDetailPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    const resident = await prisma.resident.findUnique({
        where: { id: params.id },
        include: {
            listing: { include: { house: true } },
            renewals: { orderBy: { createdAt: "desc" } },
            receipts: { orderBy: { createdAt: "desc" } },
            customerProfile: { include: { user: true } },
            booking: true,
        },
    });

    if (!resident) {
        return (
            <div className="text-center p-10 text-white">
                <h1 className="text-2xl font-bold mb-4">Resident Not Found</h1>
                <Link href="/admin/residents" className="text-[#ff7a1a] hover:underline">Return to Residents</Link>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        ACTIVE: "text-green-400 bg-green-500/10",
        INACTIVE: "text-gray-400 bg-gray-500/10",
        OVERDUE: "text-red-400 bg-red-500/10",
        MOVED_OUT: "text-orange-400 bg-orange-500/10",
    };

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/residents" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="font-display text-3xl text-white">Resident Details</h1>
                    <p className="text-[#b1b1ba] text-sm mt-1">History, renewals, and receipts for {resident.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass p-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1c1c22] to-[#0e0e12] border border-white/10 flex items-center justify-center text-2xl font-bold text-[#ff7a1a] mb-4">
                            {resident.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{resident.name}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block mb-4 ${statusColors[resident.status]}`}>
                            {resident.status.replace("_", " ")}
                        </span>

                        <div className="space-y-3 text-sm border-t border-white/10 pt-4 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[#b1b1ba]">Phone</span>
                                <span className="text-white font-medium">{resident.phone}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#b1b1ba]">Email</span>
                                <span className="text-white font-medium">{resident.email || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#b1b1ba]">Accommodation</span>
                                <span className="text-white font-medium text-right max-w-[150px] truncate" title={resident.listing?.title}>
                                    {resident.listing?.title || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[#b1b1ba]">Check-in Date</span>
                                <span className="text-white font-medium">{new Date(resident.checkInDate).toDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#b1b1ba]">Current Due Date</span>
                                <span className="text-[#ff7a1a] font-bold">{new Date(resident.dueDate).toDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Timeline & Receipts */}
                <div className="lg:col-span-2 space-y-8">

                    <div className="glass p-6">
                        <h3 className="flex items-center gap-2 font-display text-xl text-white mb-6">
                            <Calendar size={20} className="text-[#ff7a1a]" />
                            Renewal History
                        </h3>

                        {resident.renewals.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No renewal history recorded.</p>
                        ) : (
                            <div className="relative border-l border-white/10 ml-3 pl-6 space-y-6">
                                {resident.renewals.map((renewal) => (
                                    <div key={renewal.id} className="relative">
                                        <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#121216] border-2 border-[#ff7a1a]"></span>
                                        <p className="text-sm text-white font-medium mb-1">
                                            Extended by {renewal.durationCount} {renewal.duration.toLowerCase()}{renewal.durationCount > 1 ? 's' : ''}
                                        </p>
                                        <p className="text-xs text-gray-400 mb-2">
                                            {new Date(renewal.createdAt).toLocaleString()}
                                        </p>
                                        <div className="bg-white/5 rounded-lg p-3 text-xs text-gray-300">
                                            <p>Previous Due: {new Date(renewal.previousDueDate).toDateString()}</p>
                                            <p className="text-[#ff7a1a] mt-1 font-semibold">New Due: {new Date(renewal.newDueDate).toDateString()}</p>
                                            {renewal.notes && <p className="mt-2 pt-2 border-t border-white/5 text-gray-400">Note: {renewal.notes}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="glass p-6">
                        <h3 className="flex items-center gap-2 font-display text-xl text-white mb-6">
                            <FileText size={20} className="text-[#ff7a1a]" />
                            Receipts
                        </h3>

                        {resident.receipts.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No receipts generated yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-[#121216] text-[#b1b1ba] border-b border-[rgba(255,255,255,0.08)]">
                                        <tr>
                                            <th className="py-3 px-4 font-medium">Receipt No.</th>
                                            <th className="py-3 px-4 font-medium">Date</th>
                                            <th className="py-3 px-4 font-medium">Description</th>
                                            <th className="py-3 px-4 font-medium">Amount</th>
                                            <th className="py-3 px-4 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resident.receipts.map((receipt) => (
                                            <tr key={receipt.id} className="border-b border-[rgba(255,255,255,0.05)]">
                                                <td className="py-3 px-4 font-mono text-xs text-white">{receipt.receiptNumber}</td>
                                                <td className="py-3 px-4 text-gray-400">{new Date(receipt.createdAt).toLocaleDateString()}</td>
                                                <td className="py-3 px-4 text-gray-300">
                                                    <span className="block">{receipt.description}</span>
                                                    <span className="text-[10px] uppercase font-bold text-gray-500">{receipt.type}</span>
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-green-400">₦{receipt.amount.toLocaleString()}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <Link href={`/admin/receipts/${receipt.id}`} target="_blank" className="text-xs px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[#ff7a1a] hover:text-[#111] transition-colors inline-block font-medium">
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
