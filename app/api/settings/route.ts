import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
    
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    
    const sensitiveKeys = [
      "notification_email", 
      "email_booking_approved", 
      "email_booking_rejected", 
      "security_alerts_enabled"
    ];
    
    settings.forEach((s) => { 
      if (isAdmin || !sensitiveKeys.includes(s.key)) {
        settingsMap[s.key] = s.value; 
      }
    });
    return NextResponse.json(settingsMap);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    
    if (body.bulk && Array.isArray(body.settings)) {
      const results = [];
      for (const s of body.settings) {
        const setting = await prisma.setting.upsert({
          where: { key: s.key },
          update: { value: s.value },
          create: { key: s.key, value: s.value },
        });
        results.push(setting);
      }
      return NextResponse.json(results);
    }

    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 });
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
