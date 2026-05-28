/**
 * Minimal transactional email via Resend (optional — skips when `RESEND_API_KEY` unset).
 */
export async function sendTransactionalEmail(params: {
  to: string
  subject: string
  html: string
  from?: string
}): Promise<{ id: string } | null> {
  const key = process.env.RESEND_API_KEY?.trim()
  const from = params.from ?? process.env.RESEND_FROM_EMAIL?.trim() ?? "HiTouch <onboarding@resend.dev>"
  if (!key) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email] skip send (no RESEND_API_KEY)", params.to, params.subject)
    }
    return null
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Resend error: ${res.status} ${text}`)
  }
  const data = (await res.json()) as { id?: string }
  return data.id ? { id: data.id } : null
}
