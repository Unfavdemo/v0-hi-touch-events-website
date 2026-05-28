"use client"

import { useState, useTransition } from "react"
import { FeaturedProjectCarouselSlide } from "@/components/featured-project-carousel-slide"
import { loadMoreCaseStudies } from "@/lib/actions/case-studies-archive"
import type { CaseStudyCard } from "@/lib/case-studies"

/**
 * Client “load more” for the featured-work archive (DB-backed with static fallback).
 */
export function FeaturedWorkArchive({
  initialItems,
  initialCursor,
}: {
  initialItems: CaseStudyCard[]
  initialCursor: string | null
}) {
  const [items, setItems] = useState(initialItems)
  const [cursor, setCursor] = useState(initialCursor)
  const [pending, start] = useTransition()

  function onLoadMore() {
    if (!cursor) return
    start(async () => {
      const page = await loadMoreCaseStudies(cursor)
      setItems((prev) => [...prev, ...page.items])
      setCursor(page.cursor)
    })
  }

  return (
    <div className="mt-10 sm:mt-12">
      <ul className="container mx-auto grid list-none grid-cols-1 gap-6 page-px sm:grid-cols-2 sm:gap-7 xl:grid-cols-3 xl:gap-8">
        {items.map((project, index) => (
          <li key={project.slug} className="min-w-0">
            <FeaturedProjectCarouselSlide
              project={project}
              variant="grid"
              imagePriority={index === 0}
            />
          </li>
        ))}
      </ul>
      {cursor ? (
        <div className="container mx-auto mt-10 flex justify-center page-px">
          <button
            type="button"
            disabled={pending}
            onClick={onLoadMore}
            className="font-display rounded-full border-2 border-brand px-8 py-3 text-[10px] font-normal uppercase tracking-[0.28em] transition-colors hover:bg-brand/15 disabled:opacity-50"
          >
            {pending ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  )
}
