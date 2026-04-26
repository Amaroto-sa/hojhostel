import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request, context: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const residentId = context.params.id;
        const body = await request.json();

        const clearance = await prisma.clearance.upsert({
            where: { residentId: residentId },
            update: {
                keysReturned: body.keysReturned,
                roomCondition: body.roomCondition,
                damagesFee: Number(body.damagesFee) || 0,
                cautionRefunded: Number(body.cautionRefunded) || 0,
                notes: body.notes,
                status: body.status || "CLEARED",
                clearedBy: session.user.id
            },
            create: {
                residentId: residentId,
                keysReturned: body.keysReturned,
                roomCondition: body.roomCondition,
                damagesFee: Number(body.damagesFee) || 0,
                cautionRefunded: Number(body.cautionRefunded) || 0,
                notes: body.notes,
                status: body.status || "CLEARED",
                clearedBy: session.user.id
            }
        });

        if (clearance.status === "CLEARED") {
            await prisma.resident.update({
                where: { id: residentId },
                data: { status: "MOVED_OUT" }
            });
        }

        return NextResponse.json(clearance);
    } catch (error) {
        return NextResponse.json({ error: "Failed to process clearance" }, { status: 500 });
    }
}
