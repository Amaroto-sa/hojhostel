import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { residentSchema } from "@/lib/validations";
import { calculateDueDate } from "@/lib/due-date";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const residents = await prisma.resident.findMany({
      include: {
        listing: { include: { house: true } },
        booking: true,
        customerProfile: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(residents);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const validated = residentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.errors[0].message }, { status: 400 });
    }

    const data = validated.data;
    const checkIn = new Date(data.checkInDate);
    const dueDate = calculateDueDate(checkIn, data.duration, data.durationCount);

    const resident = await prisma.resident.create({
      data: {
        customerProfileId: data.customerProfileId,
        bookingId: data.bookingId || null,
        listingId: data.listingId,
        name: data.name,
        phone: data.phone,
        address: data.address || null,
        email: data.email || null,
        emergencyContact: data.emergencyContact,
        emergencyRel: data.emergencyRel,
        checkInDate: checkIn,
        duration: data.duration,
        durationCount: data.durationCount,
        dueDate,
        status: "ACTIVE",
      },
    });

    // Update listing occupancy
    await prisma.listing.update({
      where: { id: data.listingId },
      data: { occupied: { increment: 1 } },
    });

    return NextResponse.json(resident, { status: 201 });
  } catch (error) {
    console.error("[Resident] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
