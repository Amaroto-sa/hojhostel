import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listingSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

    const listings = await prisma.listing.findMany({
      where: isAdmin ? undefined : { isPublished: true },
      include: { house: true },
      orderBy: { createdAt: "desc" },
    });

    // SELF-HEALING: Auto-correct any mismatched occupancy data (stale data from glitches)
    // We do this by checking actual ACTIVE/OVERDUE residents in the DB for each listing
    const activeResidentsCount = await prisma.resident.groupBy({
      by: ['listingId'],
      where: {
        status: { in: ["ACTIVE", "OVERDUE"] }
      },
      _count: { id: true }
    });

    const activeCountsMap = new Map(
      activeResidentsCount.filter(r => r.listingId).map(r => [r.listingId as string, r._count.id])
    );

    for (const listing of listings) {
      const realCount = activeCountsMap.get(listing.id) || 0;
      const expectedStatus = realCount === 0 ? "AVAILABLE" : realCount < listing.capacity ? "LIMITED" : "OCCUPIED";

      if (listing.occupied !== realCount || listing.status !== expectedStatus) {
        // Fix stale occupancy and status
        await prisma.listing.update({
          where: { id: listing.id },
          data: { occupied: realCount, status: expectedStatus }
        });

        listing.occupied = realCount;
        listing.status = expectedStatus;
      }
    }
    return NextResponse.json(listings);
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
    const validated = listingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validated.data;

    const listing = await prisma.listing.create({
      data: {
        houseId: data.houseId,
        title: data.title,
        type: data.type,
        price: data.price,
        capacity: data.capacity,
        description: data.description || null,
        amenities: data.amenities || [],
        isFeatured: data.isFeatured || false,
        isPublished: data.isPublished ?? true,
        images: body.images || [],
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("[Listing] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
