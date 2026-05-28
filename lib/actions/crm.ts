"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { ClientKind } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth/guard"

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function createHiTouchClient(formData: FormData) {
  await requirePermission("clients.write")
  const name = String(formData.get("name") ?? "").trim()
  const slugRaw = String(formData.get("slug") ?? "").trim()
  const slug = slugRaw ? slugify(slugRaw) : slugify(name)
  const kindRaw = String(formData.get("kind") ?? "NONPROFIT").toUpperCase()
  const kind = (["NONPROFIT", "CORPORATE", "OTHER"].includes(kindRaw) ? kindRaw : "NONPROFIT") as ClientKind
  const notes = String(formData.get("notes") ?? "").trim() || null
  if (!name || !slug) throw new Error("Name and slug are required.")
  await prisma.hiTouchClient.create({
    data: { name, slug, kind, notes },
  })
  revalidatePath("/admin/clients")
  revalidatePath("/admin/pending")
}

export async function updateHiTouchClient(id: string, formData: FormData) {
  await requirePermission("clients.write")
  const name = String(formData.get("name") ?? "").trim()
  const slug = slugify(String(formData.get("slug") ?? ""))
  const kindRaw = String(formData.get("kind") ?? "NONPROFIT").toUpperCase()
  const kind = (["NONPROFIT", "CORPORATE", "OTHER"].includes(kindRaw) ? kindRaw : "NONPROFIT") as ClientKind
  const notes = String(formData.get("notes") ?? "").trim() || null
  if (!name || !slug) throw new Error("Name and slug are required.")
  await prisma.hiTouchClient.update({
    where: { id },
    data: { name, slug, kind, notes },
  })
  revalidatePath("/admin/clients")
  revalidatePath(`/admin/clients/${id}`)
}

export async function createContact(formData: FormData) {
  await requirePermission("contacts.write")
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const firstName = String(formData.get("firstName") ?? "").trim() || null
  const lastName = String(formData.get("lastName") ?? "").trim() || null
  const phone = String(formData.get("phone") ?? "").trim() || null
  const title = String(formData.get("title") ?? "").trim() || null
  const companyIdRaw = String(formData.get("companyId") ?? "").trim()
  const companyId = companyIdRaw && companyIdRaw !== "__none__" ? companyIdRaw : null
  if (!email || !email.includes("@")) throw new Error("Valid email is required.")

  const contact = await prisma.contact.upsert({
    where: { email },
    create: { email, firstName, lastName, phone, title, companyId },
    update: { firstName, lastName, phone, title, companyId },
  })
  revalidatePath("/admin/crm/contacts")
  redirect(`/admin/crm/contacts/${contact.id}`)
}

export async function deleteContact(contactId: string) {
  await requirePermission("contact.delete")
  await prisma.contact.delete({ where: { id: contactId } })
  revalidatePath("/admin/crm/contacts")
  revalidatePath("/admin/crm/companies")
  redirect("/admin/crm/contacts")
}

export async function createCompany(formData: FormData) {
  await requirePermission("companies.write")
  const name = String(formData.get("name") ?? "").trim()
  const website = String(formData.get("website") ?? "").trim() || null
  const notes = String(formData.get("notes") ?? "").trim() || null
  if (!name) throw new Error("Company name is required.")
  const company = await prisma.company.create({
    data: { name, website, notes },
  })
  revalidatePath("/admin/crm/companies")
  redirect(`/admin/crm/companies/${company.id}`)
}

export async function updateCompany(id: string, formData: FormData) {
  await requirePermission("companies.write")
  const name = String(formData.get("name") ?? "").trim()
  const website = String(formData.get("website") ?? "").trim() || null
  const notes = String(formData.get("notes") ?? "").trim() || null
  if (!name) throw new Error("Company name is required.")
  await prisma.company.update({
    where: { id },
    data: { name, website, notes },
  })
  revalidatePath("/admin/crm/companies")
  revalidatePath(`/admin/crm/companies/${id}`)
}

export async function updateContactProfile(contactId: string, formData: FormData) {
  await requirePermission("contacts.write")
  const firstName = String(formData.get("firstName") ?? "").trim() || null
  const lastName = String(formData.get("lastName") ?? "").trim() || null
  const title = String(formData.get("title") ?? "").trim() || null
  const phone = String(formData.get("phone") ?? "").trim() || null
  const notes = String(formData.get("notes") ?? "").trim() || null
  const companyIdRaw = String(formData.get("companyId") ?? "").trim()
  const companyId = companyIdRaw && companyIdRaw !== "__none__" ? companyIdRaw : null

  await prisma.contact.update({
    where: { id: contactId },
    data: { firstName, lastName, title, phone, notes, companyId },
  })
  revalidatePath(`/admin/crm/contacts/${contactId}`)
  revalidatePath("/admin/crm/contacts")
  revalidatePath("/admin/crm/companies")
}

export async function tagContactHiTouchClient(contactId: string, hiTouchClientId: string) {
  await requirePermission("contacts.write")
  await prisma.contactHiTouchClient.upsert({
    where: {
      contactId_hiTouchClientId: { contactId, hiTouchClientId },
    },
    create: { contactId, hiTouchClientId },
    update: {},
  })
  revalidatePath(`/admin/crm/contacts/${contactId}`)
  revalidatePath("/admin/crm/contacts")
}

export async function untagContactHiTouchClient(contactId: string, hiTouchClientId: string) {
  await requirePermission("contacts.write")
  try {
    await prisma.contactHiTouchClient.delete({
      where: {
        contactId_hiTouchClientId: { contactId, hiTouchClientId },
      },
    })
  } catch {
    // ignore missing
  }
  revalidatePath(`/admin/crm/contacts/${contactId}`)
  revalidatePath("/admin/crm/contacts")
}

export async function tagCompanyHiTouchClient(companyId: string, hiTouchClientId: string) {
  await requirePermission("companies.write")
  await prisma.companyHiTouchClient.upsert({
    where: {
      companyId_hiTouchClientId: { companyId, hiTouchClientId },
    },
    create: { companyId, hiTouchClientId },
    update: {},
  })
  revalidatePath(`/admin/crm/companies/${companyId}`)
  revalidatePath("/admin/crm/companies")
}

export async function untagCompanyHiTouchClient(companyId: string, hiTouchClientId: string) {
  await requirePermission("companies.write")
  try {
    await prisma.companyHiTouchClient.delete({
      where: {
        companyId_hiTouchClientId: { companyId, hiTouchClientId },
      },
    })
  } catch {
    // ignore
  }
  revalidatePath(`/admin/crm/companies/${companyId}`)
  revalidatePath("/admin/crm/companies")
}

export async function addContactVendorSkill(contactId: string, categoryKey: string) {
  await requirePermission("contacts.write")
  const cat = await prisma.vendorSkillCategory.findUnique({ where: { key: categoryKey } })
  if (!cat) throw new Error("Unknown vendor category.")
  await prisma.contactVendorSkill.upsert({
    where: {
      contactId_categoryId: { contactId, categoryId: cat.id },
    },
    create: { contactId, categoryId: cat.id },
    update: {},
  })
  revalidatePath(`/admin/crm/contacts/${contactId}`)
}

export async function removeContactVendorSkill(contactId: string, categoryKey: string) {
  await requirePermission("contacts.write")
  const cat = await prisma.vendorSkillCategory.findUnique({ where: { key: categoryKey } })
  if (!cat) return
  try {
    await prisma.contactVendorSkill.delete({
      where: {
        contactId_categoryId: { contactId, categoryId: cat.id },
      },
    })
  } catch {
    // ignore
  }
  revalidatePath(`/admin/crm/contacts/${contactId}`)
}
