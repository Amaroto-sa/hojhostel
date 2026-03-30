import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, bookingStatusEmail, welcomeEmail } from "@/lib/email";
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

      // Create resident
      await prisma.resident.create({
        data: {
          customerProfileId: profile?.id,
          bookingId: booking.id,
          listingId: booking.listingId,
          name: booking.residentName,
          phone: booking.residentPhone,
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

      // Send welcome email if user exists
      if (booking.user?.email) {
        // Get house rules from settings
        const houseRulesSetting = await prisma.setting.findUnique({
          where: { key: "house_rules" },
        });
        const welcomeData = welcomeEmail(booking.residentName, houseRulesSetting?.value || "");
        await sendEmail({ to: booking.user.email, ...welcomeData, type: "welcome" });
      }
    }

    // Send status update email if user exists
    if (booking.user?.email) {
      const statusEmailData = bookingStatusEmail(booking.residentName, status);
      await sendEmail({ to: booking.user.email, ...statusEmailData, type: "booking_status" });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Booking Update] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
