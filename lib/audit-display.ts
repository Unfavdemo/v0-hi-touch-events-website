export const AUDIT_ACTION_OPTIONS = [
  { value: "", label: "All actions" },
  { value: "pending.approve", label: "Intake approved" },
  { value: "pending.decline", label: "Intake declined" },
  { value: "pending.spam", label: "Intake spam" },
  { value: "case_study.create", label: "Case study created" },
  { value: "case_study.update", label: "Case study updated" },
  { value: "vendor.broadcast", label: "Vendor broadcast" },
  { value: "vendor.select_winner", label: "Vendor winner" },
  { value: "portal.invite", label: "Portal invite" },
  { value: "admin.role_update", label: "Admin role change" },
] as const

export function formatAuditAction(action: string): string {
  const labels: Record<string, string> = {
    "pending.approve": "Intake approved",
    "pending.decline": "Intake declined",
    "pending.spam": "Intake marked spam",
    "case_study.create": "Case study created",
    "case_study.update": "Case study updated",
    "vendor.broadcast": "Vendor broadcast sent",
    "vendor.select_winner": "Vendor winner selected",
    "portal.invite": "Portal invite sent",
    "admin.role_update": "Admin role updated",
  }
  return labels[action] ?? action
}

export function auditEntityLink(
  entityType: string,
  entityId: string,
  payload: unknown
): string | null {
  const p = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null

  switch (entityType) {
    case "Contact":
      return `/admin/crm/contacts/${entityId}`
    case "PendingSubmission":
      return "/admin/pending"
    case "CaseStudy": {
      const slug = typeof p?.slug === "string" ? p.slug : null
      return slug ? `/admin/case-studies/${slug}` : "/admin/case-studies"
    }
    case "VendorBroadcast": {
      const projectId = typeof p?.projectId === "string" ? p.projectId : null
      return projectId ? `/admin/projects/${projectId}` : "/admin/projects"
    }
    default:
      return null
  }
}
