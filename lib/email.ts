// Email utility — real nodemailer implementation using SMTP env variables
// No SMTP secrets are hardcoded. Configure via Vercel environment variables.

import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  type?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, type = "general", replyTo }: EmailOptions) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.EMAIL_FROM || `HOJ Hostel <${user}>`;

  if (!host || !user || !pass) {
    console.warn("[Email] SMTP not configured. Skipping email send. Type:", type);
    return { success: false, error: "SMTP not configured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: Number(port) === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({ from, to, subject, html, replyTo });
    console.log(`[Email] Sent "${subject}" to ${to}`);
    return { success: true };
  } catch (error: any) {
    console.error("[Email] Failed to send:", error.message);
    return { success: false, error: error.message };
  }
}


// Pre-built email templates
export function bookingSubmisionEmail(customerName: string, listingTitle: string) {
  return {
    subject: "Booking Request Received - HOJ Hostel",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0c;color:#f5f5f7;border-radius:16px;border:1px solid rgba(255,122,26,0.1);">
        <h1 style="color:#ff7a1a;font-size:24px;margin-bottom:20px;">Booking Request Received</h1>
        <p style="font-size:16px;line-height:1.6;">Hi ${customerName},</p>
        <p style="font-size:16px;line-height:1.6;">Your booking request for <strong>${listingTitle}</strong> has been received by House of Jesse Hostel.</p>
        <div style="background:rgba(255,255,255,0.05);padding:20px;border-radius:12px;margin:24px 0;">
          <p style="margin:0;font-size:14px;color:#b1b1ba;">Next Steps:</p>
          <p style="margin:8px 0 0;font-size:15px;color:#ececf0;">Our team will review your request. You will receive an email once it is approved or if more information is needed.</p>
        </div>
        <p style="font-size:14px;color:#b1b1ba;">If you have any urgent questions, reach out via WhatsApp:</p>
        <div style="margin:16px 0;">
          <a href="https://wa.me/2348145416775" style="background:#ff7a1a;color:#111;font-weight:bold;padding:12px 24px;border-radius:30px;text-decoration:none;display:inline-block;font-size:14px;">Chat on WhatsApp</a>
        </div>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
        <p style="color:#666;font-size:12px;">House of Jesse / HOJ Hostel &nbsp;|&nbsp; Ajah, Lagos</p>
      </div>
    `,
  };
}

export function adminBookingNotificationEmail(details: any) {
  const { customerName, customerEmail, listingTitle, houseName, checkInDate, duration, durationCount, totalPrice, residentPhone, emergencyContact, emergencyRel, notes, isVerified } = details;

  return {
    subject: `[NEW BOOKING] ${customerName} - ${listingTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333;background:#f9f9fb;border:1px solid #e1e1e8;border-radius:16px;">
        <h1 style="color:#ff7a1a;font-size:20px;margin-bottom:16px;">New Booking Alert 📍</h1>
        
        <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin-bottom:20px;">
          <h2 style="font-size:16px;border-bottom:1px solid #f0f0f4;padding-bottom:10px;margin-bottom:16px;color:#111;">Resident Information</h2>
          <table style="width:100%;font-size:14px;line-height:2.0;">
            <tr><td style="color:#666;width:140px;">Name:</td><td><strong>${customerName}</strong></td></tr>
            <tr><td style="color:#666;">Email:</td><td>${customerEmail} ${isVerified ? '✅ (Verified)' : '❌ (Not Verified)'}</td></tr>
            <tr><td style="color:#666;">Phone:</td><td>${residentPhone}</td></tr>
            <tr><td style="color:#666;">Emergency:</td><td>${emergencyContact} (${emergencyRel})</td></tr>
          </table>
        </div>

        <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin-bottom:20px;">
          <h2 style="font-size:16px;border-bottom:1px solid #f0f0f4;padding-bottom:10px;margin-bottom:16px;color:#111;">Stay Details</h2>
          <table style="width:100%;font-size:14px;line-height:2.0;">
            <tr><td style="color:#666;width:140px;">Accommodation:</td><td><strong>${listingTitle}</strong></td></tr>
            <tr><td style="color:#666;">Hostel Location:</td><td>${houseName}</td></tr>
            <tr><td style="color:#666;">Check-in Date:</td><td>${new Date(checkInDate).toDateString()}</td></tr>
            <tr><td style="color:#666;">Duration:</td><td>${durationCount} ${duration.toLowerCase()}</td></tr>
            <tr><td style="color:#666;">Total Amount:</td><td><strong style="color:#ff7a1a;font-size:16px;">₦${totalPrice.toLocaleString()}</strong></td></tr>
          </table>
        </div>

        ${notes ? `
        <div style="background:#f0f0f4;padding:16px;border-radius:12px;margin-bottom:20px;">
          <p style="margin:0;font-size:13px;color:#666;">Special Notes:</p>
          <p style="margin:4px 0 0;font-size:14px;color:#333;">${notes}</p>
        </div>
        ` : ''}

        <div style="text-align:center;">
          <a href="${process.env.NEXTAUTH_URL || 'https://hojhostel.vercel.app'}/admin/bookings" style="background:#111;color:#fff;font-weight:bold;padding:14px 32px;border-radius:30px;text-decoration:none;display:inline-block;font-size:14px;">Review in Admin Panel</a>
        </div>
        
        <p style="color:#999;font-size:12px;text-align:center;margin-top:24px;">This is an automated operational alert for HOJ Hostel Admin.</p>
      </div>
    `,
  };
}

// Telegram Utility
export async function sendTelegramNotification(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[Telegram] Token or Chat ID not configured. Skipping...");
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Telegram] API error:", err);
    }
  } catch (error) {
    console.error("[Telegram] Request failed:", error);
  }
}

export function bookingStatusEmail(customerName: string, status: string) {
  return {
    subject: `Booking ${status} - HOJ Hostel`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0c;color:#f5f5f7;border-radius:16px;">
        <h1 style="color:#ff7a1a;">Booking Update</h1>
        <p>Hi ${customerName},</p>
        <p>Your booking has been <strong>${status.toLowerCase()}</strong>.</p>
        ${status === "APPROVED" ? "<p>You will receive a welcome email with house rules and check-in details shortly.</p>" : ""}
        <p>Contact us on WhatsApp: <a href='https://wa.me/2348145416775' style='color:#ff7a1a;'>+234 814 541 6775</a></p>
        <hr style="border-color:rgba(255,255,255,0.1);margin:20px 0;" />
        <p style="color:#b1b1ba;font-size:13px;">House of Jesse / HOJ Hostel</p>
      </div>
    `,
  };
}

export function welcomeEmail(customerName: string, houseRules: string) {
  return {
    subject: "Welcome to HOJ Hostel!",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0c;color:#f5f5f7;border-radius:16px;">
        <h1 style="color:#ff7a1a;">Welcome to House of Jesse!</h1>
        <p>Hi ${customerName},</p>
        <p>We are excited to have you at HOJ Hostel. Below are the house rules for your stay:</p>
        <div style="background:rgba(255,255,255,0.06);padding:16px;border-radius:12px;margin:16px 0;">
          ${houseRules || "<p>House rules will be provided by the management team.</p>"}
        </div>
        <p>For any questions or concerns, contact us via WhatsApp: <a href='https://wa.me/2348145416775' style='color:#ff7a1a;'>+234 814 541 6775</a></p>
        <hr style="border-color:rgba(255,255,255,0.1);margin:20px 0;" />
        <p style="color:#b1b1ba;font-size:13px;">House of Jesse / HOJ Hostel</p>
      </div>
    `,
  };
}

export function verificationEmail(customerName: string, verifyUrl: string) {
  return {
    subject: "Verify your email — HOJ Hostel",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0c;color:#f5f5f7;border-radius:16px;">
        <h1 style="color:#ff7a1a;">Verify Your Email</h1>
        <p>Hi ${customerName},</p>
        <p>Thanks for registering with HOJ Hostel. Please verify your email address by clicking the button below to activate your account.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${verifyUrl}" style="background:#ff7a1a;color:#111;font-weight:bold;padding:14px 32px;border-radius:12px;text-decoration:none;display:inline-block;font-size:15px;">Verify Email Address</a>
        </div>
        <p style="color:#b1b1ba;font-size:13px;">This link expires in <strong style="color:#f5f5f7;">24 hours</strong>. If you did not register, you can safely ignore this email.</p>
        <hr style="border-color:rgba(255,255,255,0.1);margin:20px 0;" />
        <p style="color:#b1b1ba;font-size:13px;">House of Jesse / HOJ Hostel &nbsp;|&nbsp; <a href="https://wa.me/2348145416775" style="color:#ff7a1a;">+234 814 541 6775</a></p>
      </div>
    `,
  };
}

