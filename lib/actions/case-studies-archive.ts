"use server"

import { getCaseStudiesPage } from "@/lib/case-studies"

export async function loadMoreCaseStudies(cursor: string | null) {
  return getCaseStudiesPage({ cursor, take: 12 })
}
