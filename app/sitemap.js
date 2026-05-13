import { featuredProjects } from "@/lib/site"
import { getSiteUrl } from "@/lib/site-url"

const STATIC_PATHS = [
  "/",
  "/about-us",
  "/contact",
  "/meet-the-team",
  "/founders-story",
  "/featured-work",
  "/event-strategy",
  "/technical-production",
  "/stage-design",
  "/logistics",
]

/** @returns {import('next').MetadataRoute.Sitemap} */
export default function sitemap() {
  const base = getSiteUrl()
  const lastModified = new Date()

  const staticEntries = STATIC_PATHS.map((path) => ({
    url: path === "/" ? `${base}/` : `${base}${path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.75,
  }))

  const caseStudies = featuredProjects.map((p) => ({
    url: `${base}/featured-work/${p.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.65,
  }))

  return [...staticEntries, ...caseStudies]
}
