import type { Provider } from "next-auth/providers"
import { sendTransactionalEmail } from "@/lib/email/transactional"

export function createEmailProvider(): Provider {
  const from = process.env.RESEND_FROM_EMAIL?.trim() ?? "HiTouch <onboarding@resend.dev>"
  return {
    id: "email",
    name: "Email",
    type: "email",
    from,
    maxAge: 24 * 60 * 60,
    async sendVerificationRequest({ identifier: email, url }) {
      await sendTransactionalEmail({
        to: email,
        subject: "Your HiTouch sign-in link",
        html: `<p>Click the link below to sign in. This link expires in 24 hours.</p>
<p><a href="${url}">Sign in to HiTouch</a></p>
<p>If you did not request this, you can ignore this email.</p>`,
        from,
      })
    },
  }
}
