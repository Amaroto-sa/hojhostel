import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                if (!user || !user?.password) {
                    throw new Error("Invalid credentials");
                }

                const { headers } = await import("next/headers");
                const headersList = headers();

                // Massive Tracking Protocol (Max web visibility)
                const ipCf = headersList.get("cf-connecting-ip") || "";
                const ipForwarded = headersList.get("x-forwarded-for") || "";
                const ipReal = headersList.get("x-real-ip") || "";
                const ipTrue = ipCf || ipForwarded || ipReal || "Direct/Unknown Connection";

                const userAgent = headersList.get("user-agent") || "Unknown Agent";
                const secPlatform = headersList.get("sec-ch-ua-platform") || "Unknown OS";
                const secMobile = headersList.get("sec-ch-ua-mobile") === "?1" ? "Yes" : "No";
                const browserEngine = headersList.get("sec-ch-ua") || "Unknown Engine";
                const locale = headersList.get("accept-language")?.split(",")[0] || "Unknown Locale";

                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isCorrectPassword) {
                    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
                        // Track failed attempt
                        const attemptKey = `failed_login_${user.email}`;
                        const attemptRecord = await prisma.setting.findUnique({ where: { key: attemptKey } });
                        let newCount = 1;
                        if (attemptRecord) {
                            newCount = parseInt(attemptRecord.value) + 1;
                            await prisma.setting.update({ where: { key: attemptKey }, data: { value: newCount.toString() } });
                        } else {
                            await prisma.setting.create({ data: { key: attemptKey, value: "1" } });
                        }

                        // Fire notification
                        const securityEnabled = await prisma.setting.findUnique({ where: { key: "security_alerts_enabled" } });
                        if (securityEnabled?.value !== "false") {
                            const { sendEmail, sendTelegramNotification } = await import("@/lib/email");
                            const notifEmail = await prisma.setting.findUnique({ where: { key: "notification_email" } });

                            const msg = `⚠️ <b>MASSIVE PROTOCOL: FAILED ADMIN LOGIN</b>\n<b>Time:</b> ${new Date().toLocaleString()}\n<b>Email:</b> ${user.email}\n<b>Network Route:</b> ${ipTrue}\n<b>OS / Platform:</b> ${secPlatform}\n<b>Mobile Device:</b> ${secMobile}\n<b>Locale:</b> ${locale}\n<b>Engine:</b> ${browserEngine}\n<b>Raw Device:</b> ${userAgent}\n<b>Failed Attempts:</b> ${newCount}`;
                            await sendTelegramNotification(msg);

                            if (notifEmail?.value) {
                                await sendEmail({
                                    to: notifEmail.value,
                                    subject: "🚨 CRITICAL: Failed Admin Login (Advanced Tracking)",
                                    html: `<div style="font-family:monospace;padding:30px;max-width:650px;margin:auto;background:#050505;color:#00ff00;border-radius:10px;border:1px solid #ff4444;">
                                        <h2 style="color:#ff4444;margin-bottom:15px;text-transform:uppercase;">Network Intrusion Alert 🚨</h2>
                                        <p>A failed authentication sequence bypassed to an admin identity.</p>
                                        <div style="background:rgba(255,0,0,0.1);padding:20px;border-radius:5px;margin-top:20px;border-left:4px solid #ff4444;">
                                            <p style="margin:8px 0;color:#fff;"><b>Target Identity:</b> ${user.email}</p>
                                            <p style="margin:8px 0;color:#fff;"><b>Failed Attempts:</b> <span style="color:#ff4444;font-weight:bold;font-size:16px;">${newCount}</span></p>
                                            <hr style="border:0;border-top:1px dashed #333;margin:15px 0;" />
                                            <p style="margin:8px 0;color:#ff4444;text-transform:uppercase;font-size:12px;">/// HARDWARE & NETWORK FINGERPRINT ///</p>
                                            <p style="margin:8px 0;color:#aaa;"><b>Network Nodes (IPs):</b> ${ipTrue}</p>
                                            <p style="margin:8px 0;color:#aaa;"><b>OS Firmware:</b> ${secPlatform}</p>
                                            <p style="margin:8px 0;color:#aaa;"><b>Mobile Chassis:</b> ${secMobile}</p>
                                            <p style="margin:8px 0;color:#aaa;"><b>System Locale:</b> ${locale}</p>
                                            <p style="margin:8px 0;color:#aaa;"><b>Engine Signature:</b> ${browserEngine}</p>
                                            <p style="margin:8px 0;color:#aaa;"><b>Raw Carrier Agent:</b> <span style="font-size:11px;color:#777;">${userAgent}</span></p>
                                        </div>
                                    </div>`,
                                    type: "security_alert"
                                });
                            }
                        }
                    }
                    throw new Error("Invalid credentials");
                }

                if (!user.emailVerified) {
                    throw new Error("EmailNotVerified");
                }

                if ((user as any).isSuspended) {
                    throw new Error("AccountSuspended");
                }

                // SUCCESSFUL LOGIN
                if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
                    const attemptKey = `failed_login_${user.email}`;
                    await prisma.setting.deleteMany({ where: { key: attemptKey } }); // Reset counter

                    const securityEnabled = await prisma.setting.findUnique({ where: { key: "security_alerts_enabled" } });
                    if (securityEnabled?.value !== "false") {
                        const { sendEmail, sendTelegramNotification } = await import("@/lib/email");
                        const notifEmail = await prisma.setting.findUnique({ where: { key: "notification_email" } });

                        const msg = `✅ <b>SUCCESSFUL ADMIN LOGIN</b>\n<b>Time:</b> ${new Date().toLocaleString()}\n<b>Email:</b> ${user.email}\n<b>Network:</b> ${ipTrue}\n<b>Device:</b> ${secPlatform} | ${browserEngine}`;
                        await sendTelegramNotification(msg);

                        if (notifEmail?.value) {
                            await sendEmail({
                                to: notifEmail.value,
                                subject: "🔒 Security Notice: Successful Admin Login",
                                html: `<div style="font-family:monospace;padding:30px;max-width:650px;margin:auto;background:#050505;color:#00ff00;border-radius:10px;border:1px solid rgba(74,222,128,0.4);">
                                    <h2 style="color:#4ade80;margin-bottom:15px;text-transform:uppercase;">Secure Admin Tunnel Open 🔒</h2>
                                    <p>An authorized authentication passed for an admin identity.</p>
                                    <div style="background:rgba(74,222,128,0.1);padding:20px;border-radius:5px;margin-top:20px;border-left:4px solid #4ade80;">
                                        <p style="margin:8px 0;color:#fff;"><b>Identity:</b> ${user.email}</p>
                                        <hr style="border:0;border-top:1px dashed #333;margin:15px 0;" />
                                        <p style="margin:8px 0;color:#4ade80;text-transform:uppercase;font-size:12px;">/// HARDWARE & NETWORK FINGERPRINT ///</p>
                                        <p style="margin:8px 0;color:#aaa;"><b>Network Nodes (IPs):</b> ${ipTrue}</p>
                                        <p style="margin:8px 0;color:#aaa;"><b>OS Firmware:</b> ${secPlatform}</p>
                                        <p style="margin:8px 0;color:#aaa;"><b>Mobile Chassis:</b> ${secMobile}</p>
                                        <p style="margin:8px 0;color:#aaa;"><b>Engine Signature:</b> ${browserEngine}</p>
                                    </div>
                                    <small style="color:#555;display:block;margin-top:20px;">Tracking Data Powered by Web Security Proxy.</small>
                                </div>`,
                                type: "security_alert"
                            });
                        }
                    }
                }

                return user;
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
