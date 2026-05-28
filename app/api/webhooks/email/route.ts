import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { EmailEventType, VendorEngagementStatus } from "@/lib/generated/prisma/client"

/**
 * Generic provider webhook (Resend/Postmark-compatible shape).
 * POST JSON: `{ "secret": "...", "providerMsgId": "...", "type": "open"|"reply"|"bounce" }`
 */
export async function POST(request: Request) {
  const expected = process.env.WEBHOOK_EMAIL_SECRET?.trim()
  if (!expected) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 })
  }

  if (body.secret !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const providerMsgId = typeof body.providerMsgId === "string" ? body.providerMsgId : ""
  const type = typeof body.type === "string" ? body.type : ""
  if (!providerMsgId || !type) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 })
  }

  const msg = await prisma.emailMessage.findFirst({
    where: { providerMsgId },
    include: { engagement: true },
  })
  if (!msg) {
    return NextResponse.json({ ok: true, ignored: true })
  }

  const now = new Date()

  if (type === "open") {
    await prisma.$transaction(async (tx) => {
      await tx.emailEvent.create({
        data: { messageId: msg.id, type: EmailEventType.OPENED, occurredAt: now },
      })
      if (msg.engagementId && msg.engagement) {
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
      }
    })
  }

  if (type === "reply") {
    await prisma.$transaction(async (tx) => {
      await tx.emailEvent.create({
        data: { messageId: msg.id, type: EmailEventType.INBOUND_REPLY, occurredAt: now },
      })
      if (msg.engagementId) {
        await tx.vendorEngagement.update({
          where: { id: msg.engagementId },
          data: {
            lastReplyAt: now,
            status: VendorEngagementStatus.REPLIED,
          },
        })
      }
    })
  }

  if (type === "bounce") {
    await prisma.emailEvent.create({
      data: { messageId: msg.id, type: EmailEventType.BOUNCED, occurredAt: now },
    })
  }

  return NextResponse.json({ ok: true })
}
