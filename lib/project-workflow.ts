import type { EventProjectStatus, VendorEngagementStatus } from "@/lib/generated/prisma/client"

export {
  PROJECT_WORKFLOW_STEPS as PROJECT_STEPS,
  parseWorkflowStep,
} from "@/lib/crm/workflows"

export type ProjectStepId = (typeof import("@/lib/crm/workflows").PROJECT_WORKFLOW_STEPS)[number]["id"]

export const PROJECT_STATUS_LABELS: Record<EventProjectStatus, string> = {
  DRAFT: "Draft",
  PLANNING: "Planning",
  ACTIVE: "In progress",
  COMPLETED: "Completed",
}

export const ENGAGEMENT_STATUS_LABELS: Record<VendorEngagementStatus, string> = {
  QUEUED: "Queued",
  SENT: "Email sent",
  DELIVERED: "Delivered",
  OPENED: "Opened email",
  REPLIED: "Responded",
  DECLINED_BY_ADMIN: "Declined",
  NOT_SELECTED: "Not selected",
  SELECTED_WINNER: "Selected",
  BOUNCE: "Bounced",
  COMPLAINT: "Complaint",
}

export function engagementStatusTone(status: VendorEngagementStatus): "neutral" | "good" | "warn" | "bad" {
  switch (status) {
    case "SELECTED_WINNER":
    case "REPLIED":
      return "good"
    case "OPENED":
    case "DELIVERED":
      return "neutral"
    case "SENT":
    case "QUEUED":
      return "warn"
    case "BOUNCE":
    case "COMPLAINT":
    case "DECLINED_BY_ADMIN":
      return "bad"
    default:
      return "neutral"
  }
}

export function formatContactName(parts: {
  email: string
  firstName?: string | null
  lastName?: string | null
  companyName?: string | null
}) {
  const name = [parts.firstName, parts.lastName].filter(Boolean).join(" ")
  if (name) return name
  if (parts.companyName) return parts.companyName
  return parts.email
}
