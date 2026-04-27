'use client'

import { useEffect, useRef, useState } from 'react'

const partners = [
  'GALAS & FORMAL DINNERS',
  'AWARDS & RECOGNITION EVENTS',
  'COMMUNITY & CULTURAL FESTIVALS',
  'CORPORATE SUMMITS & CONFERENCES',
  'FUNDRAISERS & BENEFIT EVENTS',
  'PUBLIC SECTOR & CIVIC PROGRAMS',
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
    <section ref={ref} className="border-t border-border bg-background page-section-y dark:bg-black page-px">
      <div className="container mx-auto w-full min-w-0 max-w-full">
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
