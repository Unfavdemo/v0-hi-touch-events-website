import { Suspense } from "react"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getSessionSafe } from "@/lib/auth-session"
import {
  addContactVendorSkill,
  deleteContact,
  removeContactVendorSkill,
  tagContactHiTouchClient,
  untagContactHiTouchClient,
  updateContactProfile,
} from "@/lib/actions/crm"
import { normalizeAdminRole } from "@/lib/auth/roles"
import { CONTACT_WORKFLOW_STEPS, parseWorkflowStep } from "@/lib/crm/workflows"
import { ContactActivityTimeline } from "@/components/admin/contact-activity-timeline"
import { CrmDetailHeader } from "@/components/admin/crm-detail-header"
import { CrmSectionCard } from "@/components/admin/crm-section-card"
import { CrmWorkspace } from "@/components/admin/crm-workspace"
import { VendorReviewsPanel } from "@/components/admin/vendor-reviews-panel"
import { PortalInviteForm } from "@/components/portal/portal-invite-form"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Contact | Admin",
  robots: { index: false, follow: false },
}

const STEP_IDS = CONTACT_WORKFLOW_STEPS.map((s) => s.id)

export default async function AdminContactDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ step?: string }>
}) {
  const { id } = await params
  const { step: stepRaw } = await searchParams
  const initialStep = parseWorkflowStep(stepRaw, STEP_IDS, "profile")

  if (!process.env.DATABASE_URL) {
    return (
      <main className="p-6 md:p-10">
        <p className="text-muted-foreground">Configure `DATABASE_URL`.</p>
      </main>
    )
  }

  const session = await getSessionSafe()

  const [contact, companies, hiTouchClients, categories, activities, reviews, projects, adminUser] =
    await Promise.all([
      prisma.contact.findUnique({
        where: { id },
        include: {
          company: true,
          clientTags: { include: { hiTouchClient: true } },
          vendorSkills: { include: { category: true } },
          portalAccount: { select: { kind: true, enabled: true } },
        },
      }),
      prisma.company.findMany({ orderBy: { name: "asc" }, take: 500 }),
      prisma.hiTouchClient.findMany({ orderBy: { name: "asc" } }),
      prisma.vendorSkillCategory.findMany({ orderBy: { label: "asc" } }),
      prisma.contactActivity.findMany({
        where: { contactId: id },
        orderBy: { occurredAt: "desc" },
        take: 50,
        include: { createdBy: { include: { user: true } } },
      }),
      prisma.vendorReview.findMany({
        where: { contactId: id },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { project: true, hiTouchClient: true },
      }),
      prisma.eventProject.findMany({ orderBy: { name: "asc" }, take: 100, select: { id: true, name: true } }),
      session?.user?.id
        ? prisma.adminUser.findUnique({ where: { userId: session.user.id }, select: { role: true } })
        : null,
    ])

  if (!contact) notFound()

  const taggedIds = new Set(contact.clientTags.map((t) => t.hiTouchClientId))
  const skillKeys = new Set(contact.vendorSkills.map((s) => s.category.key))
  const isSuperAdmin = adminUser ? normalizeAdminRole(adminUser.role) === "SUPERADMIN" : false
  const portalKind = contact.portalAccount?.enabled
    ? (contact.portalAccount.kind as "CLIENT" | "VENDOR")
    : null
  const displayName = [contact.firstName, contact.lastName].filter(Boolean).join(" ") || contact.email
  const base = `/admin/crm/contacts/${id}`

  const stepDone: Record<string, boolean> = {
    profile: Boolean(contact.firstName || contact.phone || contact.companyId),
    portal: Boolean(portalKind),
    activity: activities.length > 0,
    reviews: reviews.length > 0,
    tags: contact.clientTags.length > 0,
    skills: contact.vendorSkills.length > 0,
  }

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <CrmDetailHeader
        backHref="/admin/crm/contacts"
        backLabel="Contacts"
        eyebrow="Contact"
        title={displayName}
        subtitle={contact.email}
      />

      <Suspense fallback={<p className="mt-10 text-sm text-muted-foreground">Loading…</p>}>
        <div className="mt-10">
          <CrmWorkspace basePath={base} steps={CONTACT_WORKFLOW_STEPS} initialStep={initialStep} stepDone={stepDone}>
            {{
              profile: (
                <CrmSectionCard title="Profile" description="Basic info for this person. Save when you are done.">
                  <form action={updateContactProfile.bind(null, contact.id)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">First name</label>
                        <input
                          name="firstName"
                          defaultValue={contact.firstName ?? ""}
                          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Last name</label>
                        <input
                          name="lastName"
                          defaultValue={contact.lastName ?? ""}
                          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Job title</label>
                      <input
                        name="title"
                        defaultValue={contact.title ?? ""}
                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <input
                        name="phone"
                        defaultValue={contact.phone ?? ""}
                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Company</label>
                      <select
                        name="companyId"
                        defaultValue={contact.companyId ?? "__none__"}
                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="__none__">— No company —</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Internal notes</label>
                      <p className="text-xs text-muted-foreground">Staff only — not shown on portals.</p>
                      <textarea
                        name="notes"
                        rows={4}
                        defaultValue={contact.notes ?? ""}
                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        className="font-display rounded-full border-2 border-brand bg-brand px-6 py-2.5 text-[10px] uppercase tracking-[0.28em] text-brand-foreground"
                      >
                        Save profile
                      </button>
                      <a href={`${base}?step=portal`} className="text-sm text-muted-foreground hover:underline">
                        Next: Portal →
                      </a>
                    </div>
                  </form>
                  {isSuperAdmin ? (
                    <form action={deleteContact.bind(null, contact.id)} className="mt-6 border-t border-border pt-4">
                      <button type="submit" className="text-xs text-destructive hover:underline">
                        Delete contact (superadmin)
                      </button>
                    </form>
                  ) : null}
                </CrmSectionCard>
              ),
              portal: (
                <CrmSectionCard
                  title="Portal access"
                  description="Invite this person to the client or vendor portal so they can sign in with email."
                >
                  <PortalInviteForm contactId={contact.id} existingKind={portalKind} />
                  <a href={`${base}?step=activity`} className="mt-4 inline-block text-sm text-muted-foreground hover:underline">
                    Next: Activity →
                  </a>
                </CrmSectionCard>
              ),
              activity: (
                <div>
                  <ContactActivityTimeline
                    contactId={contact.id}
                    activities={activities.map((a) => ({
                      id: a.id,
                      kind: a.kind,
                      body: a.body,
                      occurredAt: a.occurredAt,
                      createdByEmail: a.createdBy?.user.email ?? null,
                    }))}
                  />
                  <a href={`${base}?step=reviews`} className="mt-4 inline-block text-sm text-muted-foreground hover:underline">
                    Next: Reviews →
                  </a>
                </div>
              ),
              reviews: (
                <div>
                  <VendorReviewsPanel
                    contactId={contact.id}
                    isSuperAdmin={isSuperAdmin}
                    reviews={reviews.map((r) => ({
                      id: r.id,
                      rating: r.rating,
                      headline: r.headline,
                      body: r.body,
                      internalNotes: r.internalNotes,
                      reviewerName: r.reviewerName,
                      eventDate: r.eventDate,
                      createdAt: r.createdAt,
                      projectName: r.project?.name ?? null,
                      clientName: r.hiTouchClient?.name ?? null,
                    }))}
                    projects={projects}
                    hiTouchClients={hiTouchClients}
                  />
                  <a href={`${base}?step=tags`} className="mt-4 inline-block text-sm text-muted-foreground hover:underline">
                    Next: Client tags →
                  </a>
                </div>
              ),
              tags: (
                <CrmSectionCard
                  title="HiTouch client tags"
                  description="Which nonprofit or corporate accounts this person is associated with."
                >
                  <ul className="space-y-2 text-sm">
                    {hiTouchClients.map((hc) => (
                      <li
                        key={hc.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                      >
                        <span>{hc.name}</span>
                        {taggedIds.has(hc.id) ? (
                          <form
                            action={async () => {
                              "use server"
                              await untagContactHiTouchClient(contact.id, hc.id)
                            }}
                          >
                            <button type="submit" className="text-xs text-destructive hover:underline">
                              Remove
                            </button>
                          </form>
                        ) : (
                          <form
                            action={async () => {
                              "use server"
                              await tagContactHiTouchClient(contact.id, hc.id)
                            }}
                          >
                            <button type="submit" className="text-xs text-brand-ink hover:underline">
                              Add
                            </button>
                          </form>
                        )}
                      </li>
                    ))}
                  </ul>
                  <a href={`${base}?step=skills`} className="mt-4 inline-block text-sm text-muted-foreground hover:underline">
                    Next: Vendor skills →
                  </a>
                </CrmSectionCard>
              ),
              skills: (
                <CrmSectionCard
                  title="Vendor skills"
                  description="Required to receive project broadcast emails (e.g. catering, AV)."
                >
                  <ul className="space-y-2 text-sm">
                    {categories.map((cat) => (
                      <li
                        key={cat.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                      >
                        <span>{cat.label}</span>
                        {skillKeys.has(cat.key) ? (
                          <form
                            action={async () => {
                              "use server"
                              await removeContactVendorSkill(contact.id, cat.key)
                            }}
                          >
                            <button type="submit" className="text-xs text-destructive hover:underline">
                              Remove
                            </button>
                          </form>
                        ) : (
                          <form
                            action={async () => {
                              "use server"
                              await addContactVendorSkill(contact.id, cat.key)
                            }}
                          >
                            <button type="submit" className="text-xs text-brand-ink hover:underline">
                              Add
                            </button>
                          </form>
                        )}
                      </li>
                    ))}
                  </ul>
                  <a href="/admin/projects" className="mt-4 inline-block text-sm font-medium text-brand-ink hover:underline">
                    Ready? Create or open a project →
                  </a>
                </CrmSectionCard>
              ),
            }}
          </CrmWorkspace>
        </div>
      </Suspense>
    </main>
  )
}
