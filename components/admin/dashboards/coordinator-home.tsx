import Link from "next/link"
import type { getCoordinatorDashboard } from "@/lib/queries/coordinator-dashboard"
import { COORDINATOR_DASHBOARD_INTRO, CRM_MISSION } from "@/lib/crm/admin-copy"
import { COORDINATOR_DASHBOARD_GUIDE } from "@/lib/crm/workflows"
import { CrmListGuide } from "@/components/admin/crm-list-guide"

type CoordinatorData = Awaited<ReturnType<typeof getCoordinatorDashboard>>

function defaultCoordinatorData(): CoordinatorData {
  return {
    pendingIntake: 0,
    myOpenTasks: 0,
    myOverdueTasks: 0,
    myDueTodayTasks: 0,
    myOpenDeals: 0,
    myActiveProjects: 0,
    unassignedOpenTasks: 0,
    allOpenDeals: 0,
    unreadNotifications: 0,
    upcomingTasks: [],
  }
}

function formatDue(d: Date | null) {
  if (!d) return "No due date"
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(d)
}

export function CoordinatorHome({ data }: { data: CoordinatorData | null }) {
  const d = data ?? defaultCoordinatorData()

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <h1 className="font-display text-3xl font-normal uppercase tracking-tight">My dashboard</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{CRM_MISSION}</p>
      <p className="mt-3 max-w-2xl text-sm text-foreground/90">{COORDINATOR_DASHBOARD_INTRO}</p>

      <CrmListGuide
        steps={COORDINATOR_DASHBOARD_GUIDE}
        stepDone={{
          intake: d.pendingIntake === 0,
          tasks: d.myOpenTasks === 0 && d.myOverdueTasks === 0,
          deals: d.myOpenDeals > 0,
          projects: d.myActiveProjects > 0,
        }}
      />

      <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/pending" className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Pending intake</dt>
          <dd className="mt-2 font-display text-3xl tabular-nums">{d.pendingIntake}</dd>
          <dd className="mt-1 text-xs text-muted-foreground">Org queue — clear when you can</dd>
        </Link>
        <Link href="/admin/tasks" className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">My open tasks</dt>
          <dd className="mt-2 font-display text-3xl tabular-nums">{d.myOpenTasks}</dd>
          {d.myOverdueTasks > 0 ? (
            <dd className="mt-1 text-xs text-destructive">{d.myOverdueTasks} overdue</dd>
          ) : (
            <dd className="mt-1 text-xs text-muted-foreground">{d.myDueTodayTasks} due today</dd>
          )}
        </Link>
        <Link href="/admin/deals" className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">My open deals</dt>
          <dd className="mt-2 font-display text-3xl tabular-nums">{d.myOpenDeals}</dd>
          <dd className="mt-1 text-xs text-muted-foreground">{d.allOpenDeals} open org-wide</dd>
        </Link>
        <Link href="/admin/projects" className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">My active projects</dt>
          <dd className="mt-2 font-display text-3xl tabular-nums">{d.myActiveProjects}</dd>
          <dd className="mt-1 text-xs text-muted-foreground">Events linked to deals you own</dd>
        </Link>
      </dl>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/tasks" className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Team queue</dt>
          <dd className="mt-2 font-display text-2xl tabular-nums">{d.unassignedOpenTasks}</dd>
          <dd className="mt-1 text-xs text-muted-foreground">Open tasks with no assignee yet</dd>
        </Link>
        <Link href="/admin/notifications" className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Unread alerts</dt>
          <dd className="mt-2 font-display text-2xl tabular-nums">{d.unreadNotifications}</dd>
        </Link>
      </div>

      {d.upcomingTasks.length > 0 ? (
        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-sm uppercase tracking-[0.28em] text-brand-ink">Next on your list</h2>
            <Link href="/admin/tasks" className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-brand-ink">
              All tasks →
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
            {d.upcomingTasks.map((t) => (
              <li key={t.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <span className="font-medium">{t.title}</span>
                  {t.dealId && t.dealName ? (
                    <span className="ml-2 text-muted-foreground">
                      ·{" "}
                      <Link href={`/admin/deals/${t.dealId}`} className="hover:text-foreground hover:underline">
                        {t.dealName}
                      </Link>
                    </span>
                  ) : null}
                </div>
                <time
                  className="shrink-0 text-xs text-muted-foreground"
                  {...(t.dueAt ? { dateTime: t.dueAt.toISOString() } : {})}
                >
                  {formatDue(t.dueAt)}
                </time>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  )
}
