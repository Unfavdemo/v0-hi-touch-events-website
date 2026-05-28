"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth/guard"

export async function createContactList(formData: FormData) {
  const { admin } = await requirePermission("lists.write")
  const name = String(formData.get("name") ?? "").trim()
  if (!name) throw new Error("List name is required.")

  const list = await prisma.contactList.create({
    data: {
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      createdById: admin.id,
    },
  })

  revalidatePath("/admin/lists")
  void list
}

export async function addContactToList(listId: string, contactId: string) {
  await requirePermission("lists.write")
  await prisma.contactListMember.upsert({
    where: { listId_contactId: { listId, contactId } },
    create: { listId, contactId },
    update: {},
  })
  revalidatePath(`/admin/lists/${listId}`)
  revalidatePath("/admin/lists")
}

export async function removeContactFromList(listId: string, contactId: string) {
  await requirePermission("lists.write")
  await prisma.contactListMember.delete({
    where: { listId_contactId: { listId, contactId } },
  })
  revalidatePath(`/admin/lists/${listId}`)
  revalidatePath("/admin/lists")
}

export async function deleteContactList(listId: string) {
  await requirePermission("lists.write")
  await prisma.contactList.delete({ where: { id: listId } })
  revalidatePath("/admin/lists")
}
