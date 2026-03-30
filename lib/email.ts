// Email utility — real nodemailer implementation using SMTP env variables
// No SMTP secrets are hardcoded. Configure via Vercel environment variables.

import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  type?: string;
}

export async function sendEmail({ to, subject, html, type = "general" }: EmailOptions) {
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

    await transporter.sendMail({ from, to, subject, html });
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
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0c;color:#f5f5f7;border-radius:16px;">
        <h1 style="color:#ff7a1a;font-size:24px;">Booking Request Received</h1>
        <p>Hi ${customerName},</p>
        <p>Your booking request for <strong>${listingTitle}</strong> has been received. Our team will review your request and get back to you shortly.</p>
        <p>If you have any questions, feel free to reach out via WhatsApp: <a href="https://wa.me/2348145416775" style="color:#ff7a1a;">+234 814 541 6775</a></p>
        <hr style="border-color:rgba(255,255,255,0.1);margin:20px 0;" />
        <p style="color:#b1b1ba;font-size:13px;">House of Jesse / HOJ Hostel</p>
      </div>
    `,
  };
}

export function adminBookingNotificationEmail(customerName: string, listingTitle: string) {
  return {
    subject: `New Booking Request from ${customerName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h1 style="color:#ff7a1a;">New Booking Request</h1>
        <p><strong>${customerName}</strong> has submitted a booking request for <strong>${listingTitle}</strong>.</p>
        <p>Please log in to the admin dashboard to review and approve/reject this request.</p>
      </div>
    `,
  };
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

