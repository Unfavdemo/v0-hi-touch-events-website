'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export function AboutSection() {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true)
      },
      { threshold: 0.15 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="about"
      ref={ref}
      className="relative scroll-mt-24 overflow-hidden bg-background page-section-y dark:bg-black page-px lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-topo-lines opacity-90" />
      <div
        className="pointer-events-none absolute -right-32 top-1/4 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(41,42,117,0.28) 0%, transparent 65%)' }}
      />

      <div className="container relative mx-auto w-full min-w-0 max-w-full">
        <div
          className={`mb-14 flex items-center gap-4 transition-all duration-700 ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <span className="font-display shrink-0 text-xs font-normal uppercase tracking-[0.35em] text-brand-ink">
            About us
          </span>
          <div className="h-px min-w-8 flex-1 bg-border dark:bg-white/15" />
        </div>

        <div
          className={`mx-auto max-w-4xl text-center transition-all duration-700 delay-100 ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <h2 className="font-display text-[clamp(2rem,7vw,5rem)] font-normal uppercase leading-[0.95] tracking-tight text-balance text-foreground">
            Hi-Quality, Hi-Impact events
          </h2>
          <p className="mt-10 text-base leading-relaxed text-muted-foreground md:text-lg">
            HiTouch Events creates high-impact experiences that elevate brands, engage communities, and deliver real
            results. With 300+ events produced for audiences from 100 to 25,000+, we bring scale, strategy, and precision
            to every experience. We&apos;ve helped nonprofit partners raise $11M+ in support of education equity, small
            business growth, violence reduction, and economic opportunity. From corporate engagements and VIP experiences
            to large-scale festivals and civic celebrations, HiTouch is known for seamless execution and standout
            hospitality.
          </p>
          <Link
            href="/about-us"
            className="font-display mt-12 inline-flex rounded-full border-2 border-brand px-10 py-3.5 text-[10px] font-normal uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-brand/15"
          >
            About us
          </Link>
        </div>
      </div>
    </section>
  )
}
