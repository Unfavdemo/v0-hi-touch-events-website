import { getSiteUrl } from "@/lib/site-url"

/** @returns {import('next').MetadataRoute.Robots} */
export default function robots() {
  const base = getSiteUrl()
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
    host: new URL(base).host,
  }
}
