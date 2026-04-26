import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
        }

        // Fetch core reporting data
        const residents = await prisma.resident.findMany({
            include: { listing: { include: { house: true } } }
        });

        const bookings = await prisma.booking.findMany({
            include: { listing: { include: { house: true } } }
        });

        const escape = (val: any) => {
            if (val === null || val === undefined) return '"N/A"';
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
        };

        // Standardized Excel CSV Header
        let csv = "Record Type,Full Name,Email,Phone,Payment Ref,Hostel Location,Room Booked,Status,Check-in Date,Duration,Due Date,Total Price\n";

        // Append Residents
        for (const r of residents) {
            csv += `${escape("Resident")},${escape(r.name)},${escape(r.email)},${escape(r.phone)},${escape("Verified")},${escape(r.listing?.house?.name)},${escape(r.listing?.title)},${escape(r.status)},${escape(new Date(r.checkInDate).toLocaleDateString())},${escape(r.durationCount + " " + r.duration)},${escape(r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "")},${escape("Paid")}\n`;
        }

        // Append Bookings
        for (const b of bookings) {
            csv += `${escape("Booking Request")},${escape(b.residentName)},${escape(b.residentEmail)},${escape(b.residentPhone)},${escape(b.reference)},${escape(b.listing?.house?.name)},${escape(b.listing?.title)},${escape(b.status)},${escape(new Date(b.checkInDate).toLocaleDateString())},${escape(b.durationCount + " " + b.duration)},${escape("Pending")},${escape(b.totalPrice ? "₦" + b.totalPrice.toLocaleString() : "")}\n`;
        }

        // Force BOM so Excel automatically recognizes UTF-8 (important for the ₦ Naira sign)
        const BOM = "\uFEFF";

        return new NextResponse(BOM + csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="HOJ_Excel_Backup_${new Date().toISOString().split('T')[0]}.csv"`
            }
        });

    } catch (error) {
        console.error("[Excel Backup Error]:", error);
        return NextResponse.json({ error: "Internal server error generating Excel backup" }, { status: 500 });
    }
}
