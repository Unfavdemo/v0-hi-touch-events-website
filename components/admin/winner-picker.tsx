"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { markVendorWinner } from "@/lib/actions/vendor"

function formatOpenedAt(value: string | Date | null | undefined) {
  if (!value) return ""
  const d = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleString()
}

export function WinnerPicker({
  broadcastId,
  engagements,
}: {
  broadcastId: string
  engagements: {
    id: string
    contactId: string
    email: string
    status: string
    openCount: number
    /** Serialized as ISO string when passed from a Server Component */
    lastOpenedAt: string | Date | null
  }[]
}) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Select winner</span>
      {engagements.map((e) => {
        const last = formatOpenedAt(e.lastOpenedAt)
        const openHint =
          e.openCount > 0
            ? `${e.openCount} tracked open(s)${last ? `, last ${last}` : ""}`
            : "No opens tracked yet (images off or privacy proxy)"
        return (
          <button
            key={e.id}
            type="button"
            title={openHint}
            disabled={pending || e.status === "SELECTED_WINNER" || e.status === "NOT_SELECTED"}
            onClick={() => {
              start(async () => {
                await markVendorWinner(broadcastId, e.contactId)
                router.refresh()
              })
            }}
            className="rounded-full border border-border px-3 py-1 text-xs transition-colors hover:border-brand disabled:opacity-40"
          >
            <span className="block truncate max-w-[220px]">{e.email}</span>
            {e.openCount > 0 ? (
              <span className="mt-0.5 block text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
                {e.openCount} open{e.openCount === 1 ? "" : "s"}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
