"use client"

import { useState, useTransition } from "react"
import { requestPortalMagicLink } from "@/lib/actions/portal-login"

export function PortalLoginForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  return (
    <form
      className="mx-auto mt-10 max-w-md space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => {
          setError(null)
          setMessage(null)
          const res = await requestPortalMagicLink(email)
          if (!res.ok) {
            setError(res.error)
            return
          }
          setMessage("If your email is on file, you will receive a sign-in link shortly.")
        })
      }}
    >
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="you@company.com"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="font-display w-full rounded-full border-2 border-brand bg-brand/10 py-3 text-[10px] uppercase tracking-[0.22em] disabled:opacity-50"
      >
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  )
}
