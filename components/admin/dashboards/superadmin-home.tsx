import Link from "next/link"
import type { getSuperAdminDashboard } from "@/lib/queries/superadmin-dashboard"
import { DEAL_STAGE_LABELS, formatDealAmount } from "@/lib/crm/deal-stages"
import { CRM_AREAS, CRM_MISSION, SUPERADMIN_DASHBOARD_INTRO } from "@/lib/crm/admin-copy"
import { SUPERADMIN_DASHBOARD_GUIDE } from "@/lib/crm/workflows"
import { CrmListGuide } from "@/components/admin/crm-list-guide"
import type { DealStageName } from "@/lib/crm/deal-stages"

type SuperAdminData = Awaited<ReturnType<typeof getSuperAdminDashboard>>

function defaultSuperAdminData(): SuperAdminData {
  const dealsByStage: SuperAdminData["stats"]["dealsByStage"] = []
  return {
    stats: {
      openDeals: 0,
      pipelineValue: null,
      wonDeals: 0,
      tasksDueToday: 0,
      tasksOverdue: 0,
      openTasks: 0,
      lists: 0,
      dealsByStage,
    },
    pending: 0,
    contacts: 0,
    projects: 0,
    adminUsers: 0,
    auditWeek: 0,
    unreadNotifications: 0,
  }
}

export function SuperAdminHome({ data }: { data: SuperAdminData | null }) {
  const d = data ?? defaultSuperAdminData()
  const crm = d.stats

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <h1 className="font-display text-3xl font-normal uppercase tracking-tight">Command center</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{CRM_MISSION}</p>
      <p className="mt-3 max-w-2xl text-sm text-foreground/90">{SUPERADMIN_DASHBOARD_INTRO}</p>

      <CrmListGuide
        steps={SUPERADMIN_DASHBOARD_GUIDE}
        stepDone={{
          health: crm.openDeals > 0,
          intake: d.pending === 0,
          team: d.adminUsers > 1,
          audit: d.auditWeek > 0,
        }}
      />

      <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/pending" className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Pending intake</dt>
          <dd className="mt-2 font-display text-3xl tabular-nums">{d.pending}</dd>
          <dd className="mt-1 text-xs text-muted-foreground">Needs a decision</dd>
        </Link>
        <Link href="/admin/deals" className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Open deals</dt>
          <dd className="mt-2 font-display text-3xl tabular-nums">{crm.openDeals}</dd>
          <dd className="mt-1 text-xs text-muted-foreground">{formatDealAmount(crm.pipelineValue)} in pipeline</dd>
        </Link>
        <Link href="/admin/tasks" className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Open tasks</dt>
          <dd className="mt-2 font-display text-3xl tabular-nums">{crm.openTasks}</dd>
          {crm.tasksOverdue > 0 ? (
            <dd className="mt-1 text-xs text-destructive">{crm.tasksOverdue} overdue</dd>
          ) : (
            <dd className="mt-1 text-xs text-muted-foreground">{crm.tasksDueToday} due today</dd>
          )}
        </Link>
        <Link href="/admin/crm/contacts" className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Contacts</dt>
          <dd className="mt-2 font-display text-3xl tabular-nums">{d.contacts}</dd>
          <dd className="mt-1 text-xs text-muted-foreground">People in the CRM</dd>
        </Link>
      </dl>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border p-4">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Deals won</dt>
          <dd className="mt-2 font-display text-2xl tabular-nums">{crm.wonDeals}</dd>
        </div>
        <Link href="/admin/lists" className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Contact lists</dt>
          <dd className="mt-2 font-display text-2xl tabular-nums">{crm.lists}</dd>
        </Link>
        <Link href="/admin/notifications" className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Unread alerts</dt>
          <dd className="mt-2 font-display text-2xl tabular-nums">{d.unreadNotifications}</dd>
        </Link>
        <Link href="/admin/settings/team" className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Admin team</dt>
          <dd className="mt-2 font-display text-2xl tabular-nums">{d.adminUsers}</dd>
          <dd className="mt-1 text-xs text-muted-foreground">Users with CRM access</dd>
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/audit" className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Audit (last 7 days)</dt>
          <dd className="mt-2 font-display text-2xl tabular-nums">{d.auditWeek}</dd>
          <dd className="mt-1 text-xs text-muted-foreground">Recorded changes and views</dd>
        </Link>
        <Link href="/admin/projects" className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Event projects</dt>
          <dd className="mt-2 font-display text-2xl tabular-nums">{d.projects}</dd>
          <dd className="mt-1 text-xs text-muted-foreground">All projects in the system</dd>
        </Link>
      </div>

      {crm.dealsByStage.length > 0 ? (
        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-sm uppercase tracking-[0.28em] text-brand-ink">Pipeline by stage</h2>
            <Link href="/admin/deals" className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-brand-ink">
              Open pipeline →
            </Link>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {crm.dealsByStage.map((row) => (
              <li key={row.stage} className="rounded border border-border px-3 py-2 text-sm">
                <span className="text-muted-foreground">{DEAL_STAGE_LABELS[row.stage as DealStageName]}</span>
                <span className="ml-2 font-medium">{row._count.id}</span>
                <span className="ml-2 text-xs text-muted-foreground">{formatDealAmount(row._sum.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12 rounded-xl border border-border bg-muted/15 p-6">
        <h2 className="font-display text-xs uppercase tracking-[0.28em] text-brand-ink">Where everything lives</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {CRM_AREAS.map((area) => (
            <li key={area.href} className="rounded-lg border border-border bg-background p-4">
              <p className="font-medium">{area.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{area.description}</p>
              <Link href={area.href} className="mt-3 inline-block text-xs font-medium uppercase tracking-wider text-brand-ink hover:underline">
                {area.cta} →
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
