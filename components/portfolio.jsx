"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { featuredProjects } from "@/lib/site"

export function Portfolio() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "center", loop: true, skipSnaps: false })

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

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
            <p className="font-display text-xs font-normal uppercase tracking-[0.35em] text-gold">Portfolio</p>
            <h2 className="font-display mt-3 text-[clamp(1.75rem,4.5vw,3.5rem)] font-normal uppercase tracking-tight text-balance text-foreground">
              Featured work
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            Yes—that was us. A snapshot of productions where creative ambition met operational rigor.
          </p>
        </div>
      </div>

      <div className="relative mt-10 pb-16 sm:mt-14 md:pb-0">
        <div
          className="overflow-hidden overscroll-x-contain pl-[max(1rem,env(safe-area-inset-left,0px))] md:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
          ref={emblaRef}
        >
          <div className="flex gap-4 pr-4 md:pr-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
            {featuredProjects.map((project) => (
              <div
                key={project.slug}
                className="min-w-0 shrink-0 grow-0 basis-[min(100%,calc(100vw-2.5rem))] sm:basis-[min(100%,88vw)] md:basis-[min(100%,55%)] lg:basis-[min(100%,48%)]"
              >
                <Link
                  href={`/featured-work/${project.slug}`}
                  className="group relative block overflow-hidden border border-border bg-background dark:bg-black"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{
                        backgroundImage: `url(${project.image})`,
                        backgroundColor: "#1a0a0a",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                      <h3 className="font-display text-xl font-normal uppercase tracking-tight text-white text-balance sm:text-2xl md:text-4xl">
                        {project.title}
                      </h3>
                      <span className="mt-3 block h-1 w-12 rounded-full bg-gradient-line" aria-hidden />
                      <p className="mt-3 font-display text-[10px] font-normal uppercase tracking-[0.25em] text-white/70">
                        {project.category}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-4 right-[max(1rem,env(safe-area-inset-right,0px))] z-10 flex gap-2 sm:bottom-8 sm:right-6 sm:gap-3 md:right-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
          <button
            type="button"
            onClick={scrollPrev}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-gold hover:text-gold"
            aria-label="Previous project"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-gold hover:text-gold"
            aria-label="Next project"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

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
          <Link
            href="/featured-work"
            className="font-display mt-8 inline-flex rounded-full border-2 border-gold px-10 py-3.5 text-[10px] font-normal uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-gold/15"
          >
            See our work
          </Link>
        </div>
      </div>
    </section>
  )
}
