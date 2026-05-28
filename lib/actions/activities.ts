"use server"

import { revalidatePath } from "next/cache"
import { ActivityKind } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth/guard"

const KINDS = ["NOTE", "CALL", "EMAIL", "MEETING", "SYSTEM"] as const

export async function createContactActivity(contactId: string, formData: FormData) {
  const { admin } = await requirePermission("contacts.write")
  const body = String(formData.get("body") ?? "").trim()
  const kindRaw = String(formData.get("kind") ?? "NOTE").toUpperCase()
  const kind = (KINDS.includes(kindRaw as (typeof KINDS)[number])
    ? kindRaw
    : "NOTE") as ActivityKind
  if (!body) throw new Error("Activity body is required.")

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { companyId: true },
  })
  if (!contact) throw new Error("Contact not found.")

  await prisma.contactActivity.create({
    data: {
      contactId,
      companyId: contact.companyId,
      kind,
      body,
      createdById: admin.id,
    },
  })

  revalidatePath(`/admin/crm/contacts/${contactId}`)
  if (contact.companyId) {
    revalidatePath(`/admin/crm/companies/${contact.companyId}`)
  }
}
