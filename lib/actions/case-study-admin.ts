"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth/guard"
import { bodyParagraphsFromText, slugifyCaseStudy } from "@/lib/case-study-form"

function revalidateCaseStudyPaths(slug: string, previousSlug?: string) {
  revalidatePath("/admin/case-studies")
  revalidatePath("/admin/audit")
  revalidatePath("/featured-work")
  revalidatePath("/")
  revalidatePath(`/featured-work/${slug}`)
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/featured-work/${previousSlug}`)
    revalidatePath(`/admin/case-studies/${previousSlug}`)
  }
  revalidatePath(`/admin/case-studies/${slug}`)
}

function parseSortDate(raw: string): Date {
  const trimmed = raw.trim()
  if (!trimmed) return new Date()
  const d = new Date(trimmed.length === 10 ? `${trimmed}T12:00:00.000Z` : trimmed)
  if (Number.isNaN(d.getTime())) throw new Error("Invalid sort date.")
  return d
}

export async function setCaseStudyPublished(slug: string, published: boolean) {
  const { admin } = await requirePermission("case_studies.write")
  const row = await prisma.caseStudy.update({
    where: { slug },
    data: { published },
  })
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "case_study.update",
      entityType: "CaseStudy",
      entityId: row.id,
      payload: { slug, published },
    },
  })
  revalidateCaseStudyPaths(slug)
}

export async function createCaseStudy(formData: FormData) {
  const { admin } = await requirePermission("case_studies.write")

  const title = String(formData.get("title") ?? "").trim()
  const category = String(formData.get("category") ?? "").trim()
  const listDescription = String(formData.get("listDescription") ?? "").trim()
  const heroImageUrl = String(formData.get("heroImageUrl") ?? "").trim()
  const bodyRaw = String(formData.get("body") ?? "")
  const slugRaw = String(formData.get("slug") ?? "").trim()
  const slug = slugRaw ? slugifyCaseStudy(slugRaw) : slugifyCaseStudy(title)
  const sortDate = parseSortDate(String(formData.get("sortDate") ?? ""))
  const published = formData.get("published") === "on"

  if (!title || !category || !listDescription || !heroImageUrl || !slug) {
    throw new Error("Title, category, description, hero image URL, and slug are required.")
  }

  const body = bodyParagraphsFromText(bodyRaw)
  if (body.length === 0) throw new Error("Add at least one body paragraph (separate paragraphs with a blank line).")

  const row = await prisma.caseStudy.create({
    data: {
      slug,
      title,
      category,
      listDescription,
      heroImageUrl,
      body,
      sortDate,
      published,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "case_study.create",
      entityType: "CaseStudy",
      entityId: row.id,
      payload: { slug },
    },
  })

  revalidateCaseStudyPaths(slug)
  redirect(`/admin/case-studies/${slug}`)
}

export async function updateCaseStudy(originalSlug: string, formData: FormData) {
  const { admin } = await requirePermission("case_studies.write")

  const existing = await prisma.caseStudy.findUnique({ where: { slug: originalSlug } })
  if (!existing) throw new Error("Case study not found.")

  const title = String(formData.get("title") ?? "").trim()
  const category = String(formData.get("category") ?? "").trim()
  const listDescription = String(formData.get("listDescription") ?? "").trim()
  const heroImageUrl = String(formData.get("heroImageUrl") ?? "").trim()
  const bodyRaw = String(formData.get("body") ?? "")
  const slugRaw = String(formData.get("slug") ?? "").trim()
  const slug = slugRaw ? slugifyCaseStudy(slugRaw) : existing.slug
  const sortDate = parseSortDate(String(formData.get("sortDate") ?? existing.sortDate.toISOString().slice(0, 10)))
  const published = formData.get("published") === "on"

  if (!title || !category || !listDescription || !heroImageUrl || !slug) {
    throw new Error("Title, category, description, hero image URL, and slug are required.")
  }

  const body = bodyParagraphsFromText(bodyRaw)
  if (body.length === 0) throw new Error("Add at least one body paragraph.")

  if (slug !== originalSlug) {
    const taken = await prisma.caseStudy.findUnique({ where: { slug } })
    if (taken) throw new Error("That slug is already in use.")
  }

  const row = await prisma.caseStudy.update({
    where: { slug: originalSlug },
    data: {
      slug,
      title,
      category,
      listDescription,
      heroImageUrl,
      body,
      sortDate,
      published,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "case_study.update",
      entityType: "CaseStudy",
      entityId: row.id,
      payload: {
        slug,
        previousSlug: originalSlug !== slug ? originalSlug : undefined,
        published,
      },
    },
  })

  revalidateCaseStudyPaths(slug, originalSlug)
  redirect(`/admin/case-studies/${slug}`)
}
