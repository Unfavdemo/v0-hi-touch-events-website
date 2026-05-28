"use client"

import { useState } from "react"

export function VendorProposalForm({ token }: { token: string }) {
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch(`/api/vendor-proposal/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      if (!res.ok) throw new Error("failed")
      setStatus("done")
    } catch {
      setStatus("error")
    }
  }

  if (status === "done") {
    return (
      <p className="mt-8 rounded-md border border-brand/30 bg-brand/5 px-4 py-3 text-sm">
        Thank you — your response was received. Our team will follow up if needed.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="message" className="text-sm font-medium">
          Your response
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={6}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Availability, rate, questions…"
        />
      </div>
      {status === "error" ? (
        <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
      ) : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="font-display rounded-full border-2 border-brand bg-brand/10 px-6 py-2 text-[10px] uppercase tracking-[0.22em] disabled:opacity-50"
      >
        {status === "loading" ? "Sending…" : "Submit response"}
      </button>
    </form>
  )
}
