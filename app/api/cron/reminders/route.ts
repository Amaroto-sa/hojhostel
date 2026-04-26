import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function GET(request: Request) {
    try {
        // Authenticate CRON request from Vercel
        const authHeader = request.headers.get("Authorization");
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
        }

        // 1. Fetch OVERDUE residents automatically
        const overdueResidents = await prisma.resident.findMany({
            where: {
                status: "ACTIVE",
                dueDate: { lt: new Date() }
            },
            include: { listing: { include: { house: true } } }
        });

        // 2. Fetch residents whose rent is DUE IN 3 DAYS
        const strictlyThreeDaysFromNow = new Date();
        strictlyThreeDaysFromNow.setDate(strictlyThreeDaysFromNow.getDate() + 3);

        const upcomingResidents = await prisma.resident.findMany({
            where: {
                status: "ACTIVE",
                dueDate: {
                    gte: new Date(),
                    lt: strictlyThreeDaysFromNow
                }
            },
            include: { listing: { include: { house: true } } }
        });

        // Fire automated emails
        const emailPromises = [];

        for (const resident of overdueResidents) {
            // Automatically flip them to OVERDUE in DB
            await prisma.resident.update({
                where: { id: resident.id },
                data: { status: "OVERDUE" }
            });

            if (resident.email) {
                emailPromises.push(
                    sendEmail({
                        to: resident.email,
                        subject: `🚨 OVERDUE NOTICE: Hostel Rent Expired`,
                        html: `<div style="font-family:sans-serif;color:#111;">
                                <h2 style="color:#ff0000;">Rent Overdue!</h2>
                                <p>Dear <b>${resident.name}</b>,</p>
                                <p>Your rent for <b>${resident.listing?.title}</b> expired on <b>${new Date(resident.dueDate).toDateString()}</b>.</p>
                                <p>Please renew your stay immediately at the Admin office to avoid penalties.</p>
                               </div>`,
                        type: "cron_overdue"
                    })
                );
            }
        }

        for (const resident of upcomingResidents) {
            if (resident.email) {
                emailPromises.push(
                    sendEmail({
                        to: resident.email,
                        subject: `⏰ Reminder: Hostel Rent Due Soon`,
                        html: `<div style="font-family:sans-serif;color:#111;">
                                <h2>Upcoming Rent Renewal</h2>
                                <p>Dear <b>${resident.name}</b>,</p>
                                <p>This is a friendly automated reminder that your stay at <b>${resident.listing?.title}</b> is expiring in a few days on <b>${new Date(resident.dueDate).toDateString()}</b>.</p>
                                <p>Kindly prepare for renewal.</p>
                               </div>`,
                        type: "cron_reminder"
                    })
                );
            }
        }

        await Promise.allSettled(emailPromises);

        return NextResponse.json({
            success: true,
            overdueFlipped: overdueResidents.length,
            remindersSent: upcomingResidents.length
        });

    } catch (error: any) {
        console.error("[CRON Engine] Error:", error.message);
        return NextResponse.json({ error: "CRON Engine failed" }, { status: 500 });
    }
}
