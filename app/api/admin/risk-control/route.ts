import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        const users = await prisma.user.findMany({
            where: { role: "CUSTOMER" },
            select: { id: true, name: true, email: true, createdAt: true },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(users);
    } catch (e) {
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
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
        }

        // Generate a highly secure but readable robust password
        // E.g. HOJ-9A2FK
        const randomPass = "HOJ-" + Math.random().toString(36).substring(2, 7).toUpperCase();
        const hashed = await bcrypt.hash(randomPass, 12);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashed }
        });

        return NextResponse.json({ success: true, newPassword: randomPass });
    } catch (error: any) {
        console.error("Risk control reset error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
