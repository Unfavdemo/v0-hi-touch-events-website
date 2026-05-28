import { prisma } from "@/lib/prisma"
import { featuredProjects, getProjectBySlug } from "@/lib/site"

export type CaseStudyCard = {
  slug: string
  title: string
  category: string
  listDescription: string
  image: string
  body: string[]
}

function staticToCard(p: (typeof featuredProjects)[number]): CaseStudyCard {
  return {
    slug: p.slug,
    title: p.title,
    category: p.category,
    listDescription: p.listDescription,
    image: p.image,
    body: p.body,
  }
}

function staticCards(): CaseStudyCard[] {
  return featuredProjects.map(staticToCard)
}

import { parseCaseStudyBody } from "@/lib/case-study-form"

export function mapDbCaseStudyToCard(row: {
  slug: string
  title: string
  category: string
  listDescription: string
  heroImageUrl: string
  body: unknown
}): CaseStudyCard {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    listDescription: row.listDescription,
    image: row.heroImageUrl,
    body: parseCaseStudyBody(row.body),
  }
}

async function tryDb<T>(fn: () => Promise<T>): Promise<T | null> {
  if (!process.env.DATABASE_URL) return null
  try {
    return await fn()
  } catch {
    return null
  }
}

/** Last N published case studies by `sortDate` (newest first). Falls back to static data. */
export async function getRecentCaseStudies(limit: number): Promise<CaseStudyCard[]> {
  const rows = await tryDb(() =>
    prisma.caseStudy.findMany({
      where: { published: true },
      orderBy: { sortDate: "desc" },
      take: limit,
    })
  )
  if (rows && rows.length > 0) return rows.map(mapDbCaseStudyToCard)
  const all = staticCards()
  return all.slice(0, limit)
}

export type CaseStudyPage = {
  cursor: string | null
  items: CaseStudyCard[]
}

/** Cursor pagination for archive (`sortDate` desc, tie-break `id`). */
export async function getCaseStudiesPage(params: {
  cursor?: string | null
  take?: number
}): Promise<CaseStudyPage> {
  const take = params.take ?? 12
  const allStatic = staticCards()

  const rows = await tryDb(async () => {
    if (params.cursor) {
      const [iso, id] = params.cursor.split("_")
      const sd = new Date(iso)
      if (Number.isNaN(sd.getTime()) || !id) return null
      return prisma.caseStudy.findMany({
        where: {
          published: true,
          OR: [{ sortDate: { lt: sd } }, { AND: [{ sortDate: sd }, { id: { lt: id } }] }],
        },
        orderBy: [{ sortDate: "desc" }, { id: "desc" }],
        take: take + 1,
      })
    }
    return prisma.caseStudy.findMany({
      where: { published: true },
      orderBy: [{ sortDate: "desc" }, { id: "desc" }],
      take: take + 1,
    })
  })

  if (rows && rows.length > 0) {
    const slice = rows.slice(0, take)
    const hasMore = rows.length > take
    const last = slice[slice.length - 1]
    const nextCursor =
      hasMore && last ? `${last.sortDate.toISOString()}_${last.id}` : null
    return { cursor: nextCursor, items: slice.map(mapDbCaseStudyToCard) }
  }

  const offset = params.cursor?.startsWith("static_") ? Number(params.cursor.replace("static_", "")) || 0 : 0
  const slice = allStatic.slice(offset, offset + take)
  const hasMore = allStatic.length > offset + take
  return {
    cursor: hasMore ? `static_${offset + take}` : null,
    items: slice,
  }
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudyCard | null> {
  const row = await tryDb(() =>
    prisma.caseStudy.findFirst({
      where: { slug, published: true },
    })
  )
  if (row) return mapDbCaseStudyToCard(row)
  const p = getProjectBySlug(slug)
  return p ? staticToCard(p) : null
}

export async function getPublishedSlugs(): Promise<string[]> {
  const rows = await tryDb(() =>
    prisma.caseStudy.findMany({
      where: { published: true },
      select: { slug: true },
    })
  )
  if (rows && rows.length > 0) return rows.map((r) => r.slug)
  return featuredProjects.map((p) => p.slug)
}
