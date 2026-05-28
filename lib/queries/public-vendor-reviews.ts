import { prisma } from "@/lib/prisma"
import { resolveReviewerName, type PublicVendorReview } from "@/lib/reviews/vendor-review"

const publicSelect = {
  id: true,
  rating: true,
  headline: true,
  body: true,
  reviewerName: true,
  eventDate: true,
  createdAt: true,
  project: { select: { name: true } },
  hiTouchClient: { select: { name: true } },
} as const

function toPublicReview(r: {
  id: string
  rating: number
  headline: string | null
  body: string
  reviewerName: string | null
  eventDate: Date | null
  createdAt: Date
  project: { name: string } | null
  hiTouchClient: { name: string } | null
}): PublicVendorReview {
  return {
    id: r.id,
    rating: r.rating,
    headline: r.headline,
    body: r.body,
    reviewerName: resolveReviewerName(r.reviewerName),
    eventDate: r.eventDate,
    createdAt: r.createdAt,
    projectName: r.project?.name ?? null,
    clientName: r.hiTouchClient?.name ?? null,
  }
}

/** Public review fields only — never includes internalNotes. */
export async function getPublicVendorReviewsForContact(contactId: string): Promise<PublicVendorReview[]> {
  const rows = await prisma.vendorReview.findMany({
    where: { contactId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: publicSelect,
  })
  return rows.map(toPublicReview)
}
