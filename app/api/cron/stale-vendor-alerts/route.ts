import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { VendorEngagementStatus } from "@/lib/generated/prisma/client"

function assertCronAuth(request: Request) {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return false
  const auth = request.headers.get("authorization")
  return auth === `Bearer ${secret}`
}

export async function POST(request: Request) {
  if (!assertCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: true, created: 0, skipped: "no database" })
  }

  const engagements = await prisma.vendorEngagement.findMany({
    where: {
      lastReplyAt: null,
      status: { in: [VendorEngagementStatus.SENT, VendorEngagementStatus.DELIVERED, VendorEngagementStatus.OPENED] },
    },
    include: { broadcast: true },
  })

  let created = 0
  const now = Date.now()

  for (const e of engagements) {
    const base = e.broadcast.dispatchedAt ?? e.broadcast.createdAt
    const deadline = base.getTime() + e.broadcast.staleAfterHours * 60 * 60 * 1000
    if (now <= deadline) continue

    const existing = await prisma.adminNotification.findFirst({
      where: { engagementId: e.id, type: "stale_vendor_reply" },
    })
    if (existing) continue

    await prisma.adminNotification.create({
      data: {
        type: "stale_vendor_reply",
        title: "Vendor response may be stale",
        body: `Engagement ${e.id} on broadcast ${e.broadcastId} has no reply after ${e.broadcast.staleAfterHours}h.`,
        engagementId: e.id,
      },
    })
    created += 1
  }

  return NextResponse.json({ ok: true, created })
}
