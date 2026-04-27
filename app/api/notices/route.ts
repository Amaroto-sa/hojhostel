import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();

        const notice = await prisma.notice.create({
            data: {
                title: body.title,
                content: body.content,
                type: body.type,
                authorId: session.user.id
            },
            include: { author: { select: { name: true } } }
        });

        // 🚨 CRITICAL FIX: The CEO expected broadcasts to actually send emails!
        // Fetch all active residents and email them the custom broadcast.
        const activeUsers = await prisma.user.findMany({
            where: {
                residents: { some: { status: "ACTIVE" } }
            },
            select: { email: true, name: true }
        });

        const sendPromises = activeUsers.map(u => {
            if (!u.email) return Promise.resolve();
            return sendEmail({
                to: u.email,
                subject: `📢 HOJ Broadcast: ${body.title}`,
                html: `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0c;color:#f5f5f7;border-radius:16px;border-top:4px solid ${body.type === 'URGENT' ? '#ef4444' : '#3b82f6'};">
                        <h2 style="color:${body.type === 'URGENT' ? '#ef4444' : '#3b82f6'};margin-top:0;">HOJ Hostel Announcement</h2>
                        <p style="font-size:16px;">Hi ${u.name},</p>
                        <div style="background:rgba(255,255,255,0.05);padding:20px;border-radius:12px;margin:24px 0;">
                            <h3 style="margin-top:0;color:#fff;font-size:18px;">${body.title}</h3>
                            <p style="font-size:15px;line-height:1.6;color:#ccc;">${body.content.replace(/\n/g, '<br/>')}</p>
                        </div>
                        <p style="color:#666;font-size:12px;">This is an automated broadcast to all active residents.</p>
                    </div>
                `,
                type: "system_broadcast"
            }).catch(e => console.error("Broadcast Email Error:", e));
        });

        await Promise.allSettled(sendPromises);

        return NextResponse.json(notice);
    } catch (error) {
        return NextResponse.json({ error: "Failed to post notice" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID missing" }, { status: 400 });

        await prisma.notice.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete notice" }, { status: 500 });
    }
}
