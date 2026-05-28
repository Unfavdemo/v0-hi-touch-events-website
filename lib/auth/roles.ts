export type AdminRoleName = "COORDINATOR" | "SUPERADMIN"

/** Maps legacy ADMIN enum value to COORDINATOR */
export function normalizeAdminRole(role: string): AdminRoleName {
  if (role === "ADMIN" || role === "COORDINATOR") return "COORDINATOR"
  return "SUPERADMIN"
}
