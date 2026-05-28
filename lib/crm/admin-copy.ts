/** User-facing CRM copy — keep product language here, not in scattered page strings. */

export const CRM_MISSION =
  "One place to qualify website leads, grow relationships, run the sales pipeline, and execute events with vendors."

/** Shown on `/admin` for Event Coordinators (operational “my work” home). */
export const COORDINATOR_DASHBOARD_INTRO =
  "Your desk: clear intake when you can, work tasks assigned to you, advance deals you own, and ship events linked to those deals. Unassigned open tasks are the team queue — grab what you can."

/** Shown on `/admin` for Master Admin (org-wide home). */
export const SUPERADMIN_DASHBOARD_INTRO =
  "Leadership view across intake, pipeline, open follow-ups, and CRM footprint — plus team size, unread alerts, and how much happened in the audit log this week."

export const CRM_SECTION = {
  dealsList: "Track opportunities from first conversation to closed won. Drag cards on the board to update the stage.",
  listsList: "Build fixed groups of contacts for campaigns, invites, or exports — without changing the underlying records.",
  tasksList: "Capture follow-ups with due dates. Link tasks to deals so nothing falls through the cracks.",
  contactsList: "Everyone you know: clients, vendors, partners. Strong profiles make projects and email targeting work.",
  companiesList: "Organizations tied to your contacts. Use client tags to show which HiTouch accounts they belong to.",
  clientsList: "Nonprofit and corporate accounts you produce events for. Tag contacts and companies to those accounts.",
  projectsList: "Each event: details, budget, vendor broadcasts, opens, and picking a winner — all in one guided flow.",
  pendingList: "Website form submissions stay here until you approve. Only then do they become real CRM contacts.",
} as const

export const CRM_EMPTY = {
  contacts: "No contacts yet. Add someone above, or approve pending intake to create them automatically.",
  companies: "No companies yet. Add one above, or link a company when you edit a contact.",
  deals: "No deals on the board yet. Create one above to start tracking value and close dates.",
  tasks: "No tasks in this view. Add a task above or switch filters.",
  lists: "No lists yet. Create a list above, then open it to add members.",
  projects:
    "No projects yet. Use \"Create new project\" above, or run `npm run db:seed` in development to load sample data.",
} as const

/** Budget field matches PostgreSQL DECIMAL(12,2). */
export const BUDGET_USD_HINT = "Maximum budget stored: $9,999,999,999.99 (leave blank if unknown)."

export const CRM_AREAS = [
  {
    title: "People & organizations",
    description: "Contacts, companies, and HiTouch client tags — who you work with.",
    href: "/admin/crm/contacts",
    cta: "Open contacts",
  },
  {
    title: "Pipeline & follow-up",
    description: "Deals, tasks, and lists — revenue and accountability.",
    href: "/admin/deals",
    cta: "Open deals",
  },
  {
    title: "Events & vendors",
    description: "Projects, broadcasts, and engagement — operational delivery.",
    href: "/admin/projects",
    cta: "Open projects",
  },
  {
    title: "Intake & quality",
    description: "Approve or decline website submissions before they touch the CRM.",
    href: "/admin/pending",
    cta: "Open pending",
  },
] as const

export const CRM_NOTICES: Record<string, { message: string; tone: "success" | "info" | "warning" }> = {
  project_created: {
    message: "Project created. Use the checklist: confirm details, set budget if needed, then email vendors.",
    tone: "success",
  },
  project_saved: {
    message: "Project details saved.",
    tone: "success",
  },
  contact_saved: {
    message: "Contact updated.",
    tone: "success",
  },
}
