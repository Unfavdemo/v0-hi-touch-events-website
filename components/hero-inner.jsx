"use client"

import { useEffect, useState } from "react"
import { StatsMarquee } from "@/components/stats-marquee"
import { contact } from "@/lib/site"

export function HeroInner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 animate-hero-drift opacity-70 dark:opacity-60"
        style={{
          background: `radial-gradient(ellipse 90% 60% at 50% 20%, var(--hero-radial-a), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 60%, var(--hero-radial-b), transparent 50%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(95deg, color-mix(in oklab, var(--hero-fade-edge) 82%, transparent) 0%, color-mix(in oklab, var(--hero-fade-edge) 55%, transparent) 28%, color-mix(in oklab, var(--hero-fade-edge) 18%, transparent) 55%, transparent 78%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(180deg, color-mix(in oklab, var(--hero-fade-edge) 35%, transparent) 0%, transparent 22%, transparent 50%, color-mix(in oklab, var(--hero-fade-edge) 78%, transparent) 88%, var(--hero-fade-edge) 100%)`,
        }}
      />

      <div className="relative z-10 flex min-h-[calc(100svh-8.5rem)] flex-col justify-end pb-40 pt-8 page-px max-sm:pb-44 sm:min-h-[calc(100svh-9rem)] sm:justify-center sm:pb-36 sm:pt-4 md:min-h-[calc(100svh-11rem)] md:pb-40 lg:pb-44">
        <div className="max-w-6xl">
          <p
            className="font-display text-xs font-normal uppercase tracking-[0.35em] text-brand-ink md:text-sm"
            style={{ textShadow: "0 1px 12px var(--hero-fade-edge)" }}
          >
            HiTouch Enterprises
          </p>
          <h1
            className="font-display mt-6 text-[clamp(2rem,9vw,6.5rem)] font-normal uppercase leading-[0.92] tracking-tight text-balance text-foreground"
            style={{
              textShadow:
                "0 2px 30px var(--hero-fade-edge), 0 1px 3px color-mix(in oklab, var(--hero-fade-edge) 70%, transparent)",
            }}
          >
            Hi-Quality,
            <br />
            Hi-Impact
            <br />
            <span className="text-foreground/65">Results</span>
          </h1>
        </div>

        <div
          className={`mt-8 max-w-2xl transition-all delay-200 duration-1000 md:mt-10 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="h-1 w-28 rounded-full bg-gradient-line md:w-40" aria-hidden />
          <p
            className="mt-6 text-base leading-relaxed text-foreground/85 md:text-lg dark:text-foreground/90"
            style={{ textShadow: "0 1px 16px var(--hero-fade-edge)" }}
          >
            From concept to execution, we design intentional experiences that bring people together and move your mission
            forward.
          </p>
        </div>

        <div
          className={`mt-10 flex flex-wrap items-center gap-8 transition-all delay-300 duration-1000 md:mt-14 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <a
            href={contact.youtubeChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display inline-flex rounded-full border-2 border-brand bg-background/30 px-8 py-3 text-[10px] font-normal uppercase tracking-[0.3em] text-foreground backdrop-blur-sm transition-colors hover:bg-brand/20 hover:text-foreground dark:bg-black/35 dark:hover:bg-brand/30"
            style={{ textShadow: "0 1px 10px var(--hero-fade-edge)" }}
          >
            Get to know us
          </a>
          <a
            href={contact.charterWeb}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-[10px] font-normal uppercase tracking-[0.3em] text-foreground/85 transition-colors hover:text-brand-ink dark:text-foreground/90"
            style={{ textShadow: "0 1px 12px var(--hero-fade-edge)" }}
          >
            Request charter quote →
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20">
        <StatsMarquee variant="hero" />
      </div>
    </>
  )
}
