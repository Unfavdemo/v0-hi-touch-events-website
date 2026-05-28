export const DEFAULT_VENDOR_REVIEWER_NAME = "HiTouch Events"

export type PublicVendorReview = {
  id: string
  rating: number
  headline: string | null
  body: string
  reviewerName: string
  createdAt: Date
  eventDate?: Date | null
  projectName?: string | null
  clientName?: string | null
}

export function resolveReviewerName(name: string | null | undefined): string {
  const trimmed = name?.trim()
  return trimmed || DEFAULT_VENDOR_REVIEWER_NAME
}

export function reviewerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "H"
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase()
  return `${parts[0]!.slice(0, 1)}${parts[parts.length - 1]!.slice(0, 1)}`.toUpperCase()
}

export function formatReviewAge(date: Date): string {
  const ms = Date.now() - date.getTime()
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  if (days < 1) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" })
}
