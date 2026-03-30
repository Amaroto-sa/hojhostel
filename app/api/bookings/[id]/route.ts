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
    const { status } = body;

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

    // Update booking status
    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
    });

    // Determine client email: residentEmail from booking form > user account email
    const clientEmail = booking.residentEmail || booking.user?.email || null;

    // If approved, create resident record and update occupancy
    if (status === "APPROVED") {
      const dueDate = calculateDueDate(
        new Date(booking.checkInDate),
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
          checkInDate: booking.checkInDate,
          duration: booking.duration,
          durationCount: booking.durationCount,
          dueDate,
          status: "ACTIVE",
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

      // Send welcome email with house rules to client
      if (clientEmail) {
        const houseRulesSetting = await prisma.setting.findUnique({
          where: { key: "house_rules" },
        });
        const welcomeData = welcomeEmail(booking.residentName, houseRulesSetting?.value || "");
        await sendEmail({ to: clientEmail, ...welcomeData, type: "welcome" });
      }

      // Notify admin via Telegram (optional)
      await sendTelegramNotification(
        `✅ <b>Booking Approved</b>\n<b>Resident:</b> ${booking.residentName}\n<b>Accommodation:</b> ${booking.listing.title}\n<b>Due Date:</b> ${dueDate.toDateString()}`
      );
    }

    // Send status update email to client
    if (clientEmail) {
      const statusEmailData = bookingStatusEmail(booking.residentName, status);
      await sendEmail({ to: clientEmail, ...statusEmailData, type: "booking_status" });
    }

    // Notify admin via Telegram for rejections too (optional)
    if (status === "REJECTED") {
      await sendTelegramNotification(
        `❌ <b>Booking Rejected</b>\n<b>Resident:</b> ${booking.residentName}\n<b>Accommodation:</b> ${booking.listing.title}`
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Booking Update] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
