/** Guided step definitions for CRM detail and list pages. */

export type WorkflowStep = {
  id: string
  label: string
  hint: string
}

export const PROJECT_WORKFLOW_STEPS: WorkflowStep[] = [
  { id: "details", label: "1. Event details", hint: "Name, client, when & where" },
  { id: "budget", label: "2. Budget", hint: "Total budget for this event" },
  { id: "broadcast", label: "3. Email vendors", hint: "Send the opportunity" },
  { id: "vendors", label: "4. Pick a vendor", hint: "See who opened & replied" },
  { id: "files", label: "5. Files", hint: "Contracts & moodboards" },
  { id: "activity", label: "6. Activity", hint: "What happened & when" },
]

export const CONTACT_WORKFLOW_STEPS: WorkflowStep[] = [
  { id: "profile", label: "1. Profile", hint: "Name, company, phone" },
  { id: "portal", label: "2. Portal", hint: "Client or vendor login" },
  { id: "activity", label: "3. Activity", hint: "Calls, emails, notes" },
  { id: "reviews", label: "4. Reviews", hint: "Performance ratings" },
  { id: "tags", label: "5. Client tags", hint: "Which accounts they belong to" },
  { id: "skills", label: "6. Vendor skills", hint: "For project email blasts" },
]

export const COMPANY_WORKFLOW_STEPS: WorkflowStep[] = [
  { id: "profile", label: "1. Company info", hint: "Name, website, notes" },
  { id: "tags", label: "2. Client tags", hint: "HiTouch accounts" },
  { id: "contacts", label: "3. People", hint: "Contacts at this company" },
  { id: "timeline", label: "4. Timeline", hint: "All activity in one place" },
]

export const CLIENT_WORKFLOW_STEPS: WorkflowStep[] = [
  { id: "profile", label: "1. Client profile", hint: "Name, type, notes" },
  { id: "links", label: "2. Linked records", hint: "Projects & pipeline" },
]

export const DEAL_WORKFLOW_STEPS: WorkflowStep[] = [
  { id: "deal", label: "1. Deal details", hint: "Stage, amount, close date" },
  { id: "links", label: "2. Related records", hint: "Contact, company, project" },
  { id: "tasks", label: "3. Follow-ups", hint: "Tasks on this deal" },
]

export const LIST_WORKFLOW_STEPS: WorkflowStep[] = [
  { id: "add", label: "1. Add people", hint: "Find contacts to add" },
  { id: "members", label: "2. Members", hint: "Everyone on this list" },
]

export const PENDING_WORKFLOW_STEPS: WorkflowStep[] = [
  { id: "queue", label: "1. Review queue", hint: "Approve or decline" },
  { id: "history", label: "2. History", hint: "Past decisions" },
]

/** List-page “getting started” rails (no `?step=` on detail). */
export type ListGuideStep = {
  id: string
  label: string
  hint: string
  href: string
}

export const CONTACTS_LIST_GUIDE: ListGuideStep[] = [
  { id: "add", label: "Add contacts", hint: "Create or import people", href: "#add-contact" },
  { id: "open", label: "Open a record", hint: "Profile, tags, vendor skills", href: "#contacts-list" },
  { id: "projects", label: "Use in a project", hint: "Email vendors from Projects", href: "/admin/projects" },
]

export const COMPANIES_LIST_GUIDE: ListGuideStep[] = [
  { id: "create", label: "Add company", hint: "Name & website", href: "#add-company" },
  { id: "tag", label: "Tag clients", hint: "On the company page", href: "#companies-list" },
  { id: "people", label: "Link contacts", hint: "Assign people to the company", href: "/admin/crm/contacts" },
]

export const CLIENTS_LIST_GUIDE: ListGuideStep[] = [
  { id: "create", label: "Add HiTouch client", hint: "Nonprofit or corporate account", href: "#add-client" },
  { id: "tag", label: "Tag contacts", hint: "On each contact record", href: "/admin/crm/contacts" },
]

export const DEALS_LIST_GUIDE: ListGuideStep[] = [
  { id: "create", label: "Create a deal", hint: "Name & stage", href: "#add-deal" },
  { id: "pipeline", label: "Move the pipeline", hint: "Drag cards by stage", href: "#pipeline" },
  { id: "tasks", label: "Add follow-ups", hint: "Tasks linked to deals", href: "/admin/tasks" },
]

export const LISTS_LIST_GUIDE: ListGuideStep[] = [
  { id: "create", label: "Create a list", hint: "Segment for campaigns", href: "#add-list" },
  { id: "members", label: "Add members", hint: "On the list page", href: "#lists" },
]

export const TASKS_LIST_GUIDE: ListGuideStep[] = [
  { id: "create", label: "Add a task", hint: "Due date & priority", href: "#add-task" },
  { id: "filter", label: "Work your queue", hint: "Today, overdue, done", href: "#task-list" },
  { id: "deals", label: "Tie to deals", hint: "Link from deal page", href: "/admin/deals" },
]

export const PROJECTS_LIST_GUIDE: ListGuideStep[] = [
  { id: "create", label: "Create project", hint: "Event name & dates", href: "/admin/projects/new" },
  { id: "broadcast", label: "Email vendors", hint: "Step 3 in the project", href: "/admin/projects" },
  { id: "winner", label: "Pick a winner", hint: "Step 4 — track opens", href: "/admin/projects" },
]

export const PENDING_LIST_GUIDE: ListGuideStep[] = [
  { id: "queue", label: "Review queue", hint: "Approve or decline", href: "/admin/pending?step=queue" },
  { id: "history", label: "Check history", hint: "Past decisions", href: "/admin/pending?step=history" },
]

export const COORDINATOR_DASHBOARD_GUIDE: ListGuideStep[] = [
  { id: "intake", label: "Clear your queue", hint: "Pending website submissions", href: "/admin/pending?step=queue" },
  { id: "tasks", label: "Hit your task list", hint: "Assigned to you with due dates", href: "/admin/tasks" },
  { id: "deals", label: "Move your deals", hint: "Stages where you are owner", href: "/admin/deals" },
  { id: "projects", label: "Ship your events", hint: "Projects tied to deals you own", href: "/admin/projects" },
]

export const SUPERADMIN_DASHBOARD_GUIDE: ListGuideStep[] = [
  { id: "health", label: "Watch pipeline health", hint: "Open value and stages", href: "/admin/deals" },
  { id: "intake", label: "Guard intake quality", hint: "Approve or decline with care", href: "/admin/pending?step=queue" },
  { id: "team", label: "Manage team access", hint: "Admins and roles", href: "/admin/settings/team" },
  { id: "audit", label: "Scan activity", hint: "Audit trail", href: "/admin/audit" },
]

export function parseWorkflowStep<T extends string>(
  raw: string | undefined,
  validIds: readonly T[],
  fallback: T
): T {
  if (raw && validIds.includes(raw as T)) return raw as T
  return fallback
}

export function stepIds<T extends WorkflowStep>(steps: readonly T[]): T["id"][] {
  return steps.map((s) => s.id)
}
