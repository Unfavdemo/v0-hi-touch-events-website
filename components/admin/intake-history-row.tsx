import { PendingStatus } from "@/lib/generated/prisma/client"

const statusLabel: Record<PendingStatus, string> = {
  [PendingStatus.PENDING]: "Pending",
  [PendingStatus.APPROVED]: "Approved",
  [PendingStatus.DECLINED]: "Declined",
  [PendingStatus.SPAM]: "Spam",
}

const statusClass: Record<PendingStatus, string> = {
  [PendingStatus.PENDING]: "bg-muted text-muted-foreground",
  [PendingStatus.APPROVED]: "bg-brand/15 text-brand-ink",
  [PendingStatus.DECLINED]: "bg-destructive/10 text-destructive",
  [PendingStatus.SPAM]: "bg-amber-500/15 text-amber-900 dark:text-amber-200",
}

export function IntakeHistoryRow({
  submission,
}: {
  submission: {
    fullName: string
    email: string
    organization: string | null
    message: string | null
    categories: string[]
    status: PendingStatus
    createdAt: string
    reviewedAt: string | null
    reviewedByEmail: string | null
  }
}) {
  return (
    <li className="rounded-lg border border-border bg-muted/10 p-5 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-medium">{submission.fullName}</p>
          <p className="text-muted-foreground">{submission.email}</p>
          {submission.organization ? <p className="text-muted-foreground">{submission.organization}</p> : null}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] ${statusClass[submission.status]}`}
        >
          {statusLabel[submission.status]}
        </span>
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {submission.categories.join(" · ")}
      </p>
      {submission.message ? <p className="mt-2 line-clamp-3 text-foreground/90">{submission.message}</p> : null}
      <dl className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
        <div>
          <dt className="inline">Submitted: </dt>
          <dd className="inline">{submission.createdAt}</dd>
        </div>
        {submission.reviewedAt ? (
          <div>
            <dt className="inline">Reviewed: </dt>
            <dd className="inline">
              {submission.reviewedAt}
              {submission.reviewedByEmail ? ` · ${submission.reviewedByEmail}` : ""}
            </dd>
          </div>
        ) : null}
      </dl>
    </li>
  )
}
