import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { houseSchema } from "@/lib/validations";

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
        const validated = houseSchema.partial().safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: validated.error.errors[0].message }, { status: 400 });
        }

        const house = await prisma.house.update({
            where: { id: params.id },
            data: validated.data,
        });

        return NextResponse.json(house);
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

        // Prisma Cascade delete handles listings automatically.
        await prisma.house.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: "House deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
