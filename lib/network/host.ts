/**
 * Host helpers for the Solutions member-network surface on the `test.` subdomain.
 */

export function isNetworkTestHost(hostHeader: string | null | undefined): boolean {
  const host = (hostHeader ?? "").split(":")[0].toLowerCase()
  if (!host) return false

  const configured = process.env.NETWORK_TEST_HOST?.trim().toLowerCase()
  if (configured) {
    const configuredHost = configured.replace(/^https?:\/\//, "").split("/")[0].split(":")[0]
    if (host === configuredHost) return true
  }

  // Local smoke: test.localhost:3000 or Host: test.localhost
  if (host === "test.localhost" || host.startsWith("test.localhost.")) return true
  if (host.startsWith("test.")) return true

  // Opt-in for local path testing without host rewrite
  if (process.env.NETWORK_FORCE_ENABLE === "1") return true

  return false
}

/** Pretty paths on the test host → internal `/network/...` app paths. */
export const NETWORK_REWRITE_MAP: Record<string, string> = {
  "/": "/network/login",
  "/network/login": "/network/login",
  "/network/admin/login": "/network/login",
  "/network/pending": "/network/pending",
  "/network/membership-required": "/network/membership-required",
}

export function rewriteNetworkPath(pathname: string): string | null {
  if (NETWORK_REWRITE_MAP[pathname]) return NETWORK_REWRITE_MAP[pathname]

  const prefixes = [
    "/network/admin",
    "/network/freelancer",
    "/network/partner",
    "/network/join",
    "/network/legal",
  ] as const

  for (const prefix of prefixes) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return `/network${pathname}`
    }
  }

  // Network-specific APIs (avoid colliding with Events /api/*)
  if (
    pathname.startsWith("/network/api/vendor-documents") ||
    pathname.startsWith("/network/api/vendor-w9") ||
    pathname.startsWith("/network/api/webhooks/stripe")
  ) {
    return `/network${pathname}`
  }

  return null
}
