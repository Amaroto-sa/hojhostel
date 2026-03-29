import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const images = await prisma.galleryImage.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(images);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { url, caption } = await request.json();

        const newImage = await prisma.galleryImage.create({
            data: { url, caption: caption || null },
        });

        return NextResponse.json(newImage);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create gallery image" }, { status: 500 });
    }
}
