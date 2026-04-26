import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const publicOnly = searchParams.get("public") === "true";

        const filter = publicOnly ? { isPublished: true } : {};

        const notices = await prisma.notice.findMany({
            where: filter,
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(notices);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const notice = await prisma.notice.create({
            data: {
                title: body.title,
                message: body.message,
                type: body.type || "INFO",
                isPublished: body.isPublished ?? true,
                createdBy: session.user.id
            }
        });

        // NodeMailer logic would be placed here to bulk broadcast emails
        // const activeResidents = await prisma.resident.findMany({ where: { status: "ACTIVE" }});

        return NextResponse.json(notice);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create notice" }, { status: 500 });
    }
}
