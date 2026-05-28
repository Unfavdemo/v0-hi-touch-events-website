import { prisma } from "@/lib/prisma"
import { parseCaseStudyBody } from "@/lib/case-study-form"

export async function getCaseStudyFormDefaults(slug: string) {
  const row = await prisma.caseStudy.findUnique({ where: { slug } })
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    listDescription: row.listDescription,
    heroImageUrl: row.heroImageUrl,
    bodyText: parseCaseStudyBody(row.body).join("\n\n"),
    sortDate: row.sortDate.toISOString().slice(0, 10),
    published: row.published,
  }
}
