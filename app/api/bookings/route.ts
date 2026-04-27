import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations";
import { sendEmail, bookingSubmisionEmail, adminBookingNotificationEmail, sendTelegramNotification } from "@/lib/email";
import { isIpRateLimited } from "@/lib/rate-limit";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Admin: get all bookings
    if (session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") {
      const bookings = await prisma.booking.findMany({
        where: status ? { status: status as any } : undefined,
        include: {
          user: { select: { name: true, email: true } },
          listing: { include: { house: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(bookings);
    }

    // Customer: get own bookings
    if (session?.user) {
      const bookings = await prisma.booking.findMany({
        where: { userId: session.user.id },
        include: {
          listing: { include: { house: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(bookings);
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (isIpRateLimited(ip)) {
      return NextResponse.json({ error: "Requests severely rate-limited. Please wait a minute before requesting another booking." }, { status: 429 });
    }

    const session = await getServerSession(authOptions);

    // Check if guest booking is enabled
    const authSetting = await prisma.setting.findUnique({ where: { key: "enable_guest_booking" } });
    const isGuestAllowed = authSetting?.value === "true";

    if (!session?.user && !isGuestAllowed) {
      return NextResponse.json({ error: "Please sign in to submit a booking" }, { status: 401 });
    }

    const body = await request.json();
    const validated = bookingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Check listing exists and has capacity
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
      include: { house: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Advanced Capacity Check for Future Dates
    const requestedCheckIn = new Date(data.checkInDate);
    const requestedCheckOut = new Date(requestedCheckIn);
    if (data.duration === "DAILY") requestedCheckOut.setDate(requestedCheckOut.getDate() + data.durationCount);
    else if (data.duration === "WEEKLY") requestedCheckOut.setDate(requestedCheckOut.getDate() + data.durationCount * 7);
    else if (data.duration === "MONTHLY") requestedCheckOut.setMonth(requestedCheckOut.getMonth() + data.durationCount);

    const activeResidents = await prisma.resident.findMany({
      where: {
        listingId: data.listingId,
        status: "ACTIVE",
        checkInDate: { lt: requestedCheckOut },
        dueDate: { gt: requestedCheckIn }
      }
    });

    const pendingBookings = await prisma.booking.findMany({
      where: {
        listingId: data.listingId,
        status: { in: ["PENDING", "APPROVED"] },
        checkInDate: { lt: requestedCheckOut }
      }
    });
    
    let overlappingPending = 0;
    for (const b of pendingBookings) {
      const bOut = new Date(b.checkInDate);
      if (b.duration === "DAILY") bOut.setDate(bOut.getDate() + b.durationCount);
      else if (b.duration === "WEEKLY") bOut.setDate(bOut.getDate() + b.durationCount * 7);
      else if (b.duration === "MONTHLY") bOut.setMonth(bOut.getMonth() + b.durationCount);
      
      if (bOut > requestedCheckIn) {
        overlappingPending++;
      }
    }

    const totalOverlapping = activeResidents.length + overlappingPending;

    if (totalOverlapping + data.quantity > listing.capacity) {
      return NextResponse.json({ error: `Not enough availability. Only ${Math.max(0, listing.capacity - totalOverlapping)} space(s) available for these dates.` }, { status: 400 });
    }

    let totalPrice = listing.price * data.durationCount;
    if (data.duration === "MONTHLY") {
      totalPrice = listing.price * 4 * data.durationCount; // Approx 4 weeks per month
    } else if (data.duration === "DAILY") {
      totalPrice = (listing.price / 7) * data.durationCount;
    }

    // Antispam duplicate check removed to allow users to book multiple spaces seamlessly if desired.

    const bookings = [];
    for (let i = 0; i < data.quantity; i++) {
      const booking = await prisma.booking.create({
        data: {
          userId: session?.user?.id || null,
          listingId: data.listingId,
          checkInDate: requestedCheckIn,
          duration: data.duration,
          durationCount: data.durationCount,
          residentName: data.quantity > 1 ? `${data.residentName} (Space ${i + 1})` : data.residentName,
          residentPhone: data.residentPhone,
          residentEmail: data.residentEmail,
          residentAddress: data.residentAddress || null,
          emergencyContact: data.emergencyContact,
          emergencyRel: data.emergencyRel,
          notes: data.notes || null,
          totalPrice: Math.round(totalPrice),
          status: "PENDING",
        },
      });
      bookings.push(booking);
    }
    
    const booking = bookings[0]; // Main reference for emails

    // Determine the best email to reach the client
    // Priority: residentEmail from form > session user email
    const clientEmail = data.residentEmail || session?.user?.email || null;

    // Send booking confirmation email to client
    if (clientEmail) {
      const emailSetting = await prisma.setting.findUnique({ where: { key: "email_booking_received" } });
      const customerEmailData = bookingSubmisionEmail(data.residentName, listing.house?.name || "HOJ Hostel", emailSetting?.value || undefined);
      await sendEmail({ to: clientEmail, ...customerEmailData, type: "booking_confirmation" });
    }

    const isVerified = !!session?.user;

    // Prepare Admin Notification Details
    const notificationDetails = {
      customerName: data.residentName,
      customerEmail: clientEmail || "Not provided",
      listingTitle: listing.title,
      houseName: listing.house?.name || "HOJ Hostel",
      checkInDate: data.checkInDate,
      duration: data.duration,
      durationCount: data.durationCount,
      totalPrice: Math.round(totalPrice),
      residentPhone: data.residentPhone,
      emergencyContact: data.emergencyContact,
      emergencyRel: data.emergencyRel,
      notes: data.notes || "None",
      isVerified: isVerified,
    };

    // Fetch dynamic admin email from settings
    const adminEmailSetting = await prisma.setting.findUnique({ where: { key: "notification_email" } });
    const notifyAdminEmail = adminEmailSetting?.value || process.env.ADMIN_EMAIL || "houseofjessehostel@gmail.com";

    // Notify admin via Email
    const adminEmailOut = adminBookingNotificationEmail(notificationDetails);
    await sendEmail({ to: notifyAdminEmail, ...adminEmailOut, type: "admin_notification" });

    // Notify admin via Telegram (optional, admin-only alerts)
    const telegramMsg = `
<b>🚨 New Booking Request</b>
<b>Resident:</b> ${data.residentName} (${isVerified ? '✅ verified' : '❌ unverified'})
<b>Email:</b> ${clientEmail || 'Not provided'}
<b>Accommodation:</b> 1 Space in [${listing.title}]
<b>Location:</b> ${listing.house?.name || "HOJ Hostel"}
<b>Duration:</b> ${data.durationCount} ${data.duration.toLowerCase()}
<b>Total:</b> ₦${Math.round(totalPrice).toLocaleString()}
<b>Check-in:</b> ${new Date(data.checkInDate).toDateString()}

<a href="${process.env.NEXTAUTH_URL || 'https://hojhostel.vercel.app'}/admin/bookings">View in Admin Panel</a>
    `.trim();

    await sendTelegramNotification(telegramMsg);

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("[Booking] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
