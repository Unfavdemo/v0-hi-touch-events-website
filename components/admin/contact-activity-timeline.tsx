import { createContactActivity } from "@/lib/actions/activities"

const KINDS = [
  { value: "NOTE", label: "Note" },
  { value: "CALL", label: "Call" },
  { value: "EMAIL", label: "Email" },
  { value: "MEETING", label: "Meeting" },
  { value: "SYSTEM", label: "System" },
] as const

export function ContactActivityTimeline({
  contactId,
  activities,
}: {
  contactId: string
  activities: {
    id: string
    kind: string
    body: string
    occurredAt: Date
    createdByEmail: string | null
  }[]
}) {
  return (
    <section className="mt-12 max-w-2xl">
      <h2 className="font-display text-sm uppercase tracking-[0.28em] text-brand-ink">Activity timeline</h2>
      <p className="mt-1 text-xs text-muted-foreground">Internal only — not visible on client or vendor portals.</p>
      <form action={createContactActivity.bind(null, contactId)} className="mt-4 space-y-3 rounded-lg border border-border p-4">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Type</label>
            <select name="kind" defaultValue="NOTE" className="mt-1 block rounded border border-border bg-background px-2 py-1.5 text-sm">
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Internal note</label>
          <textarea name="body" required rows={3} className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm" />
        </div>
        <button type="submit" className="font-display rounded-full border-2 border-brand px-4 py-2 text-[10px] uppercase tracking-[0.2em]">
          Add entry
        </button>
      </form>
      <ul className="mt-6 space-y-3">
        {activities.length === 0 ? (
          <li className="text-sm text-muted-foreground">No timeline entries yet.</li>
        ) : (
          activities.map((a) => (
            <li key={a.id} className="rounded border border-border px-4 py-3 text-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {a.kind} · {a.occurredAt.toLocaleString()}
                {a.createdByEmail ? ` · ${a.createdByEmail}` : ""}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-foreground/90">{a.body}</p>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
