"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth/guard"
import { DEFAULT_VENDOR_REVIEWER_NAME } from "@/lib/reviews/vendor-review"

function parseRating(raw: string): number {
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 1 || n > 5) throw new Error("Rating must be between 1 and 5.")
  return n
}

export async function createVendorReview(contactId: string, formData: FormData) {
  const { admin } = await requirePermission("vendor_review.create")
  const rating = parseRating(String(formData.get("rating") ?? ""))
  const headline = String(formData.get("headline") ?? "").trim() || null
  const body = String(formData.get("body") ?? "").trim()
  const internalNotes = String(formData.get("internalNotes") ?? "").trim() || null
  const reviewerName = String(formData.get("reviewerName") ?? "").trim() || DEFAULT_VENDOR_REVIEWER_NAME
  const projectId = String(formData.get("projectId") ?? "").trim() || null
  const hiTouchClientId = String(formData.get("hiTouchClientId") ?? "").trim() || null
  const eventDateRaw = String(formData.get("eventDate") ?? "").trim()
  const eventDate = eventDateRaw ? new Date(eventDateRaw) : null
  if (!body) throw new Error("Public review text is required.")

  await prisma.vendorReview.create({
    data: {
      contactId,
      rating,
      headline,
      body,
      internalNotes,
      reviewerName,
      projectId,
      hiTouchClientId,
      eventDate: eventDate && !Number.isNaN(eventDate.getTime()) ? eventDate : null,
      createdById: admin.id,
    },
  })

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { companyId: true },
  })
  revalidatePath(`/admin/crm/contacts/${contactId}`)
  if (contact?.companyId) {
    revalidatePath(`/admin/crm/companies/${contact.companyId}`)
  }
}

export async function deleteVendorReview(reviewId: string) {
  await requirePermission("vendor_review.delete")

  const review = await prisma.vendorReview.findUnique({
    where: { id: reviewId },
    select: { contactId: true, contact: { select: { companyId: true } } },
  })
  if (!review) return

  await prisma.vendorReview.delete({ where: { id: reviewId } })
  revalidatePath(`/admin/crm/contacts/${review.contactId}`)
  if (review.contact.companyId) {
    revalidatePath(`/admin/crm/companies/${review.contact.companyId}`)
  }
}
