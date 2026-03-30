import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json({ error: "Missing verification token." }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { verificationToken: token },
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid verification link." }, { status: 400 });
        }

        if (user.emailVerified) {
            return NextResponse.json({ message: "already_verified" }, { status: 200 });
        }

        if (!user.verificationExpiry || new Date() > user.verificationExpiry) {
            return NextResponse.json({ error: "Verification link has expired. Please register again." }, { status: 400 });
        }

        // Mark email as verified and clear the token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verificationToken: null,
                verificationExpiry: null,
            },
        });

        return NextResponse.json({ message: "verified" }, { status: 200 });
    } catch (error) {
        console.error("[Verify Email] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
