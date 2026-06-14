import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const session = await getServerSession(authOptions);
    const authSetting = await prisma.setting.findUnique({ where: { key: "enable_guest_booking" } });
    const isGuestAllowed = authSetting?.value === "true";

    if (!session && !isGuestAllowed) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: "Cloudinary credentials missing from env" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const signatureKey = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash("sha1").update(signatureKey).digest("hex");

    const cloudFormData = new FormData();
    cloudFormData.append("file", file);
    cloudFormData.append("timestamp", timestamp);
    cloudFormData.append("api_key", CLOUDINARY_API_KEY);
    cloudFormData.append("signature", signature);

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: cloudFormData }
    );

    if (!cloudinaryRes.ok) {
      const text = await cloudinaryRes.text();
      console.error("Cloudinary error:", text);
      return NextResponse.json({ error: "Cloudinary upload failed", details: text }, { status: 500 });
    }

    const cloudData = await cloudinaryRes.json();
    return NextResponse.json({ url: cloudData.secure_url });

  } catch (error) {
    return NextResponse.json({ error: "Upload error", details: String(error) }, { status: 500 });
  }
}
