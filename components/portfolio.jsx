"use client"

import { useEffect, useRef, useState } from "react"
import { contact } from "@/lib/site"
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
    <section id="work" ref={sectionRef} className="scroll-mt-28 overflow-hidden bg-background px-0 py-20 dark:bg-black sm:scroll-mt-32 sm:py-24 lg:py-32">
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
            Yes—that was us. A snapshot of productions where creative ambition met operational rigor.
          </p>
        </div>
      </div>

      <FeaturedProjectsCarousel
        viewportClassName="pl-[max(1rem,env(safe-area-inset-left,0px))] md:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
      />

      <div className="container mx-auto mt-12 w-full min-w-0 max-w-full page-px sm:mt-16">
        <div
          className={`border border-border bg-muted/40 px-5 py-12 text-center transition-all duration-700 dark:bg-black/40 sm:px-8 sm:py-14 md:px-16 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          <p className="font-display text-xs font-normal uppercase tracking-[0.35em] text-muted-foreground">
            We&apos;ve got more to show
          </p>
          <h3 className="font-display mt-4 text-2xl font-normal uppercase tracking-tight text-foreground md:text-3xl">
            Bring us your next impossible deadline
          </h3>
          <a
            href={contact.youtubeChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display mt-8 inline-flex rounded-full border-2 border-brand px-10 py-3.5 text-[10px] font-normal uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-brand/15"
          >
            See our work on YouTube
          </a>
        </div>
      </div>
    </section>
  )
}
