"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { recordVendorProposalReplyFromPortal } from "@/lib/actions/vendor"

type Row = {
  id: string
  status: string
  lastOpenedAt: Date | null
  lastReplyAt: Date | null
  createdAt: Date
  subject: string
  projectName: string
  categoryLabel: string
  proposalToken: string | null
}

export function VendorInbox({ engagements }: { engagements: Row[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [pending, start] = useTransition()
  const [feedback, setFeedback] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {engagements.length === 0 ? (
        <p className="text-sm text-muted-foreground">No opportunities yet.</p>
      ) : (
        engagements.map((e) => (
          <article key={e.id} className="rounded-lg border border-border p-4">
            <p className="font-medium">{e.subject}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {e.projectName} · {e.categoryLabel} · {e.status}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {e.lastReplyAt
                ? `Replied ${e.lastReplyAt.toLocaleString()}`
                : e.lastOpenedAt
                  ? `Opened ${e.lastOpenedAt.toLocaleString()}`
                  : `Sent ${e.createdAt.toLocaleString()}`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {e.proposalToken ? (
                <Link
                  href={`/vendor-proposal/${e.proposalToken}`}
                  className="text-xs text-brand-ink hover:underline"
                >
                  Open full page
                </Link>
              ) : null}
              {!e.lastReplyAt ? (
                <button
                  type="button"
                  className="text-xs text-brand-ink hover:underline"
                  onClick={() => {
                    setExpandedId(expandedId === e.id ? null : e.id)
                    setMessage("")
                    setFeedback(null)
                  }}
                >
                  {expandedId === e.id ? "Cancel" : "Reply here"}
                </button>
              ) : null}
            </div>
            {expandedId === e.id ? (
              <form
                className="mt-4 space-y-2"
                onSubmit={(ev) => {
                  ev.preventDefault()
                  start(async () => {
                    try {
                      await recordVendorProposalReplyFromPortal(e.id, message)
                      setFeedback("Response sent.")
                      setExpandedId(null)
                    } catch {
                      setFeedback("Could not send response.")
                    }
                  })
                }}
              >
                <textarea
                  value={message}
                  onChange={(ev) => setMessage(ev.target.value)}
                  required
                  rows={4}
                  className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
                  placeholder="Your availability, rate, questions…"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="font-display rounded-full border-2 border-brand px-4 py-2 text-[10px] uppercase tracking-[0.2em] disabled:opacity-50"
                >
                  Submit
                </button>
              </form>
            ) : null}
          </article>
        ))
      )}
      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}
    </div>
  )
}
