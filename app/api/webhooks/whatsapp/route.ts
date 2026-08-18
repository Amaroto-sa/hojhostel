import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

// Meta verifies the webhook via GET request
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse("Forbidden", { status: 403 });
}

// Meta sends status updates via POST request
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Check if this is a WhatsApp status update
        if (body.object === "whatsapp_business_account") {
            for (const entry of body.entry || []) {
                for (const change of entry.changes || []) {
                    const value = change.value;
                    
                    // Handle message statuses (sent, delivered, read, failed)
                    if (value.statuses && value.statuses.length > 0) {
                        for (const status of value.statuses) {
                            const messageId = status.id;
                            const statusType = status.status; // 'sent', 'delivered', 'read', 'failed'
                            
                            // Map Meta status to our DB status
                            let dbStatus = "SENT";
                            if (statusType === "delivered") dbStatus = "DELIVERED";
                            if (statusType === "read") dbStatus = "READ";
                            if (statusType === "failed") dbStatus = "FAILED";

                            // Update the BroadcastRecipient
                            await prisma.broadcastRecipient.updateMany({
                                where: { messageId: messageId },
                                data: { 
                                    status: dbStatus,
                                    error: status.errors ? JSON.stringify(status.errors) : null
                                }
                            });
                        }
                    }
                    
                    // Note: Incoming messages (replies) can also be handled here by looking at value.messages
                }
            }
        }

        return new NextResponse("OK", { status: 200 });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return new NextResponse("Error processing webhook", { status: 500 });
    }
}
