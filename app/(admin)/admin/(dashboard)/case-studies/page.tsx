import Link from "next/link"
import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { caseStudySearchWhere, normalizeAdminQuery } from "@/lib/admin-search"
import { AdminFilters } from "@/components/admin/admin-filters"
import { CaseStudyPublishedToggle } from "@/components/admin/case-study-published-toggle"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Case studies | Admin",
  robots: { index: false, follow: false },
}

const PUBLISHED_OPTIONS = [
  { value: "", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
]

export default async function AdminCaseStudiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; published?: string }>
}) {
  const { q: qRaw, published: publishedFilter } = await searchParams
  const q = normalizeAdminQuery(qRaw)

  let rows: Awaited<ReturnType<typeof prisma.caseStudy.findMany>> = []

  const where: Prisma.CaseStudyWhereInput = {
    ...(q ? caseStudySearchWhere(q) : {}),
    ...(publishedFilter === "published"
      ? { published: true }
      : publishedFilter === "draft"
        ? { published: false }
        : {}),
  }

  if (process.env.DATABASE_URL) {
    try {
      rows = await prisma.caseStudy.findMany({
        where,
        orderBy: { sortDate: "desc" },
        take: 200,
      })
    } catch {
      rows = []
    }
  }

  const hasFilters = Boolean(q || publishedFilter)

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <h1 className="font-display text-3xl font-normal uppercase tracking-tight">Case studies</h1>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Edit portfolio copy, images, and publish state. Unpublished items stay out of the marketing archive.
        </p>
        <Link
          href="/admin/case-studies/new"
          className="font-display shrink-0 rounded-full border-2 border-brand bg-brand/10 px-4 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-brand/20"
        >
          New case study
        </Link>
      </div>

      <AdminFilters
        basePath="/admin/case-studies"
        q={qRaw ?? ""}
        searchPlaceholder="Title, slug, category…"
        resultCount={rows.length}
        resultLabel="case studies"
        selects={[
          {
            name: "published",
            label: "Status",
            value: publishedFilter,
            options: PUBLISHED_OPTIONS,
          },
        ]}
      />

      {!process.env.DATABASE_URL ? (
        <p className="mt-8 text-muted-foreground">Configure `DATABASE_URL`.</p>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          {hasFilters ? "No case studies match your filters." : "No case studies in the database. Run `npm run db:seed`."}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
          {rows.map((cs) => (
            <li key={cs.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium">{cs.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {cs.slug} · {cs.published ? "published" : "draft"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/admin/case-studies/${cs.slug}`} className="text-[10px] uppercase tracking-[0.2em] text-brand-ink hover:underline">
                  Edit
                </Link>
                <Link href={`/featured-work/${cs.slug}`} className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-brand-ink">
                  View
                </Link>
                <CaseStudyPublishedToggle slug={cs.slug} published={cs.published} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
