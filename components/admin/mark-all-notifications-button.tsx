"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { markAllNotificationsRead } from "@/lib/actions/notifications"

export function MarkAllNotificationsButton() {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await markAllNotificationsRead()
          router.refresh()
        })
      }
      className="font-display rounded-full border border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em] hover:border-brand disabled:opacity-50"
    >
      Mark all read
    </button>
  )
}
