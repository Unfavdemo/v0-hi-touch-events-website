import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { EmailEventType, VendorEngagementStatus } from "@/lib/generated/prisma/client"
import { verifyOpenTrackingRequest } from "@/lib/open-tracking"

const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
)

/** 1×1 transparent GIF — records `OPENED` when `p`/`s` verify. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const p = url.searchParams.get("p") ?? ""
  const s = url.searchParams.get("s") ?? ""
  const verified = verifyOpenTrackingRequest(p, s)
  if (verified) {
    try {
      const now = new Date()
      await prisma.$transaction(async (tx) => {
        const msg = await tx.emailMessage.findUnique({
          where: { id: verified.messageId },
          include: { engagement: true },
        })
        if (!msg?.engagementId || !msg.engagement) return
        await tx.emailEvent.create({
          data: {
            messageId: msg.id,
            type: EmailEventType.OPENED,
            occurredAt: now,
          },
        })
        const bumpStatus =
          msg.engagement.status === VendorEngagementStatus.SENT ||
          msg.engagement.status === VendorEngagementStatus.DELIVERED
        await tx.vendorEngagement.update({
          where: { id: msg.engagementId },
          data: {
            lastOpenedAt: now,
            ...(bumpStatus ? { status: VendorEngagementStatus.OPENED } : {}),
          },
        })
      })
    } catch {
      // still return pixel
    }
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  })
}
