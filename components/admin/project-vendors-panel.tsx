import Link from "next/link"
import type { EmailEventType, VendorEngagementStatus } from "@/lib/generated/prisma/client"
import { WinnerPicker } from "@/components/admin/winner-picker"
import {
  ENGAGEMENT_STATUS_LABELS,
  engagementStatusTone,
  formatContactName,
} from "@/lib/project-workflow"
import { cn } from "@/lib/utils"

type EngagementRow = {
  id: string
  contactId: string
  email: string
  firstName: string | null
  lastName: string | null
  status: VendorEngagementStatus
  lastReplyAt: Date | null
  openCount: number
  lastOpenedAt: Date | null
  avgRating: number | null
}

type BroadcastBlock = {
  id: string
  subject: string
  createdAt: Date
  refusalBatchSentAt: Date | null
  staleAfterHours: number
  dispatchedAt: Date | null
  engagements: EngagementRow[]
}

function engagementIsStale(
  e: { lastReplyAt?: Date | null; status: VendorEngagementStatus },
  b: { dispatchedAt: Date | null; createdAt: Date; staleAfterHours: number }
) {
  if (e.lastReplyAt) return false
  if (!["SENT", "DELIVERED", "OPENED", "QUEUED"].includes(e.status)) return false
  const base = b.dispatchedAt ?? b.createdAt
  return Date.now() > base.getTime() + b.staleAfterHours * 60 * 60 * 1000
}

export function ProjectVendorsPanel({
  broadcasts,
  winnerLabel,
}: {
  broadcasts: BroadcastBlock[]
  winnerLabel: string | null
}) {
  if (broadcasts.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center">
        <p className="text-sm text-muted-foreground">No vendor emails sent yet.</p>
        <a href="?step=broadcast" className="mt-3 inline-block text-sm font-medium text-brand-ink underline-offset-4 hover:underline">
          Go to step 3 — Email vendors →
        </a>
      </section>
    )
  }

  return (
    <div className="space-y-8">
      {winnerLabel ? (
        <p className="rounded-lg border border-brand/30 bg-brand/10 px-4 py-3 text-sm">
          <strong>Selected vendor:</strong> {winnerLabel}
        </p>
      ) : null}

      {broadcasts.map((b) => (
        <section key={b.id} className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-medium">{b.subject}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Sent {b.createdAt.toLocaleString()} · {b.engagements.length} recipient{b.engagements.length === 1 ? "" : "s"}
          </p>

          <ul className="mt-6 space-y-3">
            {b.engagements.map((e) => {
              const stale = engagementIsStale(e, b)
              const tone = engagementStatusTone(e.status)
              const opened = e.openCount > 0
              return (
                <li
                  key={e.id}
                  className="flex flex-col gap-3 rounded-lg border border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{formatContactName(e)}</p>
                    <p className="truncate text-xs text-muted-foreground">{e.email}</p>
                    {e.avgRating != null ? (
                      <p className="mt-1 text-xs text-muted-foreground" aria-label={`${e.avgRating} out of 5 stars`}>
                        {"★".repeat(Math.round(e.avgRating))}
                        <span className="opacity-30">{"★".repeat(5 - Math.round(e.avgRating))}</span>
                        <span className="ml-1 tabular-nums">({e.avgRating.toFixed(1)})</span>
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider",
                        tone === "good" && "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
                        tone === "warn" && "bg-amber-500/15 text-amber-800 dark:text-amber-200",
                        tone === "bad" && "bg-destructive/15 text-destructive",
                        tone === "neutral" && "bg-muted text-muted-foreground"
                      )}
                    >
                      {ENGAGEMENT_STATUS_LABELS[e.status]}
                    </span>
                    {opened ? (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {e.openCount} open{e.openCount === 1 ? "" : "s"}
                        {e.lastOpenedAt ? ` · ${e.lastOpenedAt.toLocaleString()}` : ""}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Not opened yet</span>
                    )}
                    {stale ? (
                      <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] uppercase text-amber-800 dark:text-amber-200">
                        No reply yet
                      </span>
                    ) : null}
                    <Link
                      href={`/admin/crm/contacts/${e.contactId}`}
                      className="text-[10px] uppercase tracking-wider text-brand-ink hover:underline"
                    >
                      Profile
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>

          {!b.refusalBatchSentAt ? (
            <div className="mt-6 border-t border-border pt-6">
              <p className="text-sm font-medium">Choose who won this job</p>
              <p className="mt-1 text-xs text-muted-foreground">
                We email everyone else a polite pass automatically.
              </p>
              <WinnerPicker
                broadcastId={b.id}
                engagements={b.engagements.map((e) => ({
                  id: e.id,
                  contactId: e.contactId,
                  email: e.email,
                  status: e.status,
                  openCount: e.openCount,
                  lastOpenedAt: e.lastOpenedAt,
                }))}
              />
            </div>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">Winner recorded — pass emails were sent.</p>
          )}
        </section>
      ))}
    </div>
  )
}
