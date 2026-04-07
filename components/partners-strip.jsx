'use client'

import { useEffect, useRef, useState } from 'react'

const partners = [
  'Fortune 500 summits',
  'Product launches & premieres',
  'Music & festival partners',
  'Broadcast & streaming',
  'Luxury hospitality',
  'Cultural institutions',
]

export function PartnersStrip() {
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
    <section ref={ref} className="border-t border-border bg-background py-20 dark:bg-black page-px">
      <div className="container mx-auto w-full min-w-0 max-w-full">
        <div
          className={`mb-12 text-center transition-all duration-700 ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            What we deliver
          </p>
          <h2 className="font-display mx-auto mt-6 max-w-3xl text-[clamp(1.75rem,4.5vw,2.75rem)] font-normal uppercase leading-[1.05] tracking-tight text-foreground">
            Hi-Quality, Hi-Impact events
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            Yes—that was us behind the curtain.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {partners.map((name, i) => (
            <div
              key={name}
              className={`flex min-h-[80px] items-center justify-center border border-border bg-muted/40 px-3 py-3 text-center text-[10px] font-medium uppercase leading-snug tracking-wider text-muted-foreground transition-all duration-500 hover:border-brand/45 hover:text-foreground sm:min-h-[88px] sm:px-4 sm:text-xs dark:bg-white/[0.03] ${
                visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: `${80 * i}ms` }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
