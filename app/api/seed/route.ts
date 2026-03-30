import { NextResponse } from "next/server";

// Seed route — DISABLED after initial seeding.
// Database has already been seeded. This route is permanently disabled.
export async function GET() {
  return NextResponse.json({ error: "This route is disabled." }, { status: 404 });
}
