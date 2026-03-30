import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Partial schema for safe PATCH — only known listing fields are accepted
const patchListingSchema = z.object({
  title: z.string().min(2).optional(),
  type: z.enum(["BED_SPACE", "SINGLE_ROOM", "APARTMENT"]).optional(),
  price: z.number().min(0).optional(),
  capacity: z.number().min(1).optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  status: z.enum(["AVAILABLE", "LIMITED", "OCCUPIED", "MAINTENANCE"]).optional(),
  images: z.array(z.string()).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { house: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const validated = patchListingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.update({
      where: { id: params.id },
      data: validated.data,
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("[Listing PATCH] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.listing.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Listing deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
