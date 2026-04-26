import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClearanceClient from "./ClearanceClient";

export const dynamic = "force-dynamic";

export default async function ClearancePage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    // Fetch residents who have Moved Out or have active Clearances
    const clearances = await prisma.clearance.findMany({
        include: { resident: { include: { listing: { include: { house: true } } } } },
        orderBy: { updatedAt: 'desc' }
    });

    const pendingCheckoutResidents = await prisma.resident.findMany({
        where: {
            status: "MOVED_OUT",
            clearance: null
        },
        include: { listing: { include: { house: true } } }
    });

    return <ClearanceClient initialClearances={clearances} initialPending={pendingCheckoutResidents} />;
}
