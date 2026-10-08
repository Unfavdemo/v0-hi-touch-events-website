const LABELS: Record<string, string> = {
  // Roles
  ADMIN: "Admin",
  SUPER: "Full admin",
  EVENT: "Opportunity admin",
  PARTNER: "Partner",
  FREELANCER: "Vendor",
  // Account status
  PENDING: "Under review",
  APPROVED: "Approved",
  REJECTED: "Not approved",
  SUSPENDED: "Suspended",
  // Profile type
  INDIVIDUAL: "Individual",
  BUSINESS: "Business",
  // Membership
  STANDARD: "Standard",
  PRO: "Pro",
  BETA_FREE: "Free beta",
  INCOMPLETE: "Payment not finished",
  TRIALING: "Free trial",
  ACTIVE: "Active",
  PAST_DUE: "Payment overdue",
  CANCELED: "Canceled",
  // Opportunities
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending approval",
  FILLED: "Filled",
  COMPLETED: "Completed",
  // Applications
  SUBMITTED: "Under review",
  ACCEPTED: "Hired",
  DECLINED: "Not selected",
  // Notifications
  RATING_WARNING: "Rating alert",
  DISMISSAL_NOTICE: "Account notice",
  APPLICATION_UPDATE: "Application",
  JOB_ALERT: "Opportunity update",
  EVENT_APPROVED: "Opportunity approved",
  NEW_APPLICANT: "New applicant",
  VENDOR_WITHDREW: "Vendor declined",
  EVENT_REMINDER: "Coming up",
  REVIEW_NEEDED: "Review needed",
  ANNOUNCEMENT: "Announcement",
  MESSAGE: "Message",
  VENDOR_ARRIVED: "On site",
  VENDOR_WRAPPED: "Wrapped",
  TEAM_ADDED: "Team",
  EVENT_OUTREACH: "Event opportunity",
  APPLICATION_CLOSE_REMINDER: "Apply by deadline",
  EVENT_DETAILS: "Event details",
  COORDINATOR: "Coordinator",
  OWNER: "Owner",
  NO_SHOW: "No-show",
  COMPLAINT: "Complaint",
  DAMAGE: "Damage",
  SSN: "SSN",
  EIN: "EIN",
  // Payments
  PAID: "Paid",
  PROCESSING: "Processing",
  SCHEDULED: "Scheduled",
  ON_HOLD: "On hold",
  DIRECT_DEPOSIT: "Direct deposit",
  CHECK: "Paper check",
  ACH: "Bank transfer",
  CARD: "Card",
  CASH: "Cash",
  OTHER: "Other",
};

/** Human-friendly text for any status/enum value shown in the UI. */
export function label(value: string): string {
  if (LABELS[value]) return LABELS[value];
  const words = value.toLowerCase().replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const REVIEWER_TYPE_LABELS: Record<string, string> = {
  INTERNAL_ADMIN: "HiTouch Solutions Admin",
  CLIENT_PARTNER: "Client partner",
  HIRED_VENDOR: "Hired vendor",
};

export function reviewerTypeLabel(type: string): string {
  return REVIEWER_TYPE_LABELS[type] ?? label(type);
}

const isoDayFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats a `YYYY-MM-DD` string (e.g. from payroll) as "Fri, Sep 27, 2026". */
export function formatIsoDay(value: string | null): string {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : isoDayFmt.format(date);
}
