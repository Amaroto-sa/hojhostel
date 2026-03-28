// WhatsApp helper utilities
const WHATSAPP_NUMBER = "+2348145416775";

export function getWhatsAppLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}

export function getBookingWhatsAppLink(listingTitle: string, duration: string): string {
  const message = `Hello HOJ Hostel, I am interested in booking "${listingTitle}" for a ${duration.toLowerCase()} stay. Please let me know about availability.`;
  return getWhatsAppLink(message);
}

export function getInquiryWhatsAppLink(): string {
  const message = "Hello HOJ Hostel, I would like to inquire about available bed spaces and room options. Thank you!";
  return getWhatsAppLink(message);
}

export { WHATSAPP_NUMBER };
