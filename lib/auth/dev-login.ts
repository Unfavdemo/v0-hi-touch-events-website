import { prisma } from "@/lib/prisma"
import { canAccessAdminEmail } from "@/lib/auth/allowlist"
import { isDevPasswordLoginEnabled } from "@/lib/auth/env"

export type DevLoginResult =
  | { ok: true; userId: string; email: string; name: string }
  | { ok: false; message: string }

/** Shared by server action (clear errors) and Credentials `authorize`. */
export async function validateDevLogin(email: string, password: string): Promise<DevLoginResult> {
  if (!isDevPasswordLoginEnabled()) {
    return {
      ok: false,
      message: "Dev sign-in is off. Set AUTH_DEV_PASSWORD in `.env`, then restart `npm run dev`.",
    }
  }

  const devPassword = process.env.AUTH_DEV_PASSWORD!.trim()
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedPassword = password.trim()

  if (!normalizedEmail) {
    return { ok: false, message: "Enter your email address." }
  }
  if (!canAccessAdminEmail(normalizedEmail)) {
    return {
      ok: false,
      message:
        "That email is not allowlisted. Add it to ADMIN_BOOTSTRAP_EMAILS (or ADMIN_TEST_EMAILS), or set AUTH_DEV_ALLOW_ANY_GOOGLE=true.",
    }
  }
  if (normalizedPassword !== devPassword) {
    return {
      ok: false,
      message:
        "Password does not match AUTH_DEV_PASSWORD in `.env`. Copy it exactly, then restart `npm run dev` after any `.env` change.",
    }
  }

  try {
    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      create: { email: normalizedEmail, name: normalizedEmail.split("@")[0] ?? "Admin" },
      update: {},
    })
    if (!user.email) {
      return { ok: false, message: "Could not create user record in the database." }
    }
    return {
      ok: true,
      userId: user.id,
      email: user.email,
      name: user.name ?? normalizedEmail,
    }
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown database error"
    return {
      ok: false,
      message: `Database error: ${detail}. Check DATABASE_URL and run \`npm run db:push\`.`,
    }
  }
}

export function firstBootstrapEmail(): string {
  const raw = process.env.ADMIN_BOOTSTRAP_EMAILS ?? process.env.ADMIN_TEST_EMAILS ?? ""
  return raw.split(",")[0]?.trim().toLowerCase() ?? ""
}
