"use client"

import { useState, useTransition } from "react"
import { inviteContactToPortal } from "@/lib/actions/portal-invite"

export type PortalKindOption = "CLIENT" | "VENDOR"

export function PortalInviteForm({
  contactId,
  existingKind,
}: {
  contactId: string
  existingKind: PortalKindOption | null
}) {
  const [pending, start] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function invite(kind: PortalKindOption) {
    start(async () => {
      setError(null)
      setMessage(null)
      try {
        await inviteContactToPortal(contactId, kind)
        setMessage(`Invitation sent (${kind === "VENDOR" ? "vendor" : "client"} portal).`)
      } catch {
        setError("Could not send invitation.")
      }
    })
  }

  return (
    <div className="mt-4 rounded-lg border border-border p-4">
      <h3 className="font-display text-xs uppercase tracking-[0.28em] text-brand-ink">Portal access</h3>
      {existingKind ? (
        <p className="mt-2 text-sm text-muted-foreground">Active portal: {existingKind.toLowerCase()}</p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Send a magic-link invite to this contact&apos;s email.</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => invite("CLIENT")}
          className="font-display rounded-full border border-border px-4 py-2 text-[9px] uppercase tracking-[0.2em] hover:border-brand disabled:opacity-50"
        >
          Invite as client
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => invite("VENDOR")}
          className="font-display rounded-full border border-border px-4 py-2 text-[9px] uppercase tracking-[0.2em] hover:border-brand disabled:opacity-50"
        >
          Invite as vendor
        </button>
      </div>
      {message ? <p className="mt-2 text-xs text-muted-foreground">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
