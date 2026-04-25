import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized. Super Admin Only." }, { status: 403 });
        }

        // Fetch all core data
        const [
            houses,
            listings,
            users,
            customerProfiles,
            bookings,
            residents,
            renewals,
            receipts,
            complaints,
            testimonials,
            settings
        ] = await Promise.all([
            prisma.house.findMany(),
            prisma.listing.findMany(),
            prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, isSuspended: true, createdAt: true } }),
            prisma.customerProfile.findMany(),
            prisma.booking.findMany(),
            prisma.resident.findMany(),
            prisma.renewal.findMany(),
            prisma.receipt.findMany(),
            prisma.complaint.findMany(),
            prisma.testimonial.findMany(),
            prisma.setting.findMany(),
        ]);

        const backupData = {
            timestamp: new Date().toISOString(),
            version: "1.0",
            data: {
                houses,
                listings,
                users,
                customerProfiles,
                bookings,
                residents,
                renewals,
                receipts,
                complaints,
                testimonials,
                settings
            }
        };

        // Return as a downloadable JSON file
        return new NextResponse(JSON.stringify(backupData, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="hoj-backup-${new Date().toISOString().split('T')[0]}.json"`
            }
        });

    } catch (error) {
        console.error("[Backup Error]:", error);
        return NextResponse.json({ error: "Internal server error during backup generation" }, { status: 500 });
    }
}
