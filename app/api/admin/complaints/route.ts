import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const complaints = await prisma.complaint.findMany({
            include: {
                user: { select: { name: true, email: true } },
                house: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(complaints);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, status } = body;

        const complaint = await prisma.complaint.update({
            where: { id },
            data: { status },
            include: { user: { select: { email: true } } }
        });

        // Send email notification to guest if status changed to RESOLVED
        if (status === "RESOLVED") {
            const emailTo = complaint.guestEmail || complaint.user?.email;
            if (emailTo) {
                const mailOptions = {
                    subject: "Your Ticket is Resolved — HOJ Hostel",
                    html: `
                        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e1e1e8;border-radius:16px;">
                            <h1 style="color:#22c55e;font-size:20px;margin-bottom:16px;">Issue Resolved ✅</h1>
                            <p style="font-size:16px;color:#333;">Hi ${complaint.guestName || "Resident"},</p>
                            <p style="font-size:16px;color:#333;line-height:1.6;">Good news! The maintenance/admin team at House of Jesse Hostel has fully resolved your reported issue: <strong>"${complaint.subject}"</strong>.</p>
                            <div style="background:#f9f9fb;padding:16px;border-radius:12px;margin:20px 0;">
                                <p style="margin:0;font-size:14px;color:#666;">We hope your stay is highly comfortable. Please reach out if you need anything else.</p>
                            </div>
                            <p style="color:#999;font-size:12px;text-align:center;margin-top:24px;">House of Jesse / HOJ Hostel</p>
                        </div>
                    `
                };
                await sendEmail({ to: emailTo, ...mailOptions, type: "complaint_resolved" });
            }
        }

        return NextResponse.json(complaint);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
