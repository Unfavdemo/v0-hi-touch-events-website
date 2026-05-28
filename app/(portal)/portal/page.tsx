import { redirect } from "next/navigation"
import { PortalKind } from "@/lib/generated/prisma/client"
import { getSessionSafe } from "@/lib/auth-session"

export default async function PortalIndexPage() {
  const session = await getSessionSafe()
  if (!session?.portal) {
    redirect("/portal/login")
  }
  if (session.portal.kind === PortalKind.VENDOR) {
    redirect("/portal/vendor")
  }
  redirect("/portal/client")
}
