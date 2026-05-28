"use server"

import { revalidatePath } from "next/cache"
import { PortalKind } from "@/lib/generated/prisma/client"
import type { PortalKindOption } from "@/components/portal/portal-invite-form"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth/guard"
import { signIn } from "@/auth"

export async function inviteContactToPortal(contactId: string, kind: PortalKindOption) {
  const portalKind = kind === "VENDOR" ? PortalKind.VENDOR : PortalKind.CLIENT
  const { admin, role } = await requirePermission("portal.invite")

  const contact = await prisma.contact.findUnique({ where: { id: contactId } })
  if (!contact?.email) throw new Error("Contact must have an email.")

  const email = contact.email.toLowerCase()

  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: { email, name: [contact.firstName, contact.lastName].filter(Boolean).join(" ") || null },
    })
  }

  await prisma.portalAccount.upsert({
    where: { contactId },
    create: {
      userId: user.id,
      contactId,
      kind: portalKind,
      enabled: true,
      invitedAt: new Date(),
    },
    update: {
      kind: portalKind,
      enabled: true,
      invitedAt: new Date(),
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "portal.invite",
      entityType: "Contact",
      entityId: contactId,
      payload: { email, kind: portalKind, actorRole: role },
    },
  })

  const redirectTo = portalKind === PortalKind.VENDOR ? "/portal/vendor" : "/portal/client"
  try {
    await signIn("email", { email, redirectTo, redirect: false })
  } catch {
    // signIn may throw redirect in some setups; invite still persisted
  }

  revalidatePath(`/admin/crm/contacts/${contactId}`)
  return { ok: true as const }
}
