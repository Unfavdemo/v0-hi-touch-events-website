"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { FeaturedProjectsCarousel } from "@/components/featured-projects-carousel"

export function Portfolio() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.08 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="work"
      ref={sectionRef}
      className="scroll-mt-28 overflow-hidden bg-background px-0 pb-0 pt-24 dark:bg-black sm:scroll-mt-32 sm:pt-28 md:pt-28 lg:pt-32"
    >
      <div className="container mx-auto w-full min-w-0 max-w-full page-px">
        <div
          className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div>
            <p className="font-display text-xs font-normal uppercase tracking-[0.35em] text-brand-ink">Portfolio</p>
            <h2 className="font-display mt-3 text-[clamp(1.75rem,4.5vw,3.5rem)] font-normal uppercase tracking-tight text-balance text-foreground">
              Featured work
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            An inside look of hi-quality, hi-impact results — where creativity meets disciplined execution.
          </p>
        </div>
      </div>

      <FeaturedProjectsCarousel
        viewportClassName="pl-[max(1rem,env(safe-area-inset-left,0px))] md:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
      />

      <div className="container mx-auto w-full min-w-0 max-w-full page-px pb-16 pt-4 sm:pb-20 sm:pt-6 md:pb-24 md:pt-8">
        <div className="relative flex flex-col items-center text-center">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent dark:via-white/18"
          />
          <Link
            href="/featured-work"
            className="font-display mt-10 inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-[10px] font-normal uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:border-brand hover:text-brand-ink dark:hover:text-white"
          >
            View all featured work
            <span aria-hidden className="text-xs font-light normal-case tracking-normal">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
