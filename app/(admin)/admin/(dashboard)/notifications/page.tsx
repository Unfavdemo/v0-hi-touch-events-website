import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { notificationSearchWhere, normalizeAdminQuery } from "@/lib/admin-search"
import { AdminFilters } from "@/components/admin/admin-filters"
import { MarkAllNotificationsButton } from "@/components/admin/mark-all-notifications-button"
import { MarkNotificationReadButton } from "@/components/admin/mark-notification-read-button"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Notifications | Admin",
  robots: { index: false, follow: false },
}

const READ_OPTIONS = [
  { value: "", label: "All" },
  { value: "unread", label: "Unread only" },
  { value: "read", label: "Read only" },
]

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; read?: string }>
}) {
  const { q: qRaw, read: readFilter } = await searchParams
  const q = normalizeAdminQuery(qRaw)

  let notes: Awaited<ReturnType<typeof prisma.adminNotification.findMany>> = []

  const where: Prisma.AdminNotificationWhereInput = {
    ...(q ? notificationSearchWhere(q) : {}),
    ...(readFilter === "unread" ? { readAt: null } : readFilter === "read" ? { readAt: { not: null } } : {}),
  }

  if (process.env.DATABASE_URL) {
    try {
      notes = await prisma.adminNotification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    } catch {
      notes = []
    }
  }

  const unread = notes.filter((n) => !n.readAt).length
  const hasFilters = Boolean(q || readFilter)

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-normal uppercase tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unread} unread in this view · {notes.length} shown
          </p>
        </div>
        {unread > 0 && readFilter !== "read" ? <MarkAllNotificationsButton /> : null}
      </div>

      <AdminFilters
        basePath="/admin/notifications"
        q={qRaw ?? ""}
        searchPlaceholder="Title, type, body…"
        resultCount={notes.length}
        resultLabel="notifications"
        selects={[
          {
            name: "read",
            label: "Read state",
            value: readFilter,
            options: READ_OPTIONS,
          },
        ]}
      />

      {!process.env.DATABASE_URL ? (
        <p className="mt-8 text-muted-foreground">Configure `DATABASE_URL`.</p>
      ) : notes.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          {hasFilters ? "No notifications match your filters." : "No notifications yet."}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="rounded-lg border border-border px-4 py-3 text-sm">
              <p className="font-medium">{n.title}</p>
              {n.body ? <p className="mt-1 text-muted-foreground">{n.body}</p> : null}
              <p className="mt-2 text-xs text-muted-foreground">{n.createdAt.toLocaleString()}</p>
              {!n.readAt ? <MarkNotificationReadButton id={n.id} /> : <p className="mt-2 text-xs text-muted-foreground">Read</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
