import { prisma } from "@/lib/prisma"
import { buildProposalToken } from "@/lib/proposal-token"

export async function getVendorPortalInbox(contactId: string) {
  const engagements = await prisma.vendorEngagement.findMany({
    where: { contactId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      broadcast: {
        include: {
          project: { select: { name: true } },
          category: { select: { label: true } },
        },
      },
    },
  })

  return engagements.map((e) => ({
    id: e.id,
    status: e.status,
    lastOpenedAt: e.lastOpenedAt,
    lastReplyAt: e.lastReplyAt,
    createdAt: e.createdAt,
    subject: e.broadcast.subject,
    projectName: e.broadcast.project.name,
    categoryLabel: e.broadcast.category.label,
    proposalToken: buildProposalToken(e.id),
  }))
}

