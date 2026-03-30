import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { message } = await request.json();

        if (!message || message.trim() === "") {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const inquiry = await prisma.inquiry.findUnique({
            where: { id: params.id },
        });

        if (!inquiry) {
            return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
        }

        // Replace line breaks with HTML breaks for email body
        const emailHtmlBody = message.replace(/\n/g, "<br />");

        // Send reply email to the person who inquired
        const emailResult = await sendEmail({
            to: inquiry.email,
            subject: `Re: ${inquiry.subject}`,
            html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border-radius:16px;background:#0a0a0c;color:#ececf0;border:1px solid rgba(255,122,26,0.1);">
          <h2 style="color:#ff7a1a;margin-top:0;">House of Jesse Hostel</h2>
          <p style="font-size:16px;line-height:1.6;">Hi ${inquiry.name},</p>
          <div style="background:rgba(255,255,255,0.05);padding:20px;border-radius:12px;margin:24px 0;">
            <p style="margin:0;font-size:15px;line-height:1.6;">${emailHtmlBody}</p>
          </div>
          <div style="font-size:13px;color:#8a8a93;margin-top:30px;border-left:2px solid rgba(255,255,255,0.1);padding-left:12px;">
            <p style="margin:0 0 5px;"><strong>On ${new Date(inquiry.createdAt).toLocaleDateString()} you wrote:</strong></p>
            <p style="margin:0;font-style:italic;">"${inquiry.message}"</p>
          </div>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
          <p style="font-size:13px;color:#b1b1ba;margin:0;">HOJ Hostel Management</p>
        </div>
      `,
            type: "inquiry_reply"
        });

        if (!emailResult.success) {
            return NextResponse.json({ error: "Failed to send email reply" }, { status: 500 });
        }

        // Update status to REPLIED
        const updated = await prisma.inquiry.update({
            where: { id: params.id },
            data: { status: "REPLIED" },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[Inquiry Reply Error]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
