/**
 * Runtime environment checks for deployment and local setup.
 * Call `assertCoreEnv()` from scripts or optional build hooks.
 */

export type EnvCheck = {
  key: string
  ok: boolean
  required: boolean
  hint?: string
}

export function checkCoreEnv(): EnvCheck[] {
  const checks: EnvCheck[] = [
    {
      key: "DATABASE_URL",
      ok: Boolean(process.env.DATABASE_URL?.trim()),
      required: true,
      hint: "PostgreSQL connection string (Neon-compatible).",
    },
    {
      key: "AUTH_SECRET",
      ok: Boolean(process.env.AUTH_SECRET?.trim()),
      required: true,
      hint: "NextAuth secret (`openssl rand -base64 32`).",
    },
    {
      key: "AUTH_GOOGLE_ID",
      ok: Boolean(
        process.env.AUTH_GOOGLE_ID?.trim() || process.env.GOOGLE_CLIENT_ID?.trim()
      ),
      required: process.env.NODE_ENV === "production",
      hint: "Google OAuth client ID for /admin/login.",
    },
    {
      key: "AUTH_GOOGLE_SECRET",
      ok: Boolean(
        process.env.AUTH_GOOGLE_SECRET?.trim() || process.env.GOOGLE_CLIENT_SECRET?.trim()
      ),
      required: process.env.NODE_ENV === "production",
      hint: "Google OAuth client secret.",
    },
    {
      key: "NEXT_PUBLIC_SITE_URL",
      ok: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
      required: false,
      hint: "Canonical site URL for email tracking and proposal links.",
    },
    {
      key: "RESEND_API_KEY",
      ok: Boolean(process.env.RESEND_API_KEY?.trim()),
      required: false,
      hint: "Transactional email (vendor broadcasts, refusals).",
    },
    {
      key: "CRON_SECRET",
      ok: Boolean(process.env.CRON_SECRET?.trim()),
      required: false,
      hint: "Bearer token for /api/cron/* routes.",
    },
  ]
  return checks
}

export function assertCoreEnv(): void {
  const failed = checkCoreEnv().filter((c) => c.required && !c.ok)
  if (failed.length === 0) return
  const lines = failed.map((f) => `  - ${f.key}: ${f.hint ?? "missing"}`)
  throw new Error(`Missing required environment variables:\n${lines.join("\n")}`)
}
