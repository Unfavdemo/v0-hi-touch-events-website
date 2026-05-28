import { prisma } from "@/lib/prisma"

export type TimelineItem = {
  id: string
  source: "activity" | "audit" | "email" | "review"
  occurredAt: Date
  title: string
  body: string | null
  meta?: Record<string, unknown>
}

export async function getCompanyTimeline(
  companyId: string,
  options?: { hiTouchClientId?: string; limit?: number }
): Promise<TimelineItem[]> {
  const limit = options?.limit ?? 100
  const clientFilter = options?.hiTouchClientId

  const contacts = await prisma.contact.findMany({
    where: { companyId },
    select: { id: true },
  })
  const contactIds = contacts.map((c) => c.id)
  if (contactIds.length === 0) return []

  const contactClientFilter = clientFilter
    ? { contactId: { in: contactIds }, hiTouchClientId: clientFilter }
    : { contactId: { in: contactIds } }

  const [activities, audits, reviews, engagements] = await Promise.all([
    prisma.contactActivity.findMany({
      where: { companyId },
      orderBy: { occurredAt: "desc" },
      take: limit,
      include: { contact: true, createdBy: { include: { user: true } } },
    }),
    prisma.auditLog.findMany({
      where: {
        OR: [
          { entityType: "Company", entityId: companyId },
          { entityType: "Contact", entityId: { in: contactIds } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { actor: { include: { user: true } } },
    }),
    prisma.vendorReview.findMany({
      where: {
        contactId: { in: contactIds },
        ...(clientFilter ? { hiTouchClientId: clientFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { contact: true, project: true },
    }),
    prisma.vendorEngagement.findMany({
      where: {
        contactId: { in: contactIds },
        ...(clientFilter
          ? {
              contact: {
                clientTags: { some: { hiTouchClientId: clientFilter } },
              },
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        contact: true,
        broadcast: { include: { project: true } },
        messages: {
          include: { events: { orderBy: { occurredAt: "desc" }, take: 3 } },
        },
      },
    }),
  ])

  const items: TimelineItem[] = []

  for (const a of activities) {
    items.push({
      id: `activity-${a.id}`,
      source: "activity",
      occurredAt: a.occurredAt,
      title: `${a.kind} · ${[a.contact.firstName, a.contact.lastName].filter(Boolean).join(" ") || a.contact.email}`,
      body: a.body,
      meta: {
        contactId: a.contactId,
        createdBy: a.createdBy?.user.email,
      },
    })
  }

  for (const a of audits) {
    items.push({
      id: `audit-${a.id}`,
      source: "audit",
      occurredAt: a.createdAt,
      title: a.action,
      body: a.actor.user.email ?? null,
      meta: { entityType: a.entityType, entityId: a.entityId },
    })
  }

  for (const r of reviews) {
    items.push({
      id: `review-${r.id}`,
      source: "review",
      occurredAt: r.createdAt,
      title: `Vendor review · ${r.rating}/5`,
      body: r.headline ? `${r.headline}\n${r.body}` : r.body,
      meta: {
        contactId: r.contactId,
        projectId: r.projectId,
        internalNotes: r.internalNotes ?? undefined,
      },
    })
  }

  for (const e of engagements) {
    for (const m of e.messages) {
      for (const ev of m.events) {
        items.push({
          id: `email-${ev.id}`,
          source: "email",
          occurredAt: ev.occurredAt,
          title: `${ev.type} · ${e.broadcast.project.name}`,
          body: e.contact.email,
          meta: { engagementId: e.id, status: e.status },
        })
      }
    }
  }

  items.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
  return items.slice(0, limit)
}
