import Link from "next/link"
import { createCaseStudy, updateCaseStudy } from "@/lib/actions/case-study-admin"

type Defaults = {
  slug: string
  title: string
  category: string
  listDescription: string
  heroImageUrl: string
  bodyText: string
  sortDate: string
  published: boolean
}

export function CaseStudyForm({
  mode,
  originalSlug,
  defaults,
}: {
  mode: "create" | "edit"
  originalSlug?: string
  defaults?: Defaults
}) {
  const action =
    mode === "create"
      ? createCaseStudy
      : updateCaseStudy.bind(null, originalSlug ?? defaults?.slug ?? "")

  const d = defaults ?? {
    slug: "",
    title: "",
    category: "",
    listDescription: "",
    heroImageUrl: "",
    bodyText: "",
    sortDate: new Date().toISOString().slice(0, 10),
    published: false,
  }

  return (
    <form action={action} className="mt-8 max-w-2xl space-y-4">
      <div>
        <label className="text-xs text-muted-foreground">Slug (URL)</label>
        <input
          name="slug"
          required
          defaultValue={d.slug}
          placeholder="juneteenth-parade-festival-2025"
          className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 font-mono text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Title</label>
        <input name="title" required defaultValue={d.title} className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Category</label>
        <input
          name="category"
          required
          defaultValue={d.category}
          placeholder="Festival"
          className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">List description (card / SEO blurb)</label>
        <textarea
          name="listDescription"
          required
          rows={3}
          defaultValue={d.listDescription}
          className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Hero image URL</label>
        <input
          name="heroImageUrl"
          required
          defaultValue={d.heroImageUrl}
          placeholder="/images/featured-work/example/01.jpg"
          className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 font-mono text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Body paragraphs (blank line between paragraphs)</label>
        <textarea
          name="body"
          required
          rows={12}
          defaultValue={d.bodyText}
          className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm leading-relaxed"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs text-muted-foreground">Sort date (archive order)</label>
          <input
            type="date"
            name="sortDate"
            required
            defaultValue={d.sortDate}
            className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={d.published} className="size-4" />
            Published on public site
          </label>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          className="font-display rounded-full border-2 border-brand bg-brand/10 px-5 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-brand/20"
        >
          {mode === "create" ? "Create case study" : "Save changes"}
        </button>
        <Link
          href="/admin/case-studies"
          className="font-display inline-flex items-center rounded-full border border-border px-5 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Link>
        {mode === "edit" && d.slug ? (
          <Link
            href={`/featured-work/${d.slug}`}
            className="font-display inline-flex items-center px-2 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-brand-ink"
          >
            Preview
          </Link>
        ) : null}
      </div>
    </form>
  )
}
