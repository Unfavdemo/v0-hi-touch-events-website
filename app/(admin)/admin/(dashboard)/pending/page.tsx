import { Suspense } from "react"
import { PendingStatus } from "@/lib/generated/prisma/client"
import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { getAdminRoleFromSession } from "@/lib/auth/guard"
import { intakeSearchWhere, normalizeAdminQuery } from "@/lib/admin-search"
import { PENDING_LIST_GUIDE, PENDING_WORKFLOW_STEPS, parseWorkflowStep } from "@/lib/crm/workflows"
import { AdminFilters } from "@/components/admin/admin-filters"
import { CrmListGuide } from "@/components/admin/crm-list-guide"
import { CRM_SECTION } from "@/lib/crm/admin-copy"
import { CrmSectionCard } from "@/components/admin/crm-section-card"
import { CrmWorkspace } from "@/components/admin/crm-workspace"
import { IntakeHistoryRow } from "@/components/admin/intake-history-row"
import { PendingRow } from "@/components/admin/pending-row"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Pending approvals | Admin",
  robots: { index: false, follow: false },
}

const HISTORY_STATUS_OPTIONS = [
  { value: "", label: "All reviewed" },
  { value: PendingStatus.APPROVED, label: "Approved" },
  { value: PendingStatus.DECLINED, label: "Declined" },
  { value: PendingStatus.SPAM, label: "Spam" },
]

const PENDING_STEP_IDS = PENDING_WORKFLOW_STEPS.map((s) => s.id)

export default async function AdminPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; historyStatus?: string; step?: string }>
}) {
  const { q: qRaw, historyStatus, step: stepRaw } = await searchParams
  const initialStep = parseWorkflowStep(stepRaw, PENDING_STEP_IDS, "queue")
  const q = normalizeAdminQuery(qRaw)
  const adminRole = (await getAdminRoleFromSession()) ?? "COORDINATOR"
  const canModerate = adminRole === "SUPERADMIN"

  let list: Awaited<ReturnType<typeof prisma.pendingSubmission.findMany>> = []
  let history: Awaited<
    ReturnType<
      typeof prisma.pendingSubmission.findMany<{
        include: { reviewedBy: { include: { user: true } } }
      }>
    >
  > = []
  let clients: { id: string; name: string }[] = []

  const searchClause = q ? intakeSearchWhere(q) : undefined

  const pendingWhere: Prisma.PendingSubmissionWhereInput = {
    status: PendingStatus.PENDING,
    ...searchClause,
  }

  const historyStatuses =
    historyStatus && Object.values(PendingStatus).includes(historyStatus as PendingStatus)
      ? [historyStatus as PendingStatus]
      : [PendingStatus.APPROVED, PendingStatus.DECLINED, PendingStatus.SPAM]

  const historyWhere: Prisma.PendingSubmissionWhereInput = {
    status: { in: historyStatuses },
    ...searchClause,
  }

  if (process.env.DATABASE_URL) {
    try {
      ;[list, history, clients] = await Promise.all([
        prisma.pendingSubmission.findMany({
          where: pendingWhere,
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        prisma.pendingSubmission.findMany({
          where: historyWhere,
          orderBy: [{ reviewedAt: "desc" }, { createdAt: "desc" }],
          take: 100,
          include: {
            reviewedBy: { include: { user: true } },
          },
        }),
        prisma.hiTouchClient.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        }),
      ])
    } catch {
      list = []
      history = []
      clients = []
    }
  }

  const hasFilters = Boolean(q || historyStatus)

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <h1 className="font-display text-3xl font-normal uppercase tracking-tight">Pending approvals</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{CRM_SECTION.pendingList}</p>

      <CrmListGuide
        steps={PENDING_LIST_GUIDE}
        stepDone={{ queue: list.length === 0, history: history.length > 0 }}
      />

      <AdminFilters
        basePath="/admin/pending"
        q={qRaw ?? ""}
        searchPlaceholder="Name, email, organization, message…"
        resultCount={list.length + history.length}
        resultLabel="submissions"
        selects={[
          {
            name: "historyStatus",
            label: "History status",
            value: historyStatus,
            options: HISTORY_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
          },
        ]}
      />

      {!canModerate ? (
        <p className="mt-6 rounded-md border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          View only — contact a Master Admin to approve, decline, or mark spam.
        </p>
      ) : null}

      <Suspense fallback={<p className="mt-10 text-sm text-muted-foreground">Loading…</p>}>
        <div className="mt-10">
          <CrmWorkspace
            basePath="/admin/pending"
            steps={PENDING_WORKFLOW_STEPS}
            initialStep={initialStep}
            stepDone={{
              queue: list.length === 0,
              history: history.length > 0,
            }}
          >
            {{
              queue: (
                <CrmSectionCard
                  title="Awaiting review"
                  description="Approve to add them to Contacts — optionally tag a HiTouch client first."
                >
                  {!process.env.DATABASE_URL ? (
                    <p className="text-muted-foreground">Configure `DATABASE_URL` to load submissions.</p>
                  ) : list.length === 0 ? (
                    <p className="text-muted-foreground">
                      {hasFilters ? "No pending submissions match your search." : "Queue is empty — you're all caught up."}
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {list.map((row) => (
                        <PendingRow
                          key={row.id}
                          canModerate={canModerate}
                          hiTouchClients={clients}
                          submission={{
                            id: row.id,
                            fullName: row.fullName,
                            email: row.email,
                            organization: row.organization,
                            message: row.message,
                            categories: row.categories,
                            createdAt: row.createdAt.toLocaleString(),
                          }}
                        />
                      ))}
                    </ul>
                  )}
                  <a href="/admin/pending?step=history" className="mt-4 inline-block text-sm text-muted-foreground hover:underline">
                    Next: History →
                  </a>
                </CrmSectionCard>
              ),
              history: (
                <CrmSectionCard
                  title="Review history"
                  description={`${list.length} in queue · ${history.length} reviewed${
                    historyStatus ? ` · ${HISTORY_STATUS_OPTIONS.find((o) => o.value === historyStatus)?.label ?? historyStatus}` : ""
                  }`}
                >
                  {!process.env.DATABASE_URL ? null : history.length === 0 ? (
                    <p className="text-muted-foreground">
                      {hasFilters ? "No reviewed submissions match your filters." : "No reviewed submissions yet."}
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {history.map((row) => (
                        <IntakeHistoryRow
                          key={row.id}
                          submission={{
                            fullName: row.fullName,
                            email: row.email,
                            organization: row.organization,
                            message: row.message,
                            categories: row.categories,
                            status: row.status,
                            createdAt: row.createdAt.toLocaleString(),
                            reviewedAt: row.reviewedAt?.toLocaleString() ?? null,
                            reviewedByEmail: row.reviewedBy?.user.email ?? null,
                          }}
                        />
                      ))}
                    </ul>
                  )}
                </CrmSectionCard>
              ),
            }}
          </CrmWorkspace>
        </div>
      </Suspense>
    </main>
  )
}
