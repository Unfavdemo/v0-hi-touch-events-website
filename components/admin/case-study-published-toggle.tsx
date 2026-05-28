"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { setCaseStudyPublished } from "@/lib/actions/case-study-admin"

export function CaseStudyPublishedToggle({ slug, published }: { slug: string; published: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await setCaseStudyPublished(slug, !published)
          router.refresh()
        })
      }
      className="rounded-full border border-border px-3 py-1 text-xs transition-colors hover:border-brand disabled:opacity-50"
    >
      {published ? "Unpublish" : "Publish"}
    </button>
  )
}
