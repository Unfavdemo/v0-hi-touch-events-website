import { getSessionSafe } from "@/lib/auth-session"
import { prisma } from "@/lib/prisma"
import { canAccessAdminEmail } from "@/lib/auth/allowlist"
import { AdminRole } from "@/lib/generated/prisma/client"
import type { Permission } from "@/lib/auth/permissions"
import { can } from "@/lib/auth/permissions"
import { normalizeAdminRole, type AdminRoleName } from "@/lib/auth/roles"

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthError"
  }
}

export async function requireAdmin() {
  const session = await getSessionSafe()
  if (!session?.user?.id || !session.isAdmin) {
    throw new AuthError("Unauthorized")
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { adminProfile: true },
  })
  if (!user?.email || !canAccessAdminEmail(user.email) || !user.adminProfile) {
    throw new AuthError("Forbidden")
  }
  const role = normalizeAdminRole(user.adminProfile.role)
  return { session, user, admin: user.adminProfile, role }
}

export async function requirePermission(permission: Permission) {
  const ctx = await requireAdmin()
  if (!can(ctx.role, permission)) {
    throw new AuthError("Forbidden")
  }
  return ctx
}

export async function requireSuperAdmin() {
  const ctx = await requireAdmin()
  if (ctx.role !== "SUPERADMIN") {
    throw new AuthError("Superadmin required")
  }
  return ctx
}

export async function requirePortal() {
  const session = await getSessionSafe()
  if (!session?.portal?.contactId) {
    throw new AuthError("Unauthorized")
  }
  const portal = await prisma.portalAccount.findFirst({
    where: {
      contactId: session.portal.contactId,
      enabled: true,
      kind: session.portal.kind,
    },
    include: { contact: true },
  })
  if (!portal) throw new AuthError("Forbidden")
  return { session, portal, contact: portal.contact }
}

export async function getAdminRoleFromSession(): Promise<AdminRoleName | null> {
  const session = await getSessionSafe()
  if (!session?.isAdmin || !session.adminRole) return null
  return normalizeAdminRole(session.adminRole)
}
