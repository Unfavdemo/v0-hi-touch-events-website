'use client'

import { useEffect, useRef, useState } from 'react'

export function GlobalReach() {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true)
      },
      { threshold: 0.2 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} className="relative overflow-hidden border-t border-border bg-background py-24 dark:bg-black page-px">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(90vw,520px)] w-[min(90vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(46,49,146,0.32) 0%, transparent 68%)' }}
      />
      <div className="container relative mx-auto w-full min-w-0 max-w-full">
        <div
          className={`mb-8 flex items-center gap-4 transition-all duration-700 ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <span className="font-display shrink-0 text-xs font-normal uppercase tracking-[0.35em] text-gold">
            Our global footprint
          </span>
          <div className="h-px min-w-8 flex-1 bg-border dark:bg-white/15" />
        </div>
        <div className="text-center">
          <h2
            className={`font-display text-[clamp(1.75rem,6vw,4.5rem)] font-normal uppercase leading-[0.95] tracking-tight text-balance text-foreground transition-all duration-700 delay-100 ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            Rooted in Philadelphia
            <br />
            <span className="text-foreground/45">serving the region and beyond</span>
          </h2>
          <p
            className={`mx-auto mt-8 max-w-2xl text-muted-foreground transition-all duration-700 delay-200 ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
          We produce programs across the Delaware Valley and beyond—trusted partners, consistent standards, and
          teams that show up ready to deliver.
          </p>
        </div>
      </div>
    </section>
  )
}
