import { normalizeAdminRole } from "@/lib/auth/roles"

export const PERMISSIONS = [
  "pending.read",
  "pending.approve",
  "contacts.read",
  "contacts.write",
  "companies.read",
  "companies.write",
  "clients.read",
  "clients.write",
  "projects.read",
  "projects.write",
  "projects.broadcast",
  "projects.winner",
  "notifications.read",
  "notifications.write",
  "case_studies.read",
  "case_studies.write",
  "audit.read",
  "audit.purge",
  "contact.delete",
  "vendor_review.create",
  "vendor_review.delete",
  "admin.users.manage",
  "portal.invite",
  "deals.read",
  "deals.write",
  "tasks.read",
  "tasks.write",
  "lists.read",
  "lists.write",
] as const

export type Permission = (typeof PERMISSIONS)[number]

export type AdminRoleName = "COORDINATOR" | "SUPERADMIN"

const COORDINATOR_PERMISSIONS = new Set<Permission>([
  "pending.read",
  "contacts.read",
  "contacts.write",
  "companies.read",
  "companies.write",
  "projects.read",
  "projects.write",
  "projects.broadcast",
  "projects.winner",
  "notifications.read",
  "notifications.write",
  "case_studies.read",
  "case_studies.write",
  "audit.read",
  "vendor_review.create",
  "portal.invite",
  "clients.read",
  "clients.write",
  "deals.read",
  "deals.write",
  "tasks.read",
  "tasks.write",
  "lists.read",
  "lists.write",
])

export function can(role: AdminRoleName | string, permission: Permission): boolean {
  const normalized = normalizeAdminRole(role) as AdminRoleName
  if (normalized === "SUPERADMIN") return true
  return COORDINATOR_PERMISSIONS.has(permission)
}

export function roleLabel(role: AdminRoleName | string): string {
  const normalized = normalizeAdminRole(role) as AdminRoleName
  return normalized === "SUPERADMIN" ? "Master Admin" : "Event Coordinator"
}

/** Route prefix → permission required to read the section */
export const ADMIN_ROUTE_PERMISSIONS: { prefix: string; permission: Permission }[] = [
  { prefix: "/admin/pending", permission: "pending.read" },
  { prefix: "/admin/crm", permission: "contacts.read" },
  { prefix: "/admin/deals", permission: "deals.read" },
  { prefix: "/admin/tasks", permission: "tasks.read" },
  { prefix: "/admin/lists", permission: "lists.read" },
  { prefix: "/admin/clients", permission: "clients.read" },
  { prefix: "/admin/projects", permission: "projects.read" },
  { prefix: "/admin/case-studies", permission: "case_studies.read" },
  { prefix: "/admin/notifications", permission: "notifications.read" },
  { prefix: "/admin/audit", permission: "audit.read" },
  { prefix: "/admin/settings", permission: "admin.users.manage" },
]

export function permissionForAdminPath(pathname: string): Permission | null {
  if (pathname === "/admin" || pathname === "/admin/") return null
  for (const { prefix, permission } of ADMIN_ROUTE_PERMISSIONS) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return permission
  }
  return null
}
