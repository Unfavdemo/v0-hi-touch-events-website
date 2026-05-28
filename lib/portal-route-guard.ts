import { redirect } from "next/navigation"
import { PortalKind } from "@/lib/generated/prisma/client"
import { getSessionSafe } from "@/lib/auth-session"
import { prisma } from "@/lib/prisma"

export async function requirePortalSession(expectedKind?: PortalKind) {
  const session = await getSessionSafe()
  if (!session?.portal?.contactId) {
    redirect("/portal/login")
  }

  const portal = await prisma.portalAccount.findFirst({
    where: {
      contactId: session.portal.contactId,
      enabled: true,
      ...(expectedKind ? { kind: expectedKind } : {}),
    },
    include: { contact: { include: { company: true } } },
  })

  if (!portal) redirect("/portal/login")

  return { session, portal, contact: portal.contact }
}
