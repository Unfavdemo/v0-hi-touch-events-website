"use server"

import { revalidatePath } from "next/cache"
import { ActivityKind, PendingStatus } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth/guard"

function splitName(fullName: string): { firstName: string | null; lastName: string | null } {
  const t = fullName.trim()
  if (!t) return { firstName: null, lastName: null }
  const parts = t.split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: null }
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") }
}

export async function approvePendingSubmission(submissionId: string, hiTouchClientIds: string[] = []) {
  const { admin, role } = await requirePermission("pending.approve")

  await prisma.$transaction(async (tx) => {
    const pending = await tx.pendingSubmission.findFirst({
      where: { id: submissionId, status: PendingStatus.PENDING },
    })
    if (!pending) throw new Error("Not found or already processed")

    const { firstName, lastName } = splitName(pending.fullName)

    let companyId: string | null = null
    if (pending.organization?.trim()) {
      const company = await tx.company.create({
        data: { name: pending.organization.trim() },
      })
      companyId = company.id
    }

    const contact = await tx.contact.upsert({
      where: { email: pending.email.toLowerCase() },
      create: {
        email: pending.email.toLowerCase(),
        phone: pending.phone,
        firstName,
        lastName,
        companyId,
        notes: pending.message,
      },
      update: {
        phone: pending.phone ?? undefined,
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        companyId: companyId ?? undefined,
        notes: pending.message ?? undefined,
      },
    })

    const uniqueClientIds = [...new Set(hiTouchClientIds)].filter(Boolean)
    for (const cid of uniqueClientIds) {
      const exists = await tx.hiTouchClient.findUnique({ where: { id: cid } })
      if (!exists) continue
      await tx.contactHiTouchClient.upsert({
        where: {
          contactId_hiTouchClientId: { contactId: contact.id, hiTouchClientId: cid },
        },
        create: { contactId: contact.id, hiTouchClientId: cid },
        update: {},
      })
    }

    if (pending.message?.trim()) {
      await tx.contactActivity.create({
        data: {
          contactId: contact.id,
          companyId,
          kind: ActivityKind.SYSTEM,
          body: `Approved from intake:\n${pending.message.trim()}`,
          createdById: admin.id,
        },
      })
    }

    await tx.pendingSubmission.update({
      where: { id: pending.id },
      data: {
        status: PendingStatus.APPROVED,
        reviewedAt: new Date(),
        reviewedById: admin.id,
      },
    })

    await tx.auditLog.create({
      data: {
        actorId: admin.id,
        action: "pending.approve",
        entityType: "PendingSubmission",
        entityId: pending.id,
        payload: { email: pending.email, hiTouchClientIds: uniqueClientIds, actorRole: role },
      },
    })
  })

  revalidatePath("/admin/pending")
  revalidatePath("/admin/crm/contacts")
  revalidatePath("/admin/audit")
}

export async function declinePendingSubmission(submissionId: string) {
  const { admin, role } = await requirePermission("pending.approve")

  await prisma.$transaction(async (tx) => {
    const pending = await tx.pendingSubmission.findFirst({
      where: { id: submissionId, status: PendingStatus.PENDING },
    })
    if (!pending) throw new Error("Not found or already processed")

    await tx.pendingSubmission.update({
      where: { id: pending.id },
      data: {
        status: PendingStatus.DECLINED,
        reviewedAt: new Date(),
        reviewedById: admin.id,
      },
    })

    await tx.auditLog.create({
      data: {
        actorId: admin.id,
        action: "pending.decline",
        entityType: "PendingSubmission",
        entityId: pending.id,
        payload: { actorRole: role },
      },
    })
  })

  revalidatePath("/admin/pending")
  revalidatePath("/admin/audit")
}

export async function markPendingSpam(submissionId: string) {
  const { admin, role } = await requirePermission("pending.approve")

  await prisma.$transaction(async (tx) => {
    const pending = await tx.pendingSubmission.findFirst({
      where: { id: submissionId, status: PendingStatus.PENDING },
    })
    if (!pending) throw new Error("Not found or already processed")

    await tx.pendingSubmission.update({
      where: { id: pending.id },
      data: {
        status: PendingStatus.SPAM,
        reviewedAt: new Date(),
        reviewedById: admin.id,
      },
    })

    await tx.auditLog.create({
      data: {
        actorId: admin.id,
        action: "pending.spam",
        entityType: "PendingSubmission",
        entityId: pending.id,
        payload: { actorRole: role },
      },
    })
  })

  revalidatePath("/admin/pending")
  revalidatePath("/admin/audit")
}
