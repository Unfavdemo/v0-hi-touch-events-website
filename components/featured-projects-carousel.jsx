"use client"

import { useCallback, useEffect, useRef } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { featuredProjects } from "@/lib/site"
import { FeaturedProjectCarouselSlide } from "@/components/featured-project-carousel-slide"
import { cn } from "@/lib/utils"

const AUTOPLAY_MS = 4800

/**
 * Safe area + modest gutter. Avoid mirroring the centered `container` inset
 * `(100vw-72rem)/2` on the track — that leaves a wide empty band beside the first slide.
 */
const VIEWPORT_GUTTER =
  "pl-[max(1rem,env(safe-area-inset-left,0px))] sm:pl-6"
const ROW_END_GUTTER = "pr-[max(1rem,env(safe-area-inset-right,0px))] sm:pr-6"

/**
 * Horizontal featured-project slides with gentle autoplay (pauses on hover/focus).
 * No card borders — spacing uses gap only.
 */
export function FeaturedProjectsCarousel({
  wrapperClassName,
  viewportClassName,
  rowClassName,
} = {}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    skipSnaps: false,
    /** Lets the track loop cleanly instead of trimming scroll when slide widths vary. */
    containScroll: false,
  })
  const pausedRef = useRef(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi || typeof window === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(() => {
      if (!pausedRef.current) emblaApi.scrollNext()
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [emblaApi])

  return (
    <div
      className={cn("relative pb-20 md:pb-24", wrapperClassName ?? "mt-10 sm:mt-12")}
      onPointerEnter={() => {
        pausedRef.current = true
      }}
      onPointerLeave={() => {
        pausedRef.current = false
      }}
      onFocusCapture={() => {
        pausedRef.current = true
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) pausedRef.current = false
      }}
    >
      <div
        className={cn("overflow-hidden overscroll-x-contain", VIEWPORT_GUTTER, viewportClassName)}
        ref={emblaRef}
      >
        <div className={cn("flex gap-4 md:gap-5", ROW_END_GUTTER, rowClassName)}>
          {featuredProjects.map((project, index) => (
            <FeaturedProjectCarouselSlide
              key={project.slug}
              project={project}
              imagePriority={index < 2}
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-[max(1rem,env(safe-area-inset-right,0px))] z-10 flex gap-2 sm:bottom-8 sm:right-6 sm:gap-3">
        <button
          type="button"
          onClick={scrollPrev}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-black/12 bg-white/95 text-foreground shadow-[0_2px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-colors hover:border-brand hover:text-brand-ink dark:border-white/18 dark:bg-neutral-950/92 dark:text-white dark:shadow-[0_2px_20px_rgba(0,0,0,0.5)] dark:hover:border-brand dark:hover:text-white"
          aria-label="Previous project"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-black/12 bg-white/95 text-foreground shadow-[0_2px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-colors hover:border-brand hover:text-brand-ink dark:border-white/18 dark:bg-neutral-950/92 dark:text-white dark:shadow-[0_2px_20px_rgba(0,0,0,0.5)] dark:hover:border-brand dark:hover:text-white"
          aria-label="Next project"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
