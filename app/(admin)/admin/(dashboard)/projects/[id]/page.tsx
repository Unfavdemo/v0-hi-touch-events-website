import Link from "next/link"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { EmailEventType } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { BroadcastForm } from "@/components/admin/broadcast-form"
import { ProjectBudgetForm } from "@/components/admin/project-budget-form"
import { ProjectDetailsForm } from "@/components/admin/project-details-form"
import { ProjectVendorsPanel } from "@/components/admin/project-vendors-panel"
import { CrmDetailHeader } from "@/components/admin/crm-detail-header"
import { CrmNotice } from "@/components/admin/crm-notice"
import { ProjectWorkspace } from "@/components/admin/project-workspace"
import { PROJECT_WORKFLOW_STEPS, parseWorkflowStep } from "@/lib/crm/workflows"
import { PROJECT_STATUS_LABELS, formatContactName, type ProjectStepId } from "@/lib/project-workflow"

export const dynamic = "force-dynamic"

const PROJECT_STEP_IDS = PROJECT_WORKFLOW_STEPS.map((s) => s.id) as ProjectStepId[]

export default async function AdminProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ step?: string; notice?: string }>
}) {
  const { id } = await params
  const { step: stepRaw, notice } = await searchParams
  const initialStep = parseWorkflowStep(stepRaw, PROJECT_STEP_IDS, "details")

  if (!process.env.DATABASE_URL) {
    return (
      <main id="admin-main" className="p-6 md:p-10">
        <p className="text-muted-foreground">Configure `DATABASE_URL`.</p>
      </main>
    )
  }

  const [project, categories, hiTouchClients] = await Promise.all([
    prisma.eventProject.findUnique({
      where: { id },
      include: {
        hiTouchClient: true,
        winnerContact: { select: { email: true, firstName: true, lastName: true } },
        broadcasts: {
          orderBy: { createdAt: "desc" },
          include: {
            engagements: {
              include: {
                contact: {
                  include: {
                    company: { select: { name: true } },
                    vendorReviews: { select: { rating: true } },
                  },
                },
                messages: {
                  include: {
                    _count: {
                      select: { events: { where: { type: EmailEventType.OPENED } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.vendorSkillCategory.findMany({ orderBy: { label: "asc" } }),
    prisma.hiTouchClient.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ])

  if (!project) notFound()

  const broadcastIds = project.broadcasts.map((b) => b.id)
  const activity =
    broadcastIds.length > 0
      ? await prisma.auditLog.findMany({
          where: {
            OR: [
              { entityType: "EventProject", entityId: id },
              { entityType: "VendorBroadcast", entityId: { in: broadcastIds } },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 40,
          include: { actor: { include: { user: { select: { email: true } } } } },
        })
      : await prisma.auditLog.findMany({
          where: { entityType: "EventProject", entityId: id },
          orderBy: { createdAt: "desc" },
          take: 40,
          include: { actor: { include: { user: { select: { email: true } } } } },
        })

  const categoryWithCounts = await Promise.all(
    categories.map(async (cat) => ({
      key: cat.key,
      label: cat.label,
      count: await prisma.contact.count({
        where: { vendorSkills: { some: { categoryId: cat.id } } },
      }),
    }))
  )

  const vendorBroadcasts = project.broadcasts.map((b) => ({
    id: b.id,
    subject: b.subject,
    createdAt: b.createdAt,
    refusalBatchSentAt: b.refusalBatchSentAt,
    staleAfterHours: b.staleAfterHours,
    dispatchedAt: b.dispatchedAt,
    engagements: b.engagements.map((e) => {
      const ratings = e.contact.vendorReviews.map((r) => r.rating)
      const avgRating =
        ratings.length > 0 ? ratings.reduce((a, c) => a + c, 0) / ratings.length : null
      return {
        id: e.id,
        contactId: e.contactId,
        email: e.contact.email,
        firstName: e.contact.firstName,
        lastName: e.contact.lastName,
        status: e.status,
        lastReplyAt: e.lastReplyAt,
        openCount: e.messages.reduce((sum, m) => sum + m._count.events, 0),
        lastOpenedAt: e.lastOpenedAt,
        avgRating,
      }
    }),
  }))

  const winnerLabel = project.winnerContact
    ? formatContactName({
        email: project.winnerContact.email,
        firstName: project.winnerContact.firstName,
        lastName: project.winnerContact.lastName,
      })
    : null

  const hasBroadcast = project.broadcasts.length > 0
  const hasWinner =
    Boolean(project.winnerContactId) || project.broadcasts.some((b) => b.refusalBatchSentAt)

  const stepDone: Record<ProjectStepId, boolean> = {
    details: Boolean(project.name && (project.startsAt || project.location)),
    budget: project.budgetUsd != null,
    broadcast: hasBroadcast,
    vendors: hasWinner || vendorBroadcasts.some((b) => b.engagements.some((e) => e.openCount > 0)),
    files: false,
    activity: hasBroadcast,
  }

  const base = `/admin/projects/${id}`

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <CrmDetailHeader
        backHref="/admin/projects"
        backLabel="All projects"
        eyebrow="Project"
        title={project.name}
        badges={
          <>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] uppercase tracking-wider">
              {PROJECT_STATUS_LABELS[project.status]}
            </span>
            {project.hiTouchClient ? (
              <span className="text-sm text-muted-foreground">Client: {project.hiTouchClient.name}</span>
            ) : null}
            {project.location ? <span className="text-sm text-muted-foreground">{project.location}</span> : null}
            {project.startsAt ? (
              <span className="text-sm text-muted-foreground">{project.startsAt.toLocaleDateString()}</span>
            ) : null}
          </>
        }
      />

      <CrmNotice code={notice} />

      <Suspense fallback={<p className="mt-10 text-sm text-muted-foreground">Loading workspace…</p>}>
        <div className="mt-10">
          <ProjectWorkspace projectId={id} initialStep={initialStep} stepDone={stepDone}>
            {{
              details: (
                <ProjectDetailsForm
                  project={project}
                  hiTouchClients={hiTouchClients}
                  nextStepHref={`${base}?step=budget`}
                />
              ),
              budget: (
                <ProjectBudgetForm
                  projectId={id}
                  budgetUsd={project.budgetUsd}
                  nextStepHref={`${base}?step=broadcast`}
                />
              ),
              broadcast: (
                <BroadcastForm
                  projectId={id}
                  projectName={project.name}
                  categoryKeys={categoryWithCounts}
                  nextStepHref={`${base}?step=vendors`}
                />
              ),
              vendors: (
                <section>
                  <h2 className="font-display text-lg uppercase tracking-tight">Manage vendors</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    See who opened your email, who replied, and pick a winner when you&apos;re ready.
                  </p>
                  <div className="mt-6">
                    <ProjectVendorsPanel broadcasts={vendorBroadcasts} winnerLabel={winnerLabel} />
                  </div>
                </section>
              ),
              files: (
                <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="font-display text-lg uppercase tracking-tight">Project files</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Keep contracts, moodboards, and floor plans in one place.</p>
                  <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                    {["Moodboard PDF", "Floor plan", "Vendor contracts", "Invoices", "Event photos"].map((label) => (
                      <li key={label} className="flex items-center justify-between rounded-lg border border-dashed border-border px-4 py-3">
                        <span>{label}</span>
                        <span className="text-[10px] uppercase tracking-wider">Coming soon</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ),
              activity: (
                <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="font-display text-lg uppercase tracking-tight">Activity</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Recent changes on this project.</p>
                  <ul className="mt-6 space-y-4">
                    <li className="text-sm">
                      <span className="text-muted-foreground">{project.createdAt.toLocaleString()}</span>
                      <span className="mx-2">·</span>
                      Project created
                    </li>
                    {project.broadcasts.map((b) => (
                      <li key={b.id} className="text-sm">
                        <span className="text-muted-foreground">{b.createdAt.toLocaleString()}</span>
                        <span className="mx-2">·</span>
                        Broadcast sent: <em>{b.subject}</em> ({b.engagements.length} vendors)
                      </li>
                    ))}
                    {activity.map((a) => (
                      <li key={a.id} className="text-sm">
                        <span className="text-muted-foreground">{a.createdAt.toLocaleString()}</span>
                        <span className="mx-2">·</span>
                        {a.action}
                        {a.actor.user.email ? (
                          <span className="text-muted-foreground"> — {a.actor.user.email}</span>
                        ) : null}
                      </li>
                    ))}
                    {!hasBroadcast && activity.length === 0 ? (
                      <li className="text-sm text-muted-foreground">No activity yet — start with event details, then email vendors.</li>
                    ) : null}
                  </ul>
                </section>
              ),
            }}
          </ProjectWorkspace>
        </div>
      </Suspense>
    </main>
  )
}
