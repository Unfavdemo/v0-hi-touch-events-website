import { prisma } from "@/lib/prisma"
import { featuredProjects } from "@/lib/site"
import { getSiteUrl } from "@/lib/site-url"

const STATIC_PATHS = [
  "/",
  "/about-us",
  "/contact",
  "/intake",
  "/meet-the-team",
  "/founders-story",
  "/featured-work",
  "/event-strategy",
  "/technical-production",
  "/stage-design",
  "/logistics",
]

export default async function sitemap() {
  const base = getSiteUrl()
  const lastModified = new Date()

  const staticEntries = STATIC_PATHS.map((path) => ({
    url: path === "/" ? `${base}/` : `${base}${path}`,
    lastModified,
    changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "/" ? 1 : 0.75,
  }))

  let dbSlugs: string[] = []
  if (process.env.DATABASE_URL) {
    try {
      const rows = await prisma.caseStudy.findMany({
        where: { published: true },
        select: { slug: true },
      })
      dbSlugs = rows.map((r) => r.slug)
    } catch {
      dbSlugs = []
    }
  }

  const slugSet = new Set(dbSlugs.length > 0 ? dbSlugs : featuredProjects.map((p) => p.slug))

  const caseStudies = [...slugSet].map((slug) => ({
    url: `${base}/featured-work/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }))

  return [...staticEntries, ...caseStudies]
}
