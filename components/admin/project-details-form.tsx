import type { EventProjectStatus, EventVenueType } from "@/lib/generated/prisma/client"
import { updateEventProject } from "@/lib/actions/projects"
import { toDatetimeLocalValue } from "@/lib/datetime-local"
import { PROJECT_STATUS_LABELS } from "@/lib/project-workflow"

export function ProjectDetailsForm({
  project,
  hiTouchClients,
  nextStepHref,
}: {
  project: {
    id: string
    name: string
    location: string | null
    venueType: EventVenueType | null
    guestCount: number | null
    status: EventProjectStatus
    notes: string | null
    startsAt: Date | null
    endsAt: Date | null
    hiTouchClientId: string | null
  }
  hiTouchClients: { id: string; name: string }[]
  nextStepHref?: string
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-display text-lg uppercase tracking-tight">Event details</h2>
      <p className="mt-1 text-sm text-muted-foreground">Start here — you can change these anytime.</p>

      <form action={updateEventProject.bind(null, project.id)} className="mt-6 space-y-5">
        <div>
          <label className="text-sm font-medium">Event name</label>
          <input
            name="name"
            required
            defaultValue={project.name}
            placeholder="e.g. Summer party for Google Cloud"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Client (HiTouch account)</label>
          <select
            name="hiTouchClientId"
            defaultValue={project.hiTouchClientId ?? "__none__"}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          >
            <option value="__none__">— No client linked —</option>
            {hiTouchClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="text-sm font-medium">Indoor or outdoor?</legend>
          <div className="mt-2 flex flex-wrap gap-4">
            {(
              [
                ["INDOOR", "Indoor"],
                ["OUTDOOR", "Outdoor"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="venueType"
                  value={value}
                  defaultChecked={project.venueType === value}
                  className="accent-brand"
                />
                {label}
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input
                type="radio"
                name="venueType"
                value=""
                defaultChecked={!project.venueType}
                className="accent-brand"
              />
              Not sure yet
            </label>
          </div>
        </fieldset>

        <div>
          <label className="text-sm font-medium">Venue / location</label>
          <input
            name="location"
            defaultValue={project.location ?? ""}
            placeholder="e.g. Sony Pictures Studios"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Event starts</label>
            <input
              type="datetime-local"
              name="startsAt"
              defaultValue={toDatetimeLocalValue(project.startsAt)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Event ends</label>
            <input
              type="datetime-local"
              name="endsAt"
              defaultValue={toDatetimeLocalValue(project.endsAt)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Guest count (estimate)</label>
            <input
              name="guestCount"
              type="number"
              min={0}
              defaultValue={project.guestCount ?? ""}
              placeholder="e.g. 150"
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Project status</label>
            <select
              name="status"
              defaultValue={project.status}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            >
              {(Object.keys(PROJECT_STATUS_LABELS) as EventProjectStatus[]).map((s) => (
                <option key={s} value={s}>
                  {PROJECT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Notes for your team</label>
          <textarea
            name="notes"
            rows={4}
            defaultValue={project.notes ?? ""}
            placeholder="Anything the team should know about this event…"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            className="font-display rounded-full border-2 border-brand bg-brand px-6 py-2.5 text-[10px] uppercase tracking-[0.28em] text-brand-foreground transition-colors hover:bg-brand/90"
          >
            Save details
          </button>
          {nextStepHref ? (
            <a
              href={nextStepHref}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-brand-ink hover:underline"
            >
              Next: Budget →
            </a>
          ) : null}
        </div>
      </form>
    </section>
  )
}
