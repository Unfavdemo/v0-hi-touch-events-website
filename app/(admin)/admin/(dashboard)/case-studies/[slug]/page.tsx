import Link from "next/link"
import { notFound } from "next/navigation"
import { getCaseStudyFormDefaults } from "@/lib/case-study-admin-data"
import { CaseStudyForm } from "@/components/admin/case-study-form"
import { CaseStudyPublishedToggle } from "@/components/admin/case-study-published-toggle"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return {
    title: `Edit ${slug} | Case studies`,
    robots: { index: false, follow: false },
  }
}

export default async function AdminCaseStudyEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (!process.env.DATABASE_URL) {
    return (
      <main id="admin-main" className="p-6 md:p-10">
        <p className="text-muted-foreground">Configure `DATABASE_URL`.</p>
      </main>
    )
  }

  const defaults = await getCaseStudyFormDefaults(slug)
  if (!defaults) notFound()

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <Link href="/admin/case-studies" className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground hover:text-brand-ink">
        ← Case studies
      </Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-normal uppercase tracking-tight">Edit case study</h1>
          <p className="mt-2 text-sm text-muted-foreground">{defaults.title}</p>
        </div>
        <CaseStudyPublishedToggle slug={defaults.slug} published={defaults.published} />
      </div>
      <CaseStudyForm mode="edit" originalSlug={slug} defaults={defaults} />
    </main>
  )
}
