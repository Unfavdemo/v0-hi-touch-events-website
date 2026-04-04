"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { divisions } from "@/lib/site"

export function Services() {
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
      id="services"
      ref={sectionRef}
      className="scroll-mt-28 border-t border-border bg-background py-24 dark:bg-black page-px lg:py-32"
    >
      <div className="container mx-auto w-full min-w-0 max-w-full">
        <div
          className={`mx-auto max-w-3xl text-center transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <p className="font-display text-xs font-normal uppercase tracking-[0.35em] text-gold">What we do</p>
          <h2 className="font-display mt-4 text-[clamp(1.75rem,5.5vw,4rem)] font-normal uppercase leading-tight tracking-tight text-balance text-foreground md:leading-none">
            One partner.
            <br />
            <span className="text-foreground/45">Four disciplines</span>
          </h2>
          <p className="mt-6 text-muted-foreground">
            End-to-end event production—or focused support where you need it most.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 md:gap-10">
          {divisions.map((d, index) => {
            const emphasis = index % 2 === 1
            return (
              <article
                key={d.slug}
                className={`group overflow-hidden border border-border bg-background transition-all duration-700 dark:bg-black ${
                  emphasis ? "shadow-[0_0_80px_-24px_rgba(212,175,55,0.22),0_0_60px_-20px_rgba(46,49,146,0.45)]" : ""
                } ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                style={{ transitionDelay: `${index * 100 + 120}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 ${
                      index % 2 === 0 ? "grayscale contrast-110" : ""
                    }`}
                    style={{
                      backgroundImage: `url(${d.heroImage})`,
                      backgroundColor: "#1a0a0a",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent dark:from-black dark:via-black/40" />
                </div>
                <div className="space-y-4 px-5 py-8 text-center sm:px-8 sm:py-10">
                  <h3 className="font-display text-3xl font-normal uppercase tracking-tight text-foreground md:text-4xl">
                    {d.title}
                  </h3>
                  <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                    {d.tagline}
                  </p>
                  <Link
                    href={d.path}
                    className={
                      emphasis
                        ? "font-display inline-flex rounded-full border-2 border-gold bg-gold px-10 py-3.5 text-[10px] font-normal uppercase tracking-[0.28em] text-gold-foreground transition-colors hover:bg-gold/90 hover:text-gold-foreground"
                        : "font-display inline-flex rounded-full border-2 border-gold px-10 py-3.5 text-[10px] font-normal uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-gold/15"
                    }
                  >
                    Learn more
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
