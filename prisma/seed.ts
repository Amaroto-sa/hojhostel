// Prisma seed file
// Run with: npx prisma db seed
// Add to package.json: "prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

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
      adminProfile: {
        create: { position: "Manager" },
      },
    },
  });
  console.log("✅ Admin user created:", admin.email);

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
  console.log("✅ Houses created: HOJ 1 & HOJ 2");

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
        description: "Shared accommodation with access to all amenities including storage, Wi-Fi, and cleaning services.",
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
        description: "Premium shared space with extra ventilation and comfort features.",
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
        description: "Standard private room with all amenities included.",
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
        description: "Premium private room with maximum privacy and enhanced features.",
        amenities: ["Premium Room", "Wi-Fi", "Cleaning", "Kitchen", "CCTV", "Electricity", "Parking", "Priority Support"],
        isPublished: true,
      },
    ],
  });
  console.log("✅ Listings created");

  // Create default settings
  const defaultSettings = [
    { key: "hostel_intro", value: "House of Jesse Hostel isn't just a place to sleep — it's your comfortable, affordable, and conveniently located accommodation with flexible payment. Suitable for starters, NYSC members, students, young professionals, and travelers." },
    { key: "whatsapp_number", value: "+2348145416775" },
    { key: "contact_email", value: "houseofjessehostel@gmail.com" },
    { key: "footer_text", value: "© House of Jesse / HOJ Hostel. Ajah, Lagos." },
    { key: "house_rules", value: "1. Keep common areas clean.\n2. No loud noise after 10 PM.\n3. Visitors must sign in at the front.\n4. No smoking inside the building.\n5. Report any maintenance issues promptly.\n6. Pay rent before the due date.\n7. Respect other residents' privacy and space." },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("✅ Default settings created");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
