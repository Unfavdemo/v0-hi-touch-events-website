import { getSiteUrl } from "@/lib/site-url"

/** Absolute URL for a site path (leading slash). */
export function absoluteUrl(path) {
  const base = getSiteUrl().replace(/\/$/, "")
  if (!path || path === "/") return `${base}/`
  const p = path.startsWith("/") ? path : `/${path}`
  return `${base}${p}`
}

/**
 * Standard page metadata: canonical, Open Graph, Twitter.
 * @param {{ title: string, description: string, path: string, ogImage?: string }} opts
 */
export function buildPageMetadata({ title, description, path, ogImage = "/HiTouch_final.png" }) {
  const url = absoluteUrl(path)
  const imagePath = ogImage.startsWith("/") ? ogImage : `/${ogImage}`
  const imageUrl = absoluteUrl(imagePath)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "HiTouch Enterprises Inc.",
      locale: "en_US",
      images: [{ url: imageUrl, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  }
}
