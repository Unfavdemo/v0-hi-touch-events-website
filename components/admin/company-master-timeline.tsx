import type { TimelineItem } from "@/lib/queries/company-timeline"

const SOURCE_LABEL: Record<TimelineItem["source"], string> = {
  activity: "Activity",
  audit: "Audit",
  email: "Email",
  review: "Vendor review",
}

export function CompanyMasterTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="font-display text-sm uppercase tracking-[0.28em] text-brand-ink">Master timeline</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Aggregated touchpoints across all contacts at this company.
      </p>
      <ul className="mt-4 space-y-2">
        {items.length === 0 ? (
          <li className="text-sm text-muted-foreground">No timeline events yet.</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="rounded border border-border px-4 py-3 text-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {SOURCE_LABEL[item.source]} · {item.occurredAt.toLocaleString()}
              </p>
              <p className="mt-1 font-medium text-foreground">{item.title}</p>
              {item.body ? <p className="mt-1 text-muted-foreground line-clamp-3">{item.body}</p> : null}
              {item.source === "review" && typeof item.meta?.internalNotes === "string" ? (
                <p className="mt-2 rounded border border-dashed border-amber-500/40 bg-amber-500/5 px-2 py-1.5 text-xs text-muted-foreground">
                  <span className="font-medium uppercase tracking-wider text-amber-800 dark:text-amber-200">Internal: </span>
                  {item.meta.internalNotes}
                </p>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
