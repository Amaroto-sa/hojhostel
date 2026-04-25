import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateDueDate } from "@/lib/due-date";
import { sendEmail, sendTelegramNotification } from "@/lib/email";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { status: newStatus, ...rest } = body;

    const resident = await prisma.resident.findUnique({
      where: { id: params.id },
      include: {
        listing: { include: { house: true } },
        customerProfile: true,
      },
    });

    if (!resident) {
      return NextResponse.json({ error: "Resident not found" }, { status: 404 });
    }

    // Self-healing: if moving out, accurately recalculate total active occupancy for the room
    if ((newStatus === "MOVED_OUT" || newStatus === "INACTIVE") && resident.listingId) {
      const activeCount = await prisma.resident.count({
        where: {
          listingId: resident.listingId,
          status: { in: ["ACTIVE", "OVERDUE"] },
          id: { not: resident.id } // Exclude the resident currently moving out
        }
      });

      const listing = await prisma.listing.findUnique({ where: { id: resident.listingId } });
      if (listing) {
        await prisma.listing.update({
          where: { id: resident.listingId },
          data: {
            occupied: activeCount,
            status: activeCount === 0 ? "AVAILABLE" : activeCount < listing.capacity ? "LIMITED" : "OCCUPIED",
          },
        });
      }
    }

    // If renewing — admin can choose extension duration and type
    if (body.action === "RENEW") {
      // extensionCount: number of units to extend (default 1)
      // extensionDuration: DAILY | WEEKLY | MONTHLY (default: same as original)
      const extensionCount = body.extensionCount ? Number(body.extensionCount) : 1;
      const extensionDuration = body.extensionDuration || resident.duration;

      // Calculate new due date from the CURRENT due date (extend from where they are)
      const currentDueDate = new Date(resident.dueDate);
      const newDueDate = calculateDueDate(currentDueDate, extensionDuration, extensionCount);

      // Update duration count for tracking purposes
      // If same duration type, add to existing count. If different, just update.
      let newDurationCount = resident.durationCount;
      if (extensionDuration === resident.duration) {
        newDurationCount = resident.durationCount + extensionCount;
      } else {
        newDurationCount = extensionCount;
      }

      let renewalAmount = 0;
      if (resident.listing) {
        renewalAmount = resident.listing.price * extensionCount;
        if (extensionDuration === "MONTHLY") {
          renewalAmount = resident.listing.price * 4 * extensionCount;
        } else if (extensionDuration === "DAILY") {
          renewalAmount = (resident.listing.price / 7) * extensionCount;
        }
      }
      renewalAmount = Math.round(renewalAmount);

      const receiptNumber = "REC-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

      const renewed = await prisma.resident.update({
        where: { id: params.id },
        data: {
          durationCount: newDurationCount,
          duration: extensionDuration,
          dueDate: newDueDate,
          status: "ACTIVE",
          renewals: {
            create: {
              previousDueDate: currentDueDate,
              newDueDate: newDueDate,
              duration: extensionDuration,
              durationCount: extensionCount,
              notes: "Manual renewal via admin",
            }
          },
          receipts: {
            create: {
              receiptNumber,
              amount: renewalAmount,
              description: `Renewal for ${extensionCount} ${extensionDuration.toLowerCase()}`,
              type: "RENEWAL",
              userId: resident.customerProfile?.userId || null,
              bookingId: resident.bookingId || null,
            }
          }
        },
      });

      // Send renewal confirmation email to resident
      if (resident.email) {
        const durationLabel = extensionDuration === "DAILY" ? "day" : extensionDuration === "WEEKLY" ? "week" : "month";
        const renewalEmail = {
          subject: "Stay Extended — HOJ Hostel",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0c;color:#f5f5f7;border-radius:16px;border:1px solid rgba(255,122,26,0.1);">
              <h1 style="color:#ff7a1a;font-size:24px;margin-bottom:20px;">Stay Extended ✅</h1>
              <p style="font-size:16px;line-height:1.6;">Hi ${resident.name},</p>
              <p style="font-size:16px;line-height:1.6;">Your stay at <strong>House of Jesse Hostel</strong> has been extended.</p>
              <div style="background:rgba(255,255,255,0.05);padding:20px;border-radius:12px;margin:24px 0;">
                <table style="width:100%;font-size:14px;line-height:2.2;">
                  <tr><td style="color:#b1b1ba;width:140px;">Accommodation:</td><td style="color:#ececf0;"><strong>${resident.listing?.title || 'N/A'}</strong></td></tr>
                  <tr><td style="color:#b1b1ba;">Location:</td><td style="color:#ececf0;">${resident.listing?.house?.name || 'HOJ'}</td></tr>
                  <tr><td style="color:#b1b1ba;">Extension:</td><td style="color:#ececf0;"><strong>${extensionCount} ${durationLabel}${extensionCount > 1 ? 's' : ''}</strong></td></tr>
                  <tr><td style="color:#b1b1ba;">New Due Date:</td><td style="color:#ff7a1a;font-weight:bold;font-size:16px;">${newDueDate.toDateString()}</td></tr>
                </table>
              </div>
              <p style="font-size:14px;color:#b1b1ba;">If you have any questions, reach out via WhatsApp:</p>
              <div style="margin:16px 0;">
                <a href="https://wa.me/2348145416775" style="background:#ff7a1a;color:#111;font-weight:bold;padding:12px 24px;border-radius:30px;text-decoration:none;display:inline-block;font-size:14px;">Chat on WhatsApp</a>
              </div>
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
              <p style="color:#666;font-size:12px;">House of Jesse / HOJ Hostel &nbsp;|&nbsp; Ajah, Lagos</p>
            </div>
          `,
        };
        await sendEmail({ to: resident.email, ...renewalEmail, type: "renewal" });
      }

      // Notify admin via Telegram
      const durationLabel = extensionDuration === "DAILY" ? "day" : extensionDuration === "WEEKLY" ? "week" : "month";
      await sendTelegramNotification(
        `🔄 <b>Stay Renewed</b>\n<b>Resident:</b> ${resident.name}\n<b>Extension:</b> ${extensionCount} ${durationLabel}${extensionCount > 1 ? 's' : ''}\n<b>New Due Date:</b> ${newDueDate.toDateString()}`
      );

      return NextResponse.json(renewed);
    }

    const updated = await prisma.resident.update({
      where: { id: params.id },
      data: { ...rest, status: newStatus },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Resident Update] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const resident = await prisma.resident.findUnique({ where: { id: params.id } });

    await prisma.resident.delete({ where: { id: params.id } });

    // Self-healing check for stuck listing upon resident deletion
    if (resident?.listingId) {
      const activeCount = await prisma.resident.count({
        where: {
          listingId: resident.listingId,
          status: { in: ["ACTIVE", "OVERDUE"] },
          id: { not: resident.id }
        }
      });

      const listing = await prisma.listing.findUnique({ where: { id: resident.listingId } });
      if (listing) {
        await prisma.listing.update({
          where: { id: resident.listingId },
          data: {
            occupied: activeCount,
            status: activeCount === 0 ? "AVAILABLE" : activeCount < listing.capacity ? "LIMITED" : "OCCUPIED",
          },
        });
      }
    }

    return NextResponse.json({ message: "Resident deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
