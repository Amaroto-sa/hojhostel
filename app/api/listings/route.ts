import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listingSchema } from "@/lib/validations";

export async function GET() {
  try {
    const listings = await prisma.listing.findMany({
      where: { isPublished: true },
      include: { house: true },
      orderBy: { createdAt: "desc" },
    });
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
