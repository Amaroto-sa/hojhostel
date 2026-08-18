import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNigerianNumber, sendWhatsAppTemplate, sendWhatsAppText } from "@/lib/whatsapp-cloud";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { message, templateName, type, targetAudience, customNumbers } = body;

        if (!message && type === "CUSTOM") {
            return NextResponse.json({ error: "Message is required for custom broadcasts." }, { status: 400 });
        }
        
        if (!templateName && type === "TEMPLATE") {
            return NextResponse.json({ error: "Template name is required for template broadcasts." }, { status: 400 });
        }

        // Fetch target audience phone numbers
        let rawNumbers: { phone: string; residentId?: string }[] = [];

        if (targetAudience === "CUSTOM_NUMBERS" && customNumbers) {
            // Parse comma/newline separated numbers
            const parsed = String(customNumbers).split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
            rawNumbers = parsed.map(phone => ({ phone }));
        } else if (targetAudience === "BOOKINGS") {
            const bookings = await prisma.booking.findMany({
                select: { id: true, residentPhone: true }
            });
            rawNumbers = bookings.map(b => ({ phone: b.residentPhone }));
        } else if (targetAudience === "ALL_RESIDENTS") {
            const residents = await prisma.resident.findMany({
                select: { id: true, phone: true }
            });
            rawNumbers = residents.map(r => ({ phone: r.phone, residentId: r.id }));
        } else if (targetAudience === "ALL") {
            // Combine residents, bookings, and customer profiles
            const [residents, bookings, profiles] = await Promise.all([
                prisma.resident.findMany({ select: { id: true, phone: true } }),
                prisma.booking.findMany({ select: { id: true, residentPhone: true } }),
                prisma.customerProfile.findMany({ select: { id: true, phone: true } })
            ]);

            residents.forEach(r => r.phone && rawNumbers.push({ phone: r.phone, residentId: r.id }));
            bookings.forEach(b => b.residentPhone && rawNumbers.push({ phone: b.residentPhone }));
            profiles.forEach(p => p.phone && rawNumbers.push({ phone: p.phone }));
        } else {
            // Default / ACTIVE_RESIDENTS: Try active residents first
            const activeResidents = await prisma.resident.findMany({
                where: { status: "ACTIVE" },
                select: { id: true, phone: true }
            });
            
            rawNumbers = activeResidents.map(r => ({ phone: r.phone, residentId: r.id }));

            // Fallback: If no active residents, search all residents, then bookings
            if (rawNumbers.length === 0) {
                const allResidents = await prisma.resident.findMany({
                    select: { id: true, phone: true }
                });
                rawNumbers = allResidents.map(r => ({ phone: r.phone, residentId: r.id }));
            }

            if (rawNumbers.length === 0) {
                const allBookings = await prisma.booking.findMany({
                    select: { id: true, residentPhone: true }
                });
                rawNumbers = allBookings.map(b => ({ phone: b.residentPhone }));
            }

            if (rawNumbers.length === 0) {
                const profiles = await prisma.customerProfile.findMany({
                    select: { id: true, phone: true }
                });
                profiles.forEach(p => p.phone && rawNumbers.push({ phone: p.phone }));
            }
        }

        if (rawNumbers.length === 0) {
            return NextResponse.json({ error: "No phone numbers found to broadcast to. Please select another audience or enter custom numbers." }, { status: 404 });
        }

        // Deduplicate numbers and format them
        const uniqueRecipients = new Map<string, string | undefined>();
        
        rawNumbers.forEach(r => {
            if (r.phone) {
                const formatted = formatNigerianNumber(r.phone);
                if (formatted) {
                    uniqueRecipients.set(formatted, r.residentId);
                }
            }
        });

        const recipientsList = Array.from(uniqueRecipients.entries());

        if (recipientsList.length === 0) {
            return NextResponse.json({ error: "No valid phone numbers found." }, { status: 400 });
        }

        // Create the Broadcast record
        const broadcast = await prisma.broadcast.create({
            data: {
                message: message || `Template: ${templateName}`,
                templateName: templateName || null,
                type: type || "CUSTOM",
                status: "PROCESSING",
                senderId: session.user.id,
            }
        });

        // Track successes and failures
        let sentCount = 0;
        let failCount = 0;
        
        const recipientRecords = [];

        // Loop through and send
        for (const [phone, residentId] of recipientsList) {
            let status = "PENDING";
            let error = null;
            let messageId = null;

            try {
                let result;
                if (type === "TEMPLATE") {
                    result = await sendWhatsAppTemplate(phone, templateName);
                } else {
                    result = await sendWhatsAppText(phone, message);
                }

                if (result.messages && result.messages.length > 0) {
                    status = "SENT";
                    messageId = result.messages[0].id;
                    sentCount++;
                } else {
                    status = "FAILED";
                    error = "No message ID returned from Meta";
                    failCount++;
                }
            } catch (err: any) {
                status = "FAILED";
                error = err.message || "Unknown Meta API Error";
                failCount++;
            }

            recipientRecords.push({
                broadcastId: broadcast.id,
                residentId: residentId || null,
                phone: phone,
                status: status,
                error: error,
                messageId: messageId
            });
        }

        // Save recipient records
        await prisma.broadcastRecipient.createMany({
            data: recipientRecords
        });

        // Update overall broadcast status
        await prisma.broadcast.update({
            where: { id: broadcast.id },
            data: {
                status: failCount === 0 ? "COMPLETED" : (sentCount === 0 ? "FAILED" : "COMPLETED_WITH_ERRORS")
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Broadcast processed successfully.",
            data: {
                broadcastId: broadcast.id,
                sent: sentCount,
                failed: failCount,
                total: recipientsList.length
            }
        });

    } catch (error: any) {
        console.error("Broadcast Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
