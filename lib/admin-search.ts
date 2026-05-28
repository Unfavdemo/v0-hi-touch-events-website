import type { Prisma } from "@/lib/generated/prisma/client"

/** Trimmed query, or undefined if empty / too short. */
export function normalizeAdminQuery(raw?: string | null): string | undefined {
  const q = raw?.trim()
  if (!q || q.length < 2) return undefined
  return q
}

export function intakeSearchWhere(q: string): Prisma.PendingSubmissionWhereInput {
  return {
    OR: [
      { fullName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { organization: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ],
  }
}

export function caseStudySearchWhere(q: string): Prisma.CaseStudyWhereInput {
  return {
    OR: [
      { title: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { listDescription: { contains: q, mode: "insensitive" } },
    ],
  }
}

export function contactSearchWhere(q: string): Prisma.ContactWhereInput {
  return {
    OR: [
      { email: { contains: q, mode: "insensitive" } },
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { company: { name: { contains: q, mode: "insensitive" } } },
    ],
  }
}

export function companySearchWhere(q: string): Prisma.CompanyWhereInput {
  return {
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { website: { contains: q, mode: "insensitive" } },
      { notes: { contains: q, mode: "insensitive" } },
    ],
  }
}

export function hiTouchClientSearchWhere(q: string): Prisma.HiTouchClientWhereInput {
  return {
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { notes: { contains: q, mode: "insensitive" } },
    ],
  }
}

export function auditSearchWhere(q: string): Prisma.AuditLogWhereInput {
  return {
    OR: [
      { action: { contains: q, mode: "insensitive" } },
      { entityType: { contains: q, mode: "insensitive" } },
      { entityId: { contains: q, mode: "insensitive" } },
      { actor: { user: { email: { contains: q, mode: "insensitive" } } } },
      { actor: { user: { name: { contains: q, mode: "insensitive" } } } },
    ],
  }
}

export function eventProjectSearchWhere(q: string): Prisma.EventProjectWhereInput {
  return {
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { notes: { contains: q, mode: "insensitive" } },
      { hiTouchClient: { name: { contains: q, mode: "insensitive" } } },
    ],
  }
}

export function notificationSearchWhere(q: string): Prisma.AdminNotificationWhereInput {
  return {
    OR: [
      { type: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { body: { contains: q, mode: "insensitive" } },
    ],
  }
}

export function hasActiveFilters(params: Record<string, string | undefined>): boolean {
  return Object.values(params).some((v) => v != null && v !== "")
}
