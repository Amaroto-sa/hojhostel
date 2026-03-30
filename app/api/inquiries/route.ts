import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendEmail, sendTelegramNotification } from "@/lib/email";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, subject, message, captchaAnswer, captchaInput } = body;

        // Simple Math Captcha Verification
        if (parseInt(captchaInput) !== parseInt(captchaAnswer)) {
            return NextResponse.json({ error: "Invalid captcha answer. Please try again." }, { status: 400 });
        }

        // Basic Sanitization & Validation
        const sanitize = (str: string) => {
            if (!str) return "";
            // Remove HTML tags and potentially malicious characters
            return str.replace(/<[^>]*>?/gm, '').replace(/[<>]/g, '').trim();
        };
        
        const sanitizedData = {
            name: sanitize(name),
            email: sanitize(email),
            phone: phone ? sanitize(phone) : null,
            subject: sanitize(subject),
            message: sanitize(message),
        };

        if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.subject || !sanitizedData.message) {
            return NextResponse.json({ error: "Missing required fields or invalid input" }, { status: 400 });
        }

        const inquiry = await prisma.inquiry.create({
            data: sanitizedData,
        });

        // Notifications
        const notificationMsg = `📩 <b>New Website Inquiry</b>\n\n<b>From:</b> ${sanitizedData.name}\n<b>Email:</b> ${sanitizedData.email}\n<b>Phone:</b> ${sanitizedData.phone || 'N/A'}\n<b>Subject:</b> ${sanitizedData.subject}\n\n<b>Message:</b>\n${sanitizedData.message}`;
        
        // Notify via Telegram
        try {
            await sendTelegramNotification(notificationMsg);
        } catch (e) {
            console.error("Telegram notification failed:", e);
        }

        // Notify via Email (to admin)
        const adminEmail = process.env.ADMIN_EMAIL || "houseofjessehostel@gmail.com";
        try {
            await sendEmail({
                to: adminEmail,
                subject: `[INQUIRY] ${sanitizedData.subject} - ${sanitizedData.name}`,
                html: `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9fb;border-radius:16px;border:1px solid #e1e1e8;">
                        <h1 style="color:#ff7a1a;font-size:22px;">New Website Inquiry 📩</h1>
                        <div style="background:#fff;padding:20px;border-radius:12px;margin:20px 0;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                            <p><strong>Name:</strong> ${sanitizedData.name}</p>
                            <p><strong>Email:</strong> ${sanitizedData.email}</p>
                            <p><strong>Phone:</strong> ${sanitizedData.phone || 'N/A'}</p>
                            <p><strong>Subject:</strong> ${sanitizedData.subject}</p>
                        </div>
                        <div style="background:#fff;padding:20px;border-radius:12px;margin:20px 0;border-left:4px solid #ff7a1a;">
                            <p style="margin:0;font-size:13px;color:#666;">Message:</p>
                            <p style="margin:8px 0 0;line-height:1.6;">${sanitizedData.message}</p>
                        </div>
                        <div style="text-align:center;margin-top:30px;">
                            <a href="${process.env.NEXTAUTH_URL || 'https://hojhostel.vercel.app'}/admin/inquiries" style="background:#111;color:#fff;padding:12px 24px;border-radius:30px;text-decoration:none;font-weight:bold;">View in Admin Panel</a>
                        </div>
                    </div>
                `,
                type: "inquiry_alert"
            });
        } catch (e) {
            console.error("Email notification failed:", e);
        }

        return NextResponse.json({ success: true, id: inquiry.id });
    } catch (error) {
        console.error("Inquiry route error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const inquiries = await prisma.inquiry.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(inquiries);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
 Linda
