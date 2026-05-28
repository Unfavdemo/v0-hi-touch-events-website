import { PortalShell } from "@/components/portal/portal-shell"
import { requirePortalSession } from "@/lib/portal-route-guard"

export const dynamic = "force-dynamic"

export default async function PortalDashboardLayout({ children }: { children: React.ReactNode }) {
  const { portal, contact } = await requirePortalSession()

  return (
    <PortalShell kind={portal.kind} contactEmail={contact.email}>
      {children}
    </PortalShell>
  )
}
