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

        // Fetch Admin notification email Setting
        const adminEmailSetting = await prisma.setting.findUnique({ where: { key: "notification_email" } });
        const adminEmail = adminEmailSetting?.value || process.env.ADMIN_EMAIL || "houseofjessehostel@gmail.com";
        const publicContactSetting = await prisma.setting.findUnique({ where: { key: "contact_email" } });
        const publicContactEmail = publicContactSetting?.value || "houseofjessehostel@gmail.com";

        // Notify via Email (to admin)
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
                type: "inquiry_alert",
                replyTo: sanitizedData.email,
            });
        } catch (e) {
            console.error("Email notification failed:", e);
        }

        // Send automated confirmation receipt email to the user
        try {
            await sendEmail({
                to: sanitizedData.email,
                subject: "We have received your inquiry - HOJ Hostel",
                html: `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0c;color:#f5f5f7;border-radius:16px;border:1px solid rgba(255,122,26,0.1);">
                        <h1 style="color:#ff7a1a;font-size:24px;margin-bottom:20px;">Inquiry Received</h1>
                        <p style="font-size:16px;line-height:1.6;">Hi ${sanitizedData.name},</p>
                        <p style="font-size:16px;line-height:1.6;">Thank you for contacting House of Jesse Hostel. We have successfully received your inquiry regarding <strong>"${sanitizedData.subject}"</strong>.</p>
                        <div style="background:rgba(255,255,255,0.05);padding:20px;border-radius:12px;margin:24px 0;border-left:4px solid #ff7a1a;">
                            <p style="margin:0;font-size:14px;color:#ececf0;line-height:1.6;">Our support team will review your message and get back to you shortly.</p>
                        </div>
                        <p style="font-size:14px;color:#b1b1ba;">If your matter is extremely urgent, please contact us directly on WhatsApp:</p>
                        <div style="margin:16px 0;">
                            <a href="https://wa.me/2348145416775" style="background:#ff7a1a;color:#111;font-weight:bold;padding:12px 24px;border-radius:30px;text-decoration:none;display:inline-block;font-size:14px;">Chat on WhatsApp</a>
                        </div>
                        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
                        <p style="color:#666;font-size:12px;">House of Jesse / HOJ Hostel &nbsp;|&nbsp; Ajah, Lagos</p>
                    </div>
                `,
                type: "inquiry_confirmation",
                replyTo: publicContactEmail,
            });
        } catch (e) {
            console.error("Customer confirmation email failed:", e);
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
