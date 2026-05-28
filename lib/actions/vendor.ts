"use server"

import { revalidatePath } from "next/cache"
import {
  EmailDirection,
  EmailEventType,
  VendorEngagementStatus,
} from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requirePermission, requirePortal } from "@/lib/auth/guard"
import { buildProposalUrl } from "@/lib/proposal-token"

const REFUSAL_HTML = `<p>Thank you for your time and thoughtful response.</p>
<p>The client has decided to go in a different direction for this particular project. We'll stay in touch about future opportunities that may be a better fit.</p>
<p>— HiTouch Enterprises</p>`

function appendProposalLink(html: string, engagementId: string): string {
  const url = buildProposalUrl(engagementId)
  if (!url) return html
  const link = `<p style="margin-top:1.5em"><a href="${url}">View opportunity &amp; respond</a></p>`
  if (html.toLowerCase().includes("</body>")) {
    return html.replace(/<\/body>/i, `${link}</body>`)
  }
  return `${html}\n${link}`
}

export async function createVendorBroadcast(input: {
  projectId: string
  categoryKey: string
  subject: string
  bodyHtml: string
}) {
  const { admin } = await requirePermission("projects.broadcast")

  const category = await prisma.vendorSkillCategory.findUnique({
    where: { key: input.categoryKey },
  })
  if (!category) throw new Error("Unknown vendor skill category.")

  const contacts = await prisma.contact.findMany({
    where: { vendorSkills: { some: { categoryId: category.id } } },
    select: { id: true, email: true },
  })

  const now = new Date()

  const broadcastId = await prisma.$transaction(async (tx) => {
    const b = await tx.vendorBroadcast.create({
      data: {
        projectId: input.projectId,
        categoryId: category.id,
        subject: input.subject,
        bodyHtml: input.bodyHtml,
        createdById: admin.id,
        dispatchedAt: now,
      },
    })

    for (const c of contacts) {
      const engagement = await tx.vendorEngagement.create({
        data: {
          broadcastId: b.id,
          contactId: c.id,
          status: VendorEngagementStatus.QUEUED,
        },
      })
      const html = appendProposalLink(input.bodyHtml, engagement.id)
      await tx.emailMessage.create({
        data: {
          engagementId: engagement.id,
          toEmail: c.email,
          direction: EmailDirection.OUTBOUND,
          provider: "resend",
          subject: input.subject,
          bodyHtml: html,
          sentAt: null,
        },
      })
    }

    await tx.auditLog.create({
      data: {
        actorId: admin.id,
        action: "vendor.broadcast",
        entityType: "VendorBroadcast",
        entityId: b.id,
        payload: { projectId: input.projectId, recipientCount: contacts.length },
      },
    })

    return b.id
  })

  const { dispatchEmailQueue } = await import("@/lib/email/dispatch-queue")
  await dispatchEmailQueue().catch(() => {})

  revalidatePath(`/admin/projects/${input.projectId}`)
  revalidatePath("/admin/audit")
  return broadcastId
}

export async function markVendorWinner(broadcastId: string, winnerContactId: string) {
  const { admin } = await requirePermission("projects.winner")

  const broadcast = await prisma.vendorBroadcast.findUnique({
    where: { id: broadcastId },
    include: {
      engagements: { include: { contact: true } },
    },
  })
  if (!broadcast) throw new Error("Broadcast not found.")
  if (broadcast.refusalBatchSentAt) throw new Error("A winner was already recorded for this broadcast.")

  const losers = broadcast.engagements.filter((e) => e.contactId !== winnerContactId)

  await prisma.$transaction(async (tx) => {
    for (const e of broadcast.engagements) {
      if (e.contactId === winnerContactId) {
        await tx.vendorEngagement.update({
          where: { id: e.id },
          data: {
            status: VendorEngagementStatus.SELECTED_WINNER,
            selectedAt: new Date(),
          },
        })
      } else {
        await tx.vendorEngagement.update({
          where: { id: e.id },
          data: { status: VendorEngagementStatus.NOT_SELECTED },
        })
      }
    }

    await tx.vendorBroadcast.update({
      where: { id: broadcastId },
      data: {
        winnerContactId,
        refusalBatchSentAt: new Date(),
      },
    })

    await tx.eventProject.update({
      where: { id: broadcast.projectId },
      data: { winnerContactId },
    })

    for (const e of losers) {
      await tx.emailMessage.create({
        data: {
          engagementId: e.id,
          toEmail: e.contact.email,
          direction: EmailDirection.OUTBOUND,
          provider: "resend",
          subject: `Update: ${broadcast.subject}`,
          bodyHtml: REFUSAL_HTML,
          sentAt: null,
        },
      })
    }

    await tx.auditLog.create({
      data: {
        actorId: admin.id,
        action: "vendor.select_winner",
        entityType: "VendorBroadcast",
        entityId: broadcastId,
        payload: { projectId: broadcast.projectId, winnerContactId },
      },
    })
  })

  const { dispatchEmailQueue } = await import("@/lib/email/dispatch-queue")
  await dispatchEmailQueue().catch(() => {})

  revalidatePath(`/admin/projects/${broadcast.projectId}`)
  revalidatePath("/admin/audit")
}

export async function recordVendorProposalReply(
  engagementId: string,
  message: string
) {
  const engagement = await prisma.vendorEngagement.findUnique({
    where: { id: engagementId },
    include: { broadcast: true },
  })
  if (!engagement) throw new Error("Engagement not found.")

  const now = new Date()
  const body = message.trim() || "(No message provided)"

  await prisma.$transaction(async (tx) => {
    const msg = await tx.emailMessage.create({
      data: {
        engagementId,
        direction: EmailDirection.INBOUND,
        provider: "proposal_form",
        subject: `Reply: ${engagement.broadcast.subject}`,
        bodyHtml: `<p>${body.replace(/</g, "&lt;")}</p>`,
        sentAt: now,
      },
    })
    await tx.emailEvent.create({
      data: {
        messageId: msg.id,
        type: EmailEventType.INBOUND_REPLY,
        occurredAt: now,
      },
    })
    await tx.vendorEngagement.update({
      where: { id: engagementId },
      data: {
        lastReplyAt: now,
        status: VendorEngagementStatus.REPLIED,
      },
    })
  })

  return { ok: true as const }
}

export async function recordVendorProposalReplyFromPortal(engagementId: string, message: string) {
  const { portal } = await requirePortal()
  const engagement = await prisma.vendorEngagement.findFirst({
    where: { id: engagementId, contactId: portal.contactId },
  })
  if (!engagement) throw new Error("Engagement not found.")
  return recordVendorProposalReply(engagementId, message)
}
