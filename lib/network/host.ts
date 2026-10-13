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

/** Exact pretty paths on the test host → internal `/network/...` app paths. */
export const NETWORK_REWRITE_MAP: Record<string, string> = {
  "/": "/network/login",
  "/login": "/network/login",
  "/pending": "/network/pending",
  "/membership-required": "/network/membership-required",
  "/set-password": "/network/set-password",
}

/**
 * Pretty paths on the test host → internal `/network/...` app paths.
 * Leaves existing `/network/*` paths alone (no double prefix).
 */
export function rewriteNetworkPath(pathname: string): string | null {
  if (NETWORK_REWRITE_MAP[pathname]) return NETWORK_REWRITE_MAP[pathname]

  // Already an internal network path — do not rewrite again
  if (pathname === "/network" || pathname.startsWith("/network/")) {
    return null
  }

  const prefixes = [
    "/admin",
    "/freelancer",
    "/partner",
    "/join",
    "/legal",
  ] as const

  for (const prefix of prefixes) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return `/network${pathname}`
    }
  }

  // Network-specific APIs (avoid colliding with Events /api/*)
  if (
    pathname.startsWith("/api/vendor-documents") ||
    pathname.startsWith("/api/vendor-w9") ||
    pathname.startsWith("/api/webhooks/stripe")
  ) {
    return `/network${pathname}`
  }

  return null
}
