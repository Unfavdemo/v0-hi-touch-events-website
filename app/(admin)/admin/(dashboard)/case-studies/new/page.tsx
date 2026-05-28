import Link from "next/link"
import { CaseStudyForm } from "@/components/admin/case-study-form"

export const metadata = {
  title: "New case study | Admin",
  robots: { index: false, follow: false },
}

export default function AdminCaseStudyNewPage() {
  return (
    <main id="admin-main" className="p-6 md:p-10">
      <Link href="/admin/case-studies" className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground hover:text-brand-ink">
        ← Case studies
      </Link>
      <h1 className="font-display mt-6 text-3xl font-normal uppercase tracking-tight">New case study</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Creates a portfolio entry in the database. Use a hero path under <code className="rounded bg-muted px-1 text-xs">/images/featured-work/</code> or{" "}
        <code className="rounded bg-muted px-1 text-xs">/Hitouch Pictures/</code>.
      </p>
      {!process.env.DATABASE_URL ? (
        <p className="mt-8 text-muted-foreground">Configure `DATABASE_URL`.</p>
      ) : (
        <CaseStudyForm mode="create" />
      )}
    </main>
  )
}
