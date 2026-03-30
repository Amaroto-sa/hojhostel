import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { name: true, email: true }, // Don't return password hash!
        });

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const { action } = body;

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // UPDATE NAME & EMAIL
        if (action === "UPDATE_PROFILE") {
            const { name, email } = body;

            if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

            // If changing email, check if it's already taken by another user
            if (email !== currentUser.email) {
                const existing = await prisma.user.findUnique({ where: { email } });
                if (existing) {
                    return NextResponse.json({ error: "This email is already in use by another account" }, { status: 400 });
                }
            }

            const updatedUser = await prisma.user.update({
                where: { id: currentUser.id },
                data: { name, email },
            });

            return NextResponse.json({ success: true, user: { name: updatedUser.name, email: updatedUser.email } });
        }

        // UPDATE PASSWORD
        if (action === "UPDATE_PASSWORD") {
            const { currentPassword, newPassword } = body;

            if (!currentPassword || !newPassword) {
                return NextResponse.json({ error: "Missing password fields" }, { status: 400 });
            }

            // Verify current password
            const isCorrectPassword = await bcrypt.compare(currentPassword, currentUser.password);
            if (!isCorrectPassword) {
                return NextResponse.json({ error: "Incorrect current password." }, { status: 400 });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 12);

            await prisma.user.update({
                where: { id: currentUser.id },
                data: { password: hashedPassword },
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("[Settings/Security PATCH Error]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
