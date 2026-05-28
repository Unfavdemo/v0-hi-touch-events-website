import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getSessionSafe } from "@/lib/auth-session"
import { purgeAuditLogsOlderThan } from "@/lib/actions/audit"
import { auditEntityLink, AUDIT_ACTION_OPTIONS, formatAuditAction } from "@/lib/audit-display"
import { auditSearchWhere, normalizeAdminQuery } from "@/lib/admin-search"
import { AdminFilters } from "@/components/admin/admin-filters"
import type { Prisma } from "@/lib/generated/prisma/client"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Audit log | Admin",
  robots: { index: false, follow: false },
}

const ENTITY_FILTERS = [
  { value: "", label: "All types" },
  { value: "PendingSubmission", label: "Intake" },
  { value: "CaseStudy", label: "Case studies" },
  { value: "VendorBroadcast", label: "Vendor broadcasts" },
  { value: "Contact", label: "Contacts" },
] as const

function formatPayload(payload: unknown): string | null {
  if (payload == null) return null
  try {
    return JSON.stringify(payload, null, 2)
  } catch {
    return String(payload)
  }
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; entityType?: string; action?: string }>
}) {
  const { q: qRaw, entityType: entityTypeFilter, action: actionFilter } = await searchParams
  const q = normalizeAdminQuery(qRaw)

  const session = await getSessionSafe()
  let isSuperAdmin = false
  if (process.env.DATABASE_URL && session?.user?.id) {
    try {
      const adminUser = await prisma.adminUser.findUnique({
        where: { userId: session.user.id },
        select: { role: true },
      })
      isSuperAdmin = adminUser?.role === "SUPERADMIN"
    } catch {
      isSuperAdmin = false
    }
  }

  let logs: {
    id: string
    action: string
    entityType: string
    entityId: string
    payload: unknown
    createdAt: Date
    actor: { user: { email: string | null; name: string | null } }
  }[] = []

  if (process.env.DATABASE_URL) {
    try {
      const where: Prisma.AuditLogWhereInput = {
        ...(entityTypeFilter ? { entityType: entityTypeFilter } : {}),
        ...(actionFilter ? { action: actionFilter } : {}),
        ...(q ? auditSearchWhere(q) : {}),
      }
      logs = await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
          actor: { include: { user: true } },
        },
      })
    } catch {
      logs = []
    }
  }

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <h1 className="font-display text-3xl font-normal uppercase tracking-tight">Audit log</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Search by actor, action, or entity. Filter by type and action. Newest first (max 200).
      </p>

      {isSuperAdmin ? (
        <form
          action={async (formData) => {
            "use server"
            const days = Number.parseInt(String(formData.get("days") ?? "90"), 10)
            await purgeAuditLogsOlderThan(days)
          }}
          className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4"
        >
          <div>
            <label className="text-xs text-muted-foreground">Purge audit older than (days)</label>
            <input name="days" type="number" min={30} defaultValue={90} className="mt-1 block w-24 rounded border border-border bg-background px-2 py-1.5 text-sm" />
          </div>
          <button type="submit" className="font-display rounded-full border border-amber-600 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-200">
            Purge (superadmin)
          </button>
        </form>
      ) : null}

      <AdminFilters
        basePath="/admin/audit"
        q={qRaw ?? ""}
        searchPlaceholder="Actor email, action, entity type…"
        resultCount={logs.length}
        resultLabel="entries"
        selects={[
          {
            name: "entityType",
            label: "Entity type",
            value: entityTypeFilter,
            options: ENTITY_FILTERS.map((f) => ({ value: f.value, label: f.label })),
          },
          {
            name: "action",
            label: "Action",
            value: actionFilter,
            options: AUDIT_ACTION_OPTIONS.map((f) => ({ value: f.value, label: f.label })),
          },
        ]}
      />

      {!process.env.DATABASE_URL ? (
        <p className="mt-8 text-muted-foreground">Configure `DATABASE_URL`.</p>
      ) : logs.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          {q || entityTypeFilter || actionFilter ? "No entries match your filters." : "No audit entries yet."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-muted/30 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const href = auditEntityLink(log.entityType, log.entityId, log.payload)
                const payloadText = formatPayload(log.payload)
                return (
                  <tr key={log.id} className="border-b border-border/80 align-top last:border-0">
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">
                      {log.createdAt.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-xs">{log.actor.user.email ?? log.actor.user.name ?? "Admin"}</td>
                    <td className="px-3 py-3">{formatAuditAction(log.action)}</td>
                    <td className="px-3 py-3 text-xs">
                      <span className="text-muted-foreground">{log.entityType}</span>
                      {href ? (
                        <Link href={href} className="mt-0.5 block font-mono text-[11px] text-brand-ink hover:underline">
                          Open →
                        </Link>
                      ) : (
                        <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{log.entityId.slice(0, 12)}…</span>
                      )}
                    </td>
                    <td className="max-w-xs px-3 py-3">
                      {payloadText ? (
                        <pre className="max-h-24 overflow-auto rounded bg-muted/50 p-2 font-mono text-[10px] leading-snug text-muted-foreground">
                          {payloadText}
                        </pre>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
