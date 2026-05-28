function parseEmailList(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

function explicitAllowlist(): string[] {
  return [
    ...parseEmailList(process.env.ADMIN_BOOTSTRAP_EMAILS),
    ...parseEmailList(process.env.ADMIN_TEST_EMAILS),
    ...parseEmailList(process.env.ADMIN_ALLOWLIST_EMAILS),
  ]
}

/**
 * Local-only: allow any Google account at /admin/login.
 * Requires `NODE_ENV=development` AND `AUTH_DEV_ALLOW_ANY_GOOGLE=true`.
 * Never enable in production.
 */
export function isDevGoogleSignInBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    (process.env.AUTH_DEV_ALLOW_ANY_GOOGLE === "true" || process.env.AUTH_DEV_ALLOW_ANY_GOOGLE === "1")
  )
}

/**
 * Admin access after Google OAuth:
 * - Emails in explicit allowlists (`ADMIN_BOOTSTRAP_EMAILS`, `ADMIN_TEST_EMAILS`, `ADMIN_ALLOWLIST_EMAILS`), OR
 * - Emails whose address ends with `ADMIN_EMAIL_DOMAIN` (default `@hitouchinc.com`).
 */
export function isAllowedAdminEmail(email: string): boolean {
  const lower = email.trim().toLowerCase()
  if (!lower) return false
  if (explicitAllowlist().includes(lower)) return true

  const rawDomain = (process.env.ADMIN_EMAIL_DOMAIN ?? "hitouchinc.com").trim().toLowerCase()
  const domain = rawDomain.startsWith("@") ? rawDomain.slice(1) : rawDomain
  if (!domain) return false
  return lower.endsWith(`@${domain}`)
}

/** Use after Google OAuth: includes dev bypass when enabled. */
export function canAccessAdminEmail(email: string): boolean {
  const lower = email.trim().toLowerCase()
  if (!lower) return false
  if (isDevGoogleSignInBypassEnabled()) return true
  return isAllowedAdminEmail(lower)
}
