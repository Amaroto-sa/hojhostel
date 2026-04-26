import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();

        // 1. Create the Clearance Record
        const clearance = await prisma.clearance.create({
            data: {
                residentId: body.residentId,
                keysReturned: body.keysReturned,
                roomDamages: body.roomDamages,
                finesDeducted: body.finesDeducted,
                cautionRefunded: body.cautionRefunded,
                isCleared: true,
                clearedBy: session.user.name || session.user.email
            },
            include: { resident: true }
        });

        // 2. Mark the resident as completely checked out (if needed, though MOVED_OUT handles it)

        return NextResponse.json(clearance);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to log clearance." }, { status: 500 });
    }
}
