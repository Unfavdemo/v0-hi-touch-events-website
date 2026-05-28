"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { approvePendingSubmission, declinePendingSubmission, markPendingSpam } from "@/lib/actions/pending"
import styles from "./pending-intake-actions.module.css"

export function PendingRow({
  submission,
  hiTouchClients,
  canModerate = true,
}: {
  canModerate?: boolean
  submission: {
    id: string
    fullName: string
    email: string
    organization: string | null
    message: string | null
    categories: string[]
    createdAt: string
  }
  hiTouchClients: { id: string; name: string }[]
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()

  function toggleClient(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }))
  }

  const moderationButtons = (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null)
            try {
              const ids = Object.entries(selected)
                .filter(([, v]) => v)
                .map(([k]) => k)
              await approvePendingSubmission(submission.id, ids)
              router.refresh()
            } catch {
              setError("Could not approve.")
            }
          })
        }
        className={styles.btnApprove}
      >
        Approve
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null)
            try {
              await declinePendingSubmission(submission.id)
              router.refresh()
            } catch {
              setError("Could not decline.")
            }
          })
        }
        className={styles.btnDecline}
      >
        Decline
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null)
            try {
              await markPendingSpam(submission.id)
              router.refresh()
            } catch {
              setError("Could not mark spam.")
            }
          })
        }
        className={styles.btnSpam}
      >
        Spam
      </button>
    </>
  )

  return (
    <li className="rounded-lg border border-border bg-card/30 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-foreground">{submission.fullName}</p>
          <p className="truncate text-sm text-muted-foreground">{submission.email}</p>
          {submission.organization ? (
            <p className="text-sm text-muted-foreground">{submission.organization}</p>
          ) : null}
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {submission.categories.join(" · ")}
          </p>
          {submission.message ? (
            <p className="mt-2 line-clamp-4 text-sm text-foreground/90">{submission.message}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">{submission.createdAt}</p>
        </div>
        <div className="flex min-w-[240px] flex-col gap-3">
          {canModerate && hiTouchClients.length > 0 ? (
            <div className={styles.tagPanel}>
              <p className={styles.tagPanelTitle}>Tag on approve</p>
              <ul className={styles.tagList}>
                {hiTouchClients.map((c) => (
                  <li key={c.id}>
                    <label className={styles.tagRow}>
                      <input
                        type="checkbox"
                        className={styles.tagCheckbox}
                        checked={Boolean(selected[c.id])}
                        onChange={() => toggleClient(c.id)}
                      />
                      <span className={styles.tagCheckVisual} aria-hidden />
                      <span className={styles.tagLabel}>{c.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className={styles.panelFooter}>
                <div className={styles.actionRow}>{moderationButtons}</div>
              </div>
            </div>
          ) : null}
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          {canModerate && hiTouchClients.length === 0 ? <div className={styles.actionRow}>{moderationButtons}</div> : null}
        </div>
      </div>
    </li>
  )
}
