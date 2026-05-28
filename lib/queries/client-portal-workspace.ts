import { prisma } from "@/lib/prisma"

export async function getClientPortalWorkspaces(contactId: string) {
  const tags = await prisma.contactHiTouchClient.findMany({
    where: { contactId },
    include: { hiTouchClient: true },
    orderBy: { hiTouchClient: { name: "asc" } },
  })
  return tags.map((t) => ({
    id: t.hiTouchClientId,
    name: t.hiTouchClient.name,
    slug: t.hiTouchClient.slug,
    isPrimary: t.isPrimary,
  }))
}

export async function getClientPortalWorkspace(contactId: string, hiTouchClientId: string) {
  const allowed = await prisma.contactHiTouchClient.findUnique({
    where: {
      contactId_hiTouchClientId: { contactId, hiTouchClientId },
    },
  })
  if (!allowed) return null

  const me = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      company: true,
      clientTags: { include: { hiTouchClient: true } },
    },
  })
  if (!me) return null

  const relatedContacts =
    me.companyId != null
      ? await prisma.contact.findMany({
          where: {
            companyId: me.companyId,
            id: { not: contactId },
            clientTags: { some: { hiTouchClientId } },
          },
          include: { clientTags: { include: { hiTouchClient: true } } },
          orderBy: { email: "asc" },
        })
      : []

  const [projects, hiTouchClient] = await Promise.all([
    prisma.eventProject.findMany({
      where: { hiTouchClientId },
      orderBy: { startsAt: "desc" },
      take: 20,
      select: { id: true, name: true, startsAt: true, endsAt: true },
    }),
    prisma.hiTouchClient.findUnique({ where: { id: hiTouchClientId } }),
  ])

  return {
    hiTouchClient,
    me,
    company: me.company,
    relatedContacts,
    projects,
  }
}
