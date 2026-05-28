"use client"

import { useActionState } from "react"
import { submitIntakeForm, type IntakeResult } from "@/lib/actions/intake"

const categories = [
  { value: "POTENTIAL_CLIENT", label: "Potential client" },
  { value: "POTENTIAL_VENDOR", label: "Potential production vendor" },
  { value: "SPONSOR", label: "Sponsor" },
  { value: "ATTENDEE_GUEST", label: "Attendee / guest" },
  { value: "PARTNER_OR_FUTURE_EMPLOYEE", label: "Partner / future employee" },
] as const

export function IntakeForm() {
  const [state, formAction] = useActionState(submitIntakeForm, undefined)

  return (
    <form action={formAction} className="mx-auto mt-10 max-w-xl space-y-6 text-left">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div>
        <label htmlFor="fullName" className="text-sm font-medium">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          required
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="phone" className="text-sm font-medium">
          Phone <span className="text-muted-foreground">(optional)</span>
        </label>
        <input id="phone" name="phone" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="organization" className="text-sm font-medium">
          Organization <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="organization"
          name="organization"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <p className="text-sm font-medium">How would you like to connect?</p>
        <p className="mt-1 text-xs text-muted-foreground">Select all that apply.</p>
        <ul className="mt-3 space-y-2">
          {categories.map((c) => (
            <li key={c.value}>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input type="checkbox" name="categories" value={c.value} className="mt-1" />
                <span>{c.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <label htmlFor="message" className="text-sm font-medium">
          Message <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      {state && !state.ok ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state?.ok ? (
        <p className="text-sm text-green-700 dark:text-green-400">
          Thank you — your request was received and will be reviewed by our team.
        </p>
      ) : null}

      <button
        type="submit"
        className="font-display w-full rounded-full border-2 border-brand bg-brand/10 py-3.5 text-[10px] font-normal uppercase tracking-[0.28em] transition-colors hover:bg-brand/20"
      >
        Submit
      </button>
    </form>
  )
}
