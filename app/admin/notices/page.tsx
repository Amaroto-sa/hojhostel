import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NoticesClient from "./NoticesClient";

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    const notices = await prisma.notice.findMany({
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true } } }
    });

    return <NoticesClient initialNotices={notices} />;
}
