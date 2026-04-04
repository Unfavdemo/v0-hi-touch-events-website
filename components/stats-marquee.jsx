export const MARQUEE_STATS = [
  "250+ Events Produced",
  "50M+ Media Impressions",
  "$8.3M Dollars Raised",
  "25+ Strategic Campaigns",
  "Philadelphia & the region",
  "Event production & luxury charter",
]

export function StatsMarquee({ variant = "band" }) {
  const doubled = [...MARQUEE_STATS, ...MARQUEE_STATS]
  if (variant === "hero") {
    return (
      <div className="border-t border-border bg-muted/60 py-3 backdrop-blur-sm dark:bg-black/50 overflow-x-hidden">
        <div className="flex w-max animate-marquee-scroll">
          {doubled.map((label, i) => (
            <span
              key={`${label}-${i}`}
              className="inline-flex items-center px-8 font-display text-sm font-normal uppercase tracking-[0.2em] text-foreground/90 whitespace-nowrap"
            >
              <span className="mx-6 text-foreground/30" aria-hidden>
                |
              </span>
              {label}
            </span>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="border-y border-border bg-muted/50 py-4 dark:bg-black/40 overflow-x-hidden">
      <div className="flex w-max animate-marquee-scroll">
        {doubled.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="inline-flex items-center px-10 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground whitespace-nowrap"
          >
            <span className="mr-10 h-1 w-1 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.55)]" aria-hidden />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
