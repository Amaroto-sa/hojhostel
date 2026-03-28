import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { houseSchema } from "@/lib/validations";

export async function GET() {
  try {
    const houses = await prisma.house.findMany({
      where: { isActive: true },
      include: { listings: { where: { isPublished: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(houses);
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
    const validated = houseSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.errors[0].message }, { status: 400 });
    }

    const house = await prisma.house.create({
      data: {
        ...validated.data,
        images: body.images || [],
      },
    });

    return NextResponse.json(house, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
