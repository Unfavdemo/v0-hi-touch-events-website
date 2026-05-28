"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { markNotificationRead } from "@/lib/actions/notifications"

export function MarkNotificationReadButton({ id }: { id: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await markNotificationRead(id)
          router.refresh()
        })
      }
      className="mt-2 text-[10px] uppercase tracking-[0.2em] text-brand-ink hover:underline disabled:opacity-50"
    >
      Mark read
    </button>
  )
}
