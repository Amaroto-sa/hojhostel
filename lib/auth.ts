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
                const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "Unknown IP";
                const userAgent = headersList.get("user-agent") || "Unknown Device";

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

                            const msg = `⚠️ <b>FAILED ADMIN LOGIN</b>\n<b>Time:</b> ${new Date().toLocaleString()}\n<b>Email:</b> ${user.email}\n<b>IP:</b> ${ip}\n<b>Device:</b> ${userAgent}\n<b>Failed Attempts:</b> ${newCount}`;
                            await sendTelegramNotification(msg);

                            if (notifEmail?.value) {
                                await sendEmail({
                                    to: notifEmail.value,
                                    subject: "🚨 Security Alert: Failed Admin Login Attempt",
                                    html: `<div style="font-family:sans-serif;padding:30px;max-width:600px;margin:auto;background:#0a0a0c;color:#f5f5f7;border-radius:16px;border:1px solid rgba(255,68,68,0.2);">
                                        <h2 style="color:#ff4444;margin-bottom:20px;">Security Alert 🚨</h2>
                                        <p>A failed login attempt was detected for an admin account.</p>
                                        <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;margin-top:20px;">
                                            <p style="margin:5px 0;"><b>Account:</b> ${user.email}</p>
                                            <p style="margin:5px 0;"><b>IP Address:</b> ${ip}</p>
                                            <p style="margin:5px 0;"><b>Device:</b> ${userAgent}</p>
                                            <p style="margin:5px 0;color:#ff4444;"><b>Failed Attempts:</b> ${newCount}</p>
                                        </div>
                                        <hr style="border:0;border-top:1px solid rgba(255,255,255,0.1);margin:20px 0;" />
                                        <small style="color:#888;">You can disable these alerts in your Admin Security Settings.</small>
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

                        const msg = `✅ <b>SUCCESSFUL ADMIN LOGIN</b>\n<b>Time:</b> ${new Date().toLocaleString()}\n<b>Email:</b> ${user.email}\n<b>IP:</b> ${ip}\n<b>Device:</b> ${userAgent}`;
                        await sendTelegramNotification(msg);

                        if (notifEmail?.value) {
                            await sendEmail({
                                to: notifEmail.value,
                                subject: "🔒 Security Notice: Successful Admin Login",
                                html: `<div style="font-family:sans-serif;padding:30px;max-width:600px;margin:auto;background:#0a0a0c;color:#f5f5f7;border-radius:16px;border:1px solid rgba(74,222,128,0.2);">
                                    <h2 style="color:#4ade80;margin-bottom:20px;">Login Notice 🔒</h2>
                                    <p>A successful login occurred for your admin account. If this was you, you can ignore this email.</p>
                                    <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;margin-top:20px;">
                                        <p style="margin:5px 0;"><b>Account:</b> ${user.email}</p>
                                        <p style="margin:5px 0;"><b>IP Address:</b> ${ip}</p>
                                        <p style="margin:5px 0;"><b>Device:</b> ${userAgent}</p>
                                    </div>
                                    <hr style="border:0;border-top:1px solid rgba(255,255,255,0.1);margin:20px 0;" />
                                    <small style="color:#888;">You can disable these alerts in your Admin Security Settings.</small>
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
