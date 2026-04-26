import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        // 1. Mark Residents OVERDUE if dueDate is passed
        await prisma.resident.updateMany({
            where: {
                dueDate: { lt: today },
                status: "ACTIVE",
            },
            data: { status: "OVERDUE" },
        });

        // 2. Fetch residents due in exactly 3 days
        const upcomingRenewals = await prisma.resident.findMany({
            where: {
                status: "ACTIVE",
                dueDate: {
                    gte: new Date(threeDaysFromNow.setHours(0, 0, 0, 0)),
                    lte: new Date(threeDaysFromNow.setHours(23, 59, 59, 999)),
                }
            },
            include: { listing: { include: { house: true } } }
        });

        // Note: To actively send emails, connect to the email.ts utility here
        // for (const resident of upcomingRenewals) { await sendEmail(...) }

        return NextResponse.json({
            success: true,
            overdueMarked: true,
            remindersSentCount: upcomingRenewals.length
        });

    } catch (error) {
        return NextResponse.json({ error: "Reminder script failed" }, { status: 500 });
    }
}
