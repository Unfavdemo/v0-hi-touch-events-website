"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { StatsMarquee } from "@/components/stats-marquee"
import { contact } from "@/lib/site"

export function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-svh w-full min-w-0 overflow-hidden pt-32 sm:pt-36 md:pt-44 lg:pt-48">
      <div className="absolute inset-0 bg-background dark:bg-black" />
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/images/DSC_0015.jpg"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-[center_35%]"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 animate-hero-drift opacity-80 dark:opacity-70"
        style={{
          background: `radial-gradient(ellipse 90% 60% at 50% 20%, var(--hero-radial-a), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 60%, var(--hero-radial-b), transparent 50%), linear-gradient(180deg, var(--hero-fade-mid) 0%, var(--hero-fade-edge) 45%, var(--hero-fade-edge) 100%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/35 via-transparent to-background/72 dark:from-black/28 dark:via-transparent dark:to-black/88" />

      <div className="relative z-10 flex min-h-[calc(100svh-8.5rem)] flex-col justify-center pb-32 pt-4 page-px sm:min-h-[calc(100svh-9rem)] sm:pb-36 md:min-h-[calc(100svh-11rem)] md:pb-40 lg:pb-44">
        <div
          className={`max-w-6xl transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <p className="font-display text-xs font-normal uppercase tracking-[0.35em] text-brand-ink md:text-sm">
            HiTouch Enterprises
          </p>
          <h1 className="font-display mt-6 text-[clamp(2rem,9vw,6.5rem)] font-normal uppercase leading-[0.92] tracking-tight text-balance text-foreground">
            Hi-Quality,
            <br />
            Hi-Impact
            <br />
            <span className="text-foreground/50">Results</span>
          </h1>
        </div>

        <div
          className={`mt-8 max-w-2xl transition-all delay-200 duration-1000 md:mt-10 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="h-1 w-28 rounded-full bg-gradient-line md:w-40" aria-hidden />
          <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            From concept to execution, we design intentional experiences that bring people together and move your mission
            forward.
          </p>
        </div>

        <div
          className={`mt-10 flex flex-wrap items-center gap-8 transition-all delay-300 duration-1000 md:mt-14 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <Link
            href="/about-us"
            className="font-display inline-flex rounded-full border-2 border-brand px-8 py-3 text-[10px] font-normal uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-brand/15 hover:text-foreground"
          >
            Get to know us
          </Link>
          <a
            href={contact.charterWeb}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-[10px] font-normal uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-brand-ink"
          >
            Request charter quote →
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20">
        <StatsMarquee variant="hero" />
      </div>
    </section>
  )
}
