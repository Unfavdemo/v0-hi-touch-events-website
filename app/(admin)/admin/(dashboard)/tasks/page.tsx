import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { createTask } from "@/lib/actions/tasks"
import { TaskList } from "@/components/admin/task-list"
import { TaskPriority, TaskStatus } from "@/lib/generated/prisma/client"
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/crm/task-labels"
import { CrmListGuide } from "@/components/admin/crm-list-guide"
import { CRM_SECTION } from "@/lib/crm/admin-copy"
import { TASKS_LIST_GUIDE } from "@/lib/crm/workflows"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Tasks | Admin",
  robots: { index: false, follow: false },
}

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams

  if (!process.env.DATABASE_URL) {
    return (
      <main className="p-6 md:p-10">
        <p className="text-muted-foreground">Configure DATABASE_URL.</p>
      </main>
    )
  }

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const where =
    filter === "overdue"
      ? { status: { not: TaskStatus.COMPLETED }, dueAt: { lt: startOfToday } }
      : filter === "today"
        ? {
            status: { not: TaskStatus.COMPLETED },
            dueAt: { gte: startOfToday, lt: new Date(startOfToday.getTime() + 86400000) },
          }
        : filter === "done"
          ? { status: TaskStatus.COMPLETED }
          : { status: { not: TaskStatus.COMPLETED } }

  const [tasks, contacts, deals, admins] = await Promise.all([
    prisma.crmTask.findMany({
      where,
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: 100,
      include: {
        contact: { select: { email: true, firstName: true, lastName: true } },
        deal: { select: { id: true, name: true } },
        assignedTo: { include: { user: { select: { email: true, name: true } } } },
      },
    }),
    prisma.contact.findMany({ orderBy: { email: "asc" }, take: 100, select: { id: true, email: true, firstName: true, lastName: true } }),
    prisma.deal.findMany({ orderBy: { name: "asc" }, take: 50, select: { id: true, name: true } }),
    prisma.adminUser.findMany({ include: { user: { select: { id: true, email: true, name: true } } } }),
  ])

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <h1 className="font-display text-3xl font-normal uppercase tracking-tight">Tasks</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{CRM_SECTION.tasksList}</p>

      <CrmListGuide steps={TASKS_LIST_GUIDE} stepDone={{ create: tasks.length > 0, filter: tasks.length > 0 }} />

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        {[
          { href: "/admin/tasks", label: "Open", active: !filter },
          { href: "/admin/tasks?filter=today", label: "Due today", active: filter === "today" },
          { href: "/admin/tasks?filter=overdue", label: "Overdue", active: filter === "overdue" },
          { href: "/admin/tasks?filter=done", label: "Completed", active: filter === "done" },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full border px-3 py-1 uppercase tracking-wider ${
              tab.active ? "border-brand bg-brand/10" : "border-border"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <details id="add-task" className="mt-8 rounded-lg border border-border p-4">
        <summary className="cursor-pointer font-display text-sm uppercase tracking-[0.28em] text-brand-ink">
          Create task
        </summary>
        <form action={createTask} className="mt-4 grid max-w-xl gap-3">
          <input name="title" required placeholder="Task title" className="rounded border border-border bg-background px-3 py-2 text-sm" />
          <textarea name="body" rows={2} placeholder="Notes" className="rounded border border-border bg-background px-3 py-2 text-sm" />
          <input name="dueAt" type="datetime-local" className="rounded border border-border bg-background px-3 py-2 text-sm" />
          <select name="priority" defaultValue={TaskPriority.MEDIUM} className="rounded border border-border bg-background px-3 py-2 text-sm">
            {Object.values(TaskPriority).map((p) => (
              <option key={p} value={p}>
                {TASK_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
          <select name="contactId" defaultValue="" className="rounded border border-border bg-background px-3 py-2 text-sm">
            <option value="">— Contact —</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {[c.firstName, c.lastName].filter(Boolean).join(" ") || c.email}
              </option>
            ))}
          </select>
          <select name="dealId" defaultValue="" className="rounded border border-border bg-background px-3 py-2 text-sm">
            <option value="">— Deal —</option>
            {deals.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <select name="assignedToId" defaultValue="" className="rounded border border-border bg-background px-3 py-2 text-sm">
            <option value="">— Assign to me (default) —</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.user.email ?? a.user.name}
              </option>
            ))}
          </select>
          <button type="submit" className="font-display w-fit rounded-full border-2 border-brand px-4 py-2 text-[10px] uppercase tracking-[0.2em]">
            Add task
          </button>
        </form>
      </details>

      <div id="task-list">
        <TaskList tasks={tasks} />
      </div>
    </main>
  )
}
