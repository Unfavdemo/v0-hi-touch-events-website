"use client"

import { useCallback, useEffect, useRef } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { featuredProjects } from "@/lib/site"
import { FeaturedProjectCarouselSlide } from "@/components/featured-project-carousel-slide"
import { cn } from "@/lib/utils"

const AUTOPLAY_MS = 4800

/**
 * Horizontal featured-project slides with gentle autoplay (pauses on hover/focus).
 * No card borders — spacing uses gap only.
 */
export function FeaturedProjectsCarousel({
  wrapperClassName,
  viewportClassName,
  rowClassName,
} = {}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "center", loop: true, skipSnaps: false })
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
      className={cn("relative pb-16 md:pb-0", wrapperClassName ?? "mt-10 sm:mt-12")}
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
      <div className={cn("overflow-hidden overscroll-x-contain", viewportClassName)} ref={emblaRef}>
        <div className={cn("flex gap-4 md:gap-5 pr-4 md:pr-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]", rowClassName)}>
          {featuredProjects.map((project, i) => (
            <FeaturedProjectCarouselSlide key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-[max(1rem,env(safe-area-inset-right,0px))] z-10 flex gap-2 sm:bottom-8 sm:right-6 sm:gap-3 md:right-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
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
