import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await request.json();
        const { guestName, guestPhone, houseId, category, priority, subject, description } = body;

        const complaint = await prisma.complaint.create({
            data: {
                userId: session?.user?.id || null,
                guestName: guestName || null,
                guestPhone: guestPhone || null,
                houseId,
                category,
                priority: priority || "MEDIUM",
                subject,
                description,
                status: "PENDING",
            },
        });

        return NextResponse.json(complaint);
    } catch (error) {
        console.error("Complaint error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
