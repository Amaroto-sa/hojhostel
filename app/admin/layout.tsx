import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import DraggableBot from "@/components/DraggableBot";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const logoSetting = await prisma.setting.findUnique({ where: { key: "logo_url" } });
  const logoUrl = logoSetting?.value;
  
  const botSetting = await prisma.setting.findUnique({ where: { key: "system_bot_enabled" } });
  const isBotEnabled = botSetting?.value === "true";

  return (
    <div className="min-h-screen bg-[#080809] lg:flex">
      <AdminSidebar session={session} logoUrl={logoUrl} />

      {/* Main content */}
      <main className="flex-1 w-full lg:pt-0 pt-16 transition-all duration-300">
        <div className="p-4 md:p-8 lg:p-10 w-full max-w-[1400px] mx-auto overflow-x-auto">
          <div className="rounded-3xl bg-[rgba(255,255,255,0.015)] border border-white/5 p-4 md:p-8 min-h-[calc(100vh-140px)] shadow-2xl backdrop-blur-sm">
            {children}
          </div>
        </div>
      </main>

      {/* Beta System Bot */}
      {isBotEnabled && <DraggableBot />}
    </div>
  );
}
