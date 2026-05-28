"use client"

import Link from "next/link"

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main id="admin-main" className="mx-auto max-w-lg p-10">
      <h1 className="font-display text-2xl uppercase tracking-tight">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This page hit an unexpected error. Your data is usually fine — try again, or go back to the dashboard.
      </p>
      {process.env.NODE_ENV === "development" ? (
        <pre className="mt-6 max-h-40 overflow-auto rounded-md border border-border bg-muted/30 p-3 text-xs">{error.message}</pre>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="font-display rounded-full border-2 border-brand bg-brand px-5 py-2 text-[10px] uppercase tracking-[0.28em] text-brand-foreground"
        >
          Try again
        </button>
        <Link href="/admin" className="rounded-full border border-border px-5 py-2 text-sm hover:bg-muted">
          Dashboard
        </Link>
      </div>
    </main>
  )
}
