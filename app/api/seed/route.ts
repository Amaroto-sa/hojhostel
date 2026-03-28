import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

// This route seeds the database when called with the correct secret.
// Call it ONCE after deploying: https://your-site.vercel.app/api/seed?secret=YOUR_ADMIN_SECRET
// Then delete this file or disable it.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash(process.env.ADMIN_SECRET || "admin123", 12);
    const admin = await prisma.user.upsert({
      where: { email: "admin@hojhostel.com" },
      update: {},
      create: {
        name: "HOJ Admin",
        email: "admin@hojhostel.com",
        password: adminPassword,
        role: "SUPER_ADMIN",
        adminProfile: { create: { position: "Manager" } },
      },
    });

    // Create houses
    const hoj1 = await prisma.house.upsert({
      where: { id: "hoj1" },
      update: {},
      create: {
        id: "hoj1",
        name: "HOJ 1",
        location: "Golden Rays Estate, Olokonla",
        description: "Our primary operational location, fully fitted with CCTV, steady electricity, and all premium amenities.",
        isActive: true,
      },
    });

    const hoj2 = await prisma.house.upsert({
      where: { id: "hoj2" },
      update: {},
      create: {
        id: "hoj2",
        name: "HOJ 2",
        location: "Greenland Estate, Olokonla Ajah",
        description: "Our second location, currently being set up to the same premium standards.",
        isActive: true,
      },
    });

    // Create listings
    await prisma.listing.createMany({
      skipDuplicates: true,
      data: [
        {
          houseId: hoj1.id,
          title: "7 Bed Spaces",
          type: "BED_SPACE",
          price: 30000,
          capacity: 7,
          status: "AVAILABLE",
          description: "Shared accommodation with access to all amenities.",
          amenities: ["Storage", "Wi-Fi", "Cleaning", "Kitchen", "CCTV", "Electricity"],
          isPublished: true,
        },
        {
          houseId: hoj1.id,
          title: "14 Bed Spaces",
          type: "BED_SPACE",
          price: 40000,
          capacity: 14,
          status: "AVAILABLE",
          description: "Premium shared space with extra ventilation.",
          amenities: ["Storage", "Wi-Fi", "Cleaning", "Kitchen", "CCTV", "Electricity", "Ventilation"],
          isPublished: true,
        },
        {
          houseId: hoj1.id,
          title: "Single Room A",
          type: "SINGLE_ROOM",
          price: 40000,
          capacity: 1,
          status: "AVAILABLE",
          description: "Standard private room with all amenities.",
          amenities: ["Private Room", "Wi-Fi", "Cleaning", "Kitchen", "CCTV", "Electricity", "Parking"],
          isPublished: true,
        },
        {
          houseId: hoj2.id,
          title: "Single Room B",
          type: "SINGLE_ROOM",
          price: 70000,
          capacity: 1,
          status: "AVAILABLE",
          isFeatured: true,
          description: "Premium private room with maximum privacy.",
          amenities: ["Premium Room", "Wi-Fi", "Cleaning", "Kitchen", "CCTV", "Electricity", "Parking"],
          isPublished: true,
        },
      ],
    });

    // Default settings
    const settings = [
      { key: "hostel_intro", value: "House of Jesse Hostel — comfortable, affordable accommodation in Ajah, Lagos." },
      { key: "whatsapp_number", value: "+2348145416775" },
      { key: "contact_email", value: "houseofjessehostel@gmail.com" },
      { key: "footer_text", value: "© House of Jesse / HOJ Hostel. Ajah, Lagos." },
      { key: "house_rules", value: "1. Keep common areas clean.\n2. No loud noise after 10 PM.\n3. Visitors must sign in.\n4. No smoking inside.\n5. Report maintenance issues promptly.\n6. Pay rent before due date.\n7. Respect other residents." },
    ];

    for (const s of settings) {
      await prisma.setting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      admin: { email: "admin@hojhostel.com", note: "Password is your ADMIN_SECRET env variable" },
      houses: ["HOJ 1 - Golden Rays", "HOJ 2 - Greenland"],
      listings: ["7 Bed (₦30k)", "14 Bed (₦40k)", "Single A (₦40k)", "Single B (₦70k)"],
    });
  } catch (error: any) {
    console.error("[Seed] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
