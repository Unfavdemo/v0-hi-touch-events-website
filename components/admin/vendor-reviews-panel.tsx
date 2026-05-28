import { createVendorReview, deleteVendorReview } from "@/lib/actions/vendor-reviews"
import { GoogleReviewCard } from "@/components/reviews/google-review-card"
import { DEFAULT_VENDOR_REVIEWER_NAME, resolveReviewerName } from "@/lib/reviews/vendor-review"

export function VendorReviewsPanel({
  contactId,
  isSuperAdmin,
  reviews,
  projects,
  hiTouchClients,
}: {
  contactId: string
  isSuperAdmin: boolean
  reviews: {
    id: string
    rating: number
    headline: string | null
    body: string
    internalNotes: string | null
    reviewerName: string | null
    eventDate: Date | null
    createdAt: Date
    projectName: string | null
    clientName: string | null
  }[]
  projects: { id: string; name: string }[]
  hiTouchClients: { id: string; name: string }[]
}) {
  return (
    <section className="mt-12 max-w-2xl">
      <h2 className="font-display text-sm uppercase tracking-[0.28em] text-brand-ink">Vendor performance reviews</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Public reviews appear like Google reviews on the vendor portal. Staff notes stay internal only.
      </p>

      <form action={createVendorReview.bind(null, contactId)} className="mt-4 space-y-3 rounded-lg border border-border p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-muted-foreground">Rating (1–5)</label>
            <input name="rating" type="number" min={1} max={5} required defaultValue={5} className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Event date</label>
            <input name="eventDate" type="date" className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Reviewer name (shown publicly)</label>
          <input
            name="reviewerName"
            placeholder={DEFAULT_VENDOR_REVIEWER_NAME}
            className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Headline (optional)</label>
          <input name="headline" className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Public review</label>
          <p className="text-[10px] text-muted-foreground">Visible to the vendor — write like a Google review.</p>
          <textarea name="body" required rows={4} className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Internal notes (staff only)</label>
          <p className="text-[10px] text-muted-foreground">Never shown on client or vendor portals.</p>
          <textarea name="internalNotes" rows={3} className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-muted-foreground">Project</label>
            <select name="projectId" defaultValue="" className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm">
              <option value="">— None —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">HiTouch client</label>
            <select name="hiTouchClientId" defaultValue="" className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm">
              <option value="">— None —</option>
              {hiTouchClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="font-display rounded-full border-2 border-brand px-4 py-2 text-[10px] uppercase tracking-[0.2em]">
          Publish review
        </button>
      </form>

      <div className="mt-8 space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No vendor reviews yet.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="space-y-2">
              <GoogleReviewCard
                review={{
                  id: r.id,
                  rating: r.rating,
                  headline: r.headline,
                  body: r.body,
                  reviewerName: resolveReviewerName(r.reviewerName),
                  createdAt: r.createdAt,
                  eventDate: r.eventDate,
                  projectName: r.projectName,
                  clientName: r.clientName,
                }}
              />
              {r.internalNotes ? (
                <div className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-amber-800 dark:text-amber-200">
                    Internal notes — staff only
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{r.internalNotes}</p>
                </div>
              ) : null}
              {isSuperAdmin ? (
                <form action={deleteVendorReview.bind(null, r.id)}>
                  <button type="submit" className="text-xs text-destructive hover:underline">
                    Delete review
                  </button>
                </form>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
