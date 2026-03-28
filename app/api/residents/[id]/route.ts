import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
    const { status: newStatus, ...rest } = body;

    const resident = await prisma.resident.findUnique({
      where: { id: params.id },
    });

    if (!resident) {
      return NextResponse.json({ error: "Resident not found" }, { status: 404 });
    }

    // If marking as moved out or inactive, decrement occupancy
    if ((newStatus === "MOVED_OUT" || newStatus === "INACTIVE") && resident.status === "ACTIVE") {
      if (resident.listingId) {
        await prisma.listing.update({
          where: { id: resident.listingId },
          data: { occupied: { decrement: 1 } },
        });
      }
    }

    const updated = await prisma.resident.update({
      where: { id: params.id },
      data: { ...rest, status: newStatus },
    });

    return NextResponse.json(updated);
  } catch (error) {
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

    const resident = await prisma.resident.findUnique({ where: { id: params.id } });
    if (resident?.status === "ACTIVE" && resident.listingId) {
      await prisma.listing.update({
        where: { id: resident.listingId },
        data: { occupied: { decrement: 1 } },
      });
    }

    await prisma.resident.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Resident deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
