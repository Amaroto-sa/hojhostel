import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FinanceClient from "./FinanceClient";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    // Fetch Receipts (Income)
    const receipts = await prisma.receipt.findMany({
        orderBy: { createdAt: 'desc' }
    });

    // Fetch Expenses (Outgoing)
    const expenses = await prisma.expense.findMany({
        orderBy: { date: 'desc' }
    });

    return <FinanceClient initialReceipts={receipts} initialExpenses={expenses} />;
}
