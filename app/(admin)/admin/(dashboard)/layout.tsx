import { headers } from "next/headers"
import { AdminShell } from "@/components/admin/admin-shell"
import { getAdminLayoutContext } from "@/lib/admin-route-guard"

export const dynamic = "force-dynamic"

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") ?? "/admin"
  const { session, role } = await getAdminLayoutContext(pathname)

  return <AdminShell userEmail={session.user?.email} adminRole={role}>{children}</AdminShell>
}
