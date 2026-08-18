/**
 * WhatsApp Cloud API Service
 * 
 * Handles formatting numbers, sending templates, and sending text messages
 * via the Meta Graph API (v19.0).
 */

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_VERSION = process.env.WHATSAPP_API_VERSION || "v20.0";
const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

/**
 * Normalizes a Nigerian phone number for the WhatsApp Cloud API.
 * E.g., '08012345678' -> '2348012345678'
 * '+2348012345678' -> '2348012345678'
 */
export function formatNigerianNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, "");

    // If it starts with '0', replace '0' with '234'
    if (cleaned.startsWith("0")) {
        cleaned = "234" + cleaned.substring(1);
    }
    
    return cleaned;
}

/**
 * Sends a pre-approved Meta WhatsApp Template message.
 */
export async function sendWhatsAppTemplate(toPhone: string, templateName: string, languageCode = "en_US") {
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
        throw new Error("WhatsApp Cloud API credentials are not configured in .env");
    }

    const formattedPhone = formatNigerianNumber(toPhone);

    const payload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
            name: templateName,
            language: {
                code: languageCode
            }
        }
    };

    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`WhatsApp API Error: ${data.error?.message || "Unknown error"}`);
    }

    return data;
}

/**
 * Sends a standard text message.
 * Note: Only works if the user has messaged the business within the last 24 hours.
 */
export async function sendWhatsAppText(toPhone: string, message: string) {
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
        throw new Error("WhatsApp Cloud API credentials are not configured in .env");
    }

    const formattedPhone = formatNigerianNumber(toPhone);

    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "text",
        text: {
            preview_url: false,
            body: message
        }
    };

    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`WhatsApp API Error: ${data.error?.message || "Unknown error"}`);
    }

    return data;
}
