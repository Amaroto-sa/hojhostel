import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { sendEmail, verificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = validated.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token (64-char hex, expires in 24 hours)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user and customer profile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
        verificationToken,
        verificationExpiry,
        customerProfile: {
          create: {
            phone: phone || null,
          },
        },
      },
    });

    // Send verification email
    const appUrl = process.env.NEXTAUTH_URL || "https://hojhostel.vercel.app";
    const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}`;
    const emailData = verificationEmail(name, verifyUrl);
    await sendEmail({ to: email, ...emailData, type: "email_verification" });

    return NextResponse.json(
      { message: "Account created. Please check your email to verify your account.", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
