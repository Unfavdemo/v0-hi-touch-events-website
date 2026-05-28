"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { deleteTask, updateTaskStatus } from "@/lib/actions/tasks"
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, type TaskPriorityName, type TaskStatusName } from "@/lib/crm/task-labels"

export type TaskRow = {
  id: string
  title: string
  status: TaskStatusName
  priority: TaskPriorityName
  dueAt: Date | null
  contact: { email: string; firstName: string | null; lastName: string | null } | null
  deal: { id: string; name: string } | null
  assignedTo: { user: { email: string | null; name: string | null } } | null
}

export function TaskList({ tasks }: { tasks: TaskRow[] }) {
  const [pending, start] = useTransition()
  const router = useRouter()

  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground">No tasks match this view.</p>
  }

  return (
    <ul className="mt-4 space-y-2">
      {tasks.map((t) => {
        const overdue = t.dueAt && t.status !== "COMPLETED" && t.dueAt < new Date()
        return (
          <li
            key={t.id}
            className={`flex flex-col gap-2 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
              overdue ? "border-destructive/40 bg-destructive/5" : "bg-card/30"
            }`}
          >
            <div className="min-w-0">
              <p className="font-medium">{t.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {TASK_STATUS_LABELS[t.status as TaskStatusName]} · {TASK_PRIORITY_LABELS[t.priority as TaskPriorityName]}
                {t.dueAt ? ` · due ${t.dueAt.toLocaleString()}` : ""}
                {t.assignedTo?.user.email ? ` · ${t.assignedTo.user.email}` : ""}
              </p>
              {t.deal ? (
                <p className="mt-1 text-xs">
                  Deal:{" "}
                  <a href={`/admin/deals/${t.deal.id}`} className="text-brand-ink underline-offset-2 hover:underline">
                    {t.deal.name}
                  </a>
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {t.status !== "COMPLETED" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await updateTaskStatus(t.id, "COMPLETED")
                      router.refresh()
                    })
                  }
                  className="font-display rounded-full border border-brand px-3 py-1 text-[9px] uppercase tracking-[0.2em]"
                >
                  Complete
                </button>
              ) : null}
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await deleteTask(t.id)
                    router.refresh()
                  })
                }
                className="text-xs text-destructive hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
