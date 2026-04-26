import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");

        const filters: any = {};
        if (category) filters.category = category;

        const expenses = await prisma.expense.findMany({
            where: filters,
            orderBy: { date: "desc" },
        });

        return NextResponse.json(expenses);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const expense = await prisma.expense.create({
            data: {
                category: body.category,
                amount: Number(body.amount),
                description: body.description,
                date: body.date ? new Date(body.date) : new Date(),
                recordedBy: session.user.id
            }
        });

        return NextResponse.json(expense);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
    }
}
