import { redirect } from "next/navigation"
import type { Session } from "next-auth"
import { can, permissionForAdminPath } from "@/lib/auth/permissions"
import { normalizeAdminRole, type AdminRoleName } from "@/lib/auth/roles"
import { getSessionSafe } from "@/lib/auth-session"
import { prisma } from "@/lib/prisma"

async function resolveAdminRoleFromSession(session: Session): Promise<AdminRoleName> {
  let role: AdminRoleName = session.adminRole ? normalizeAdminRole(session.adminRole) : "COORDINATOR"
  if (!session.adminRole && process.env.DATABASE_URL && session.user?.id) {
    const admin = await prisma.adminUser.findUnique({
      where: { userId: session.user.id },
      select: { role: true },
    })
    if (admin) role = normalizeAdminRole(admin.role)
  }
  return role
}

/** Resolved admin role for the signed-in user, or `null` if not an admin session. */
export async function resolveAdminRoleForSession(): Promise<AdminRoleName | null> {
  const session = await getSessionSafe()
  if (!session?.isAdmin || !session.user?.id) return null
  return resolveAdminRoleFromSession(session)
}

export async function getAdminLayoutContext(pathname: string) {
  const session = await getSessionSafe()
  if (!session?.isAdmin || !session.user?.id) {
    redirect("/admin/login")
  }

  const role = await resolveAdminRoleFromSession(session)

  const required = permissionForAdminPath(pathname)
  if (required && !can(role, required)) {
    redirect("/admin")
  }

  return { session, role }
}
