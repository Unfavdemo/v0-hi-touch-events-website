/**
 * Canonical origin for metadataBase, sitemap, robots, and JSON-LD.
 * Set `NEXT_PUBLIC_SITE_URL` in production (e.g. https://hitouchinc.com).
 */
export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, "")
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`
  return "http://localhost:3000"
}

/** Safe for `metadata.metadataBase` in `app/layout.jsx`. */
export function getMetadataBase() {
  return new URL(`${getSiteUrl()}/`)
}
