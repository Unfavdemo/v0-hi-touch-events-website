import {
  EmailDirection,
  EmailEventType,
  VendorEngagementStatus,
} from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { sendTransactionalEmail } from "@/lib/email/transactional"
import { appendOpenTrackingPixel } from "@/lib/open-tracking"

const BATCH_SIZE = 25

export async function dispatchEmailQueue(): Promise<{ processed: number; failed: number }> {
  const pending = await prisma.emailMessage.findMany({
    where: {
      direction: EmailDirection.OUTBOUND,
      sentAt: null,
      dispatchAttempts: { lt: 5 },
    },
    orderBy: { createdAt: "asc" },
    take: BATCH_SIZE,
    include: {
      engagement: { include: { contact: true } },
    },
  })

  let processed = 0
  let failed = 0

  for (const msg of pending) {
    const to =
      msg.toEmail?.trim() ||
      msg.engagement?.contact?.email?.trim() ||
      null
    if (!to || !msg.bodyHtml) {
      await prisma.emailMessage.update({
        where: { id: msg.id },
        data: {
          dispatchAttempts: { increment: 1 },
          lastDispatchError: "Missing recipient or body",
        },
      })
      failed++
      continue
    }

    try {
      const html = appendOpenTrackingPixel(msg.bodyHtml, msg.id)
      const res = await sendTransactionalEmail({
        to,
        subject: msg.subject,
        html,
      })
      const now = new Date()
      await prisma.$transaction(async (tx) => {
        await tx.emailMessage.update({
          where: { id: msg.id },
          data: {
            sentAt: now,
            toEmail: to,
            providerMsgId: res?.id ?? undefined,
            lastDispatchError: null,
          },
        })
        await tx.emailEvent.create({
          data: {
            messageId: msg.id,
            type: EmailEventType.SENT,
            occurredAt: now,
          },
        })
        if (msg.engagementId && msg.engagement?.status === VendorEngagementStatus.QUEUED) {
          await tx.vendorEngagement.update({
            where: { id: msg.engagementId },
            data: { status: VendorEngagementStatus.SENT },
          })
        }
      })
      processed++
    } catch (err) {
      const message = err instanceof Error ? err.message : "Send failed"
      await prisma.emailMessage.update({
        where: { id: msg.id },
        data: {
          dispatchAttempts: { increment: 1 },
          lastDispatchError: message.slice(0, 500),
        },
      })
      failed++
    }
  }

  return { processed, failed }
}
