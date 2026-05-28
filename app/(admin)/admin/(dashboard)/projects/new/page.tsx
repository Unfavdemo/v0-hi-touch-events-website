import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { createEventProject } from "@/lib/actions/projects"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "New project | Admin",
  robots: { index: false, follow: false },
}

export default async function NewProjectPage() {
  let hiTouchClients: { id: string; name: string }[] = []
  if (process.env.DATABASE_URL) {
    try {
      hiTouchClients = await prisma.hiTouchClient.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
    } catch {
      hiTouchClients = []
    }
  }

  return (
    <main id="admin-main" className="mx-auto max-w-2xl p-6 md:p-10">
      <Link href="/admin/projects" className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground hover:text-brand-ink">
        ← All projects
      </Link>
      <h1 className="font-display mt-6 text-3xl font-normal uppercase tracking-tight">Create new project</h1>
      <p className="mt-2 text-sm text-muted-foreground">Fill in the basics — you can add vendors and budget on the next screens.</p>

      <form action={createEventProject} className="mt-8 space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div>
          <label className="text-sm font-medium">Event name</label>
          <input
            name="name"
            required
            placeholder="e.g. Summer party for Google Cloud"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium">Indoor or outdoor?</legend>
          <div className="mt-2 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="venueType" value="INDOOR" className="accent-brand" /> Indoor
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="venueType" value="OUTDOOR" className="accent-brand" /> Outdoor
            </label>
          </div>
        </fieldset>

        <div>
          <label className="text-sm font-medium">Location</label>
          <input
            name="location"
            placeholder="e.g. Sony Pictures Studios"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Starts</label>
            <input type="datetime-local" name="startsAt" className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Ends</label>
            <input type="datetime-local" name="endsAt" className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Guest count</label>
          <input name="guestCount" type="number" min={0} placeholder="150" className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium">Client (optional)</label>
          <select name="hiTouchClientId" className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
            <option value="__none__">— None —</option>
            {hiTouchClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Notes</label>
          <textarea name="notes" rows={3} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium">Budget (USD, optional)</label>
          <input name="budgetUsd" placeholder="50000" className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
        </div>

        <button
          type="submit"
          className="font-display w-full rounded-full border-2 border-brand bg-brand py-3.5 text-[10px] uppercase tracking-[0.28em] text-brand-foreground"
        >
          Add project
        </button>
      </form>
    </main>
  )
}
