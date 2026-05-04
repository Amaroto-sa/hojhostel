import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, bookingStatusEmail, welcomeEmail, sendTelegramNotification } from "@/lib/email";
import { calculateDueDate } from "@/lib/due-date";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { status, checkInOverride, priceOverride, adminNotes } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { email: true, name: true }, },
        listing: { include: { house: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Build update payload with any admin overrides
    const updateData: Record<string, any> = { status };
    if (status === "APPROVED" && checkInOverride) {
      updateData.checkInDate = new Date(checkInOverride);
    }
    if (status === "APPROVED" && priceOverride !== undefined && priceOverride !== null) {
      updateData.totalPrice = Number(priceOverride);
    }
    if (adminNotes) {
      updateData.notes = booking.notes
        ? `${booking.notes}\n[Admin] ${adminNotes}`
        : `[Admin] ${adminNotes}`;
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
    });

    // Use overridden values or fall back to originals
    const effectiveCheckIn = checkInOverride ? new Date(checkInOverride) : new Date(booking.checkInDate);
    const effectivePrice = (priceOverride !== undefined && priceOverride !== null) ? Number(priceOverride) : booking.totalPrice;

    // Determine client email: residentEmail from booking form > user account email
    const clientEmail = booking.residentEmail || booking.user?.email || null;

    // If approved, create resident record and update occupancy
    if (status === "APPROVED") {
      const dueDate = calculateDueDate(
        effectiveCheckIn,
        booking.duration,
        booking.durationCount
      );

      // Get or create customer profile if user exists
      let profile = null;
      if (booking.userId) {
        profile = await prisma.customerProfile.findUnique({
          where: { userId: booking.userId },
        });

        if (!profile) {
          profile = await prisma.customerProfile.create({
            data: { userId: booking.userId },
          });
        }
      }

      const receiptNumber = "REC-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

      // Create resident record with email
      await prisma.resident.create({
        data: {
          customerProfileId: profile?.id,
          bookingId: booking.id,
          listingId: booking.listingId,
          name: booking.residentName,
          phone: booking.residentPhone,
          email: booking.residentEmail || booking.user?.email || null,
          address: booking.residentAddress,
          emergencyContact: booking.emergencyContact,
          emergencyRel: booking.emergencyRel,
          checkInDate: effectiveCheckIn,
          duration: booking.duration,
          durationCount: booking.durationCount,
          dueDate,
          status: "ACTIVE",
          receipts: {
            create: {
              receiptNumber,
              amount: effectivePrice || 0,
              description: `Booking payment for ${booking.durationCount} ${booking.duration.toLowerCase()}`,
              type: "BOOKING",
              userId: booking.userId || null,
              bookingId: booking.id,
            }
          }
        },
      });

      // Update listing occupancy
      await prisma.listing.update({
        where: { id: booking.listingId },
        data: {
          occupied: { increment: 1 },
          status: booking.listing.occupied + 1 >= booking.listing.capacity ? "OCCUPIED" :
            booking.listing.occupied + 1 > 0 ? "LIMITED" : "AVAILABLE",
        },
      });

      // Fetch settings directly
      let houseRulesText = "";
      let customApprovalText = "";

      const [rulesSetting, approvalSetting] = await Promise.all([
        prisma.setting.findUnique({ where: { key: "house_rules" } }),
        prisma.setting.findUnique({ where: { key: "email_booking_approved" } })
      ]);

      houseRulesText = rulesSetting?.value || "";
      customApprovalText = approvalSetting?.value || "";

      // Send ONE comprehensive email instead of 2 to avoid SMTP throttling
      if (clientEmail) {
        // Send a massive combined email containing BOTH banking details and house rules!
        const htmlContent = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0c;color:#f5f5f7;border-radius:16px;">
            <h1 style="color:#4ade80;">1 Bed Space Booking Confirmation ✅</h1>
            <p style="font-size:16px;">Hi ${booking.residentName},</p>
            <p style="font-size:16px;">Congratulations! Your single bed space reservation at <strong style="color:#ff7a1a;">${booking.listing.house?.name || "HOJ Hostel"}</strong> has been officially approved.</p>
            
            <div style="background:rgba(255,255,255,0.05);padding:20px;border-radius:12px;margin:24px 0;border-left:4px solid #ff7a1a;">
              <h2 style="font-size:16px;margin-top:0;color:#ff7a1a;">Banking & Payment Instructions</h2>
              <p style="margin:8px 0 0;font-size:15px;line-height:1.6;">${customApprovalText ? customApprovalText.replace(/\n/g, '<br />') : 'Make your payment directly to the hostel management.'}</p>
            </div>

            <div style="background:rgba(255,255,255,0.05);padding:20px;border-radius:12px;margin:24px 0;">
              <h2 style="font-size:16px;margin-top:0;color:#fff;">Hostel House Rules</h2>
              <div style="font-size:14px;line-height:1.6;color:#ccc;">
                 ${houseRulesText ? houseRulesText.replace(/\n/g, '<br />') : 'You will receive house rules upon arrival.'}
              </div>
            </div>

            <p>For any questions or to submit payment proof, please message us on WhatsApp:</p>
            <div style="margin:16px 0;">
              <a href="{{WHATSAPP_LINK}}" style="background:#ff7a1a;color:#111;font-weight:bold;padding:12px 24px;border-radius:30px;text-decoration:none;display:inline-block;font-size:14px;">Contact HOJ Hostel</a>
            </div>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
            <p style="color:#666;font-size:12px;">House of Jesse (HOJ Hostel) Administration</p>
          </div>
        `;

        await sendEmail({
          to: clientEmail,
          subject: "1 Bed Space Booking Confirmation - Payment Instructions Inside ✅",
          html: htmlContent,
          type: "booking_approved_combined"
        });
      }

      // Notify admin via Telegram (optional)
      await sendTelegramNotification(
        `✅ <b>Booking Approved</b>\n<b>Resident:</b> ${booking.residentName}\n<b>Accommodation:</b> ${booking.listing.title}\n<b>Due Date:</b> ${dueDate.toDateString()}`
      );
    } else if (status === "REJECTED" || status === "CANCELLED") {
      // Reversal logic for APPROVED -> CANCELLED
      if (booking.status === "APPROVED" && status === "CANCELLED") {
        await prisma.listing.update({
          where: { id: booking.listingId },
          data: {
            occupied: { decrement: 1 }
          }
        });
        await prisma.resident.updateMany({
          where: { bookingId: booking.id },
          data: { status: "INACTIVE" }
        });
      }

      // Send Rejection Email
      if (clientEmail) {
        const s = await prisma.setting.findUnique({ where: { key: "email_booking_rejected" } });
        const customText = s?.value || "";

        const statusEmailData = bookingStatusEmail(booking.residentName, status, customText);
        await sendEmail({ to: clientEmail, ...statusEmailData, type: "booking_status" });
      }
      if (status === "REJECTED") {
        await sendTelegramNotification(
          `❌ <b>Booking Rejected</b>\n<b>Resident:</b> ${booking.residentName}\n<b>Accommodation:</b> ${booking.listing.title}`
        );
      }
    } else {
      // Other status updates (like PENDING again, etc)
      if (clientEmail) {
        const statusEmailData = bookingStatusEmail(booking.residentName, status);
        await sendEmail({ to: clientEmail, ...statusEmailData, type: "booking_status" });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Booking Update] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
