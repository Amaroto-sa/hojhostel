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

        const expense = await prisma.expense.create({
            data: {
                amount: body.amount,
                category: body.category,
                description: body.description,
                userId: session.user.id
            }
        });

        return NextResponse.json(expense);
    } catch (error) {
        return NextResponse.json({ error: "Failed to log expense" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID missing" }, { status: 400 });

        await prisma.expense.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
    }
}
