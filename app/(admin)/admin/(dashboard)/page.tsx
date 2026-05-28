import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { resolveAdminRoleForSession } from "@/lib/admin-route-guard"
import { getSessionSafe } from "@/lib/auth-session"
import { CoordinatorHome } from "@/components/admin/dashboards/coordinator-home"
import { SuperAdminHome } from "@/components/admin/dashboards/superadmin-home"
import { getCoordinatorDashboard } from "@/lib/queries/coordinator-dashboard"
import { getSuperAdminDashboard } from "@/lib/queries/superadmin-dashboard"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const role = await resolveAdminRoleForSession()
  const title =
    role === "SUPERADMIN"
      ? "Command center | HiTouch CRM"
      : role === "COORDINATOR"
        ? "My dashboard | HiTouch CRM"
        : "Home | HiTouch CRM"
  return { title, robots: { index: false, follow: false } }
}

export default async function AdminHomePage() {
  const [session, role] = await Promise.all([getSessionSafe(), resolveAdminRoleForSession()])
  if (!role || !session?.user?.id) {
    redirect("/admin/login")
  }

  if (!process.env.DATABASE_URL) {
    return role === "SUPERADMIN" ? <SuperAdminHome data={null} /> : <CoordinatorHome data={null} />
  }

  try {
    if (role === "SUPERADMIN") {
      const data = await getSuperAdminDashboard()
      return <SuperAdminHome data={data} />
    }
    const data = await getCoordinatorDashboard(session.user.id)
    return <CoordinatorHome data={data} />
  } catch {
    return role === "SUPERADMIN" ? <SuperAdminHome data={null} /> : <CoordinatorHome data={null} />
  }
}
