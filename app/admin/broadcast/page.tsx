import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BroadcastClient from "./BroadcastClient";

export default async function BroadcastPage() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    // Fetch broadcast history
    const broadcasts = await prisma.broadcast.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { recipients: true }
            },
            recipients: {
                select: {
                    status: true
                }
            }
        },
        take: 20 // Get last 20 broadcasts
    });

    // Format the data for the client
    const formattedHistory = broadcasts.map(b => {
        let sent = 0;
        let delivered = 0;
        let read = 0;
        let failed = 0;

        b.recipients.forEach(r => {
            if (r.status === "SENT") sent++;
            if (r.status === "DELIVERED") delivered++;
            if (r.status === "READ") read++;
            if (r.status === "FAILED") failed++;
        });

        // Delivered and Read imply it was Sent
        sent = sent + delivered + read;

        return {
            id: b.id,
            message: b.message,
            templateName: b.templateName,
            type: b.type,
            status: b.status,
            createdAt: b.createdAt.toISOString(),
            totalRecipients: b._count.recipients,
            stats: { sent, delivered, read, failed }
        };
    });

    return (
        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-white mb-2">WhatsApp Broadcasts</h1>
                <p className="text-[#b1b1ba]">Send announcements and track delivery to your residents.</p>
            </div>

            <BroadcastClient initialHistory={formattedHistory} />
        </div>
    );
}
