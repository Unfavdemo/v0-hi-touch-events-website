"use server"

import { prisma } from "@/lib/prisma"
import { canAccessAdminEmail } from "@/lib/auth/allowlist"
import { signIn } from "@/auth"

export type PortalLoginResult = { ok: true } | { ok: false; error: string }

export async function requestPortalMagicLink(emailRaw: string): Promise<PortalLoginResult> {
  const email = emailRaw.trim().toLowerCase()
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email address." }
  }

  if (canAccessAdminEmail(email)) {
    return { ok: false, error: "Use the admin sign-in page for staff accounts." }
  }

  if (!process.env.DATABASE_URL) {
    return { ok: false, error: "Sign-in is temporarily unavailable." }
  }

  const since = new Date(Date.now() - 15 * 60 * 1000)
  const recent = await prisma.verificationToken.count({
    where: { identifier: email, expires: { gte: since } },
  })
  if (recent >= 5) {
    return { ok: false, error: "Too many requests. Please wait before trying again." }
  }

  const contact = await prisma.contact.findUnique({ where: { email } })
  if (!contact) {
    return { ok: true }
  }

  const portal = await prisma.portalAccount.findFirst({
    where: { contactId: contact.id, enabled: true },
  })
  if (!portal) {
    return { ok: true }
  }

  const redirectTo = portal.kind === "VENDOR" ? "/portal/vendor" : "/portal/client"
  try {
    await signIn("email", { email, redirectTo, redirect: false })
  } catch {
    // NextAuth may throw on redirect
  }

  return { ok: true }
}
