"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { createVendorBroadcast } from "@/lib/actions/vendor"

export function BroadcastForm({
  projectId,
  projectName,
  categoryKeys,
  nextStepHref,
}: {
  projectId: string
  projectName: string
  categoryKeys: { key: string; label: string; count: number }[]
  nextStepHref?: string
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const defaultSubject = `Opportunity: ${projectName}`

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-display text-lg uppercase tracking-tight">Email vendors</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose a vendor type, write your message, and send. Everyone with that skill tag gets the email. Opens are tracked automatically.
      </p>

      <form
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          start(async () => {
            const categoryKey = String(fd.get("categoryKey") ?? "")
            const subject = String(fd.get("subject") ?? "")
            const message = String(fd.get("message") ?? "").trim()
            const bodyHtml = message.includes("<") ? message : `<p>${message.replace(/\n/g, "</p><p>")}</p>`
            await createVendorBroadcast({ projectId, categoryKey, subject, bodyHtml })
            router.refresh()
            if (nextStepHref) router.push(nextStepHref)
          })
        }}
      >
        <div>
          <label className="text-sm font-medium">Vendor type</label>
          <select
            name="categoryKey"
            required
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          >
            {categoryKeys.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label} ({c.count} contact{c.count === 1 ? "" : "s"})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Email subject</label>
          <input
            name="subject"
            required
            defaultValue={defaultSubject}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Your message</label>
          <p className="text-xs text-muted-foreground">Plain text is fine — we format it for email.</p>
          <textarea
            name="message"
            required
            rows={8}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            placeholder={`Hi,\n\nWe have an upcoming event (${projectName}) and would love to see if you're available…`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending || categoryKeys.every((c) => c.count === 0)}
            className="font-display rounded-full border-2 border-brand bg-brand px-8 py-3 text-[10px] uppercase tracking-[0.28em] text-brand-foreground disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send to vendors"}
          </button>
          {categoryKeys.every((c) => c.count === 0) ? (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Tag contacts with vendor skills under Contacts first.
            </p>
          ) : null}
        </div>
      </form>
    </section>
  )
}
