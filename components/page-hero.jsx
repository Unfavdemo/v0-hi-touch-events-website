import Link from "next/link"

export function PageHero({ eyebrow, title, subtitle, breadcrumbs, variant = "default" }) {
  const isCinematic = variant === "cinematic"
  return (
    <section
      className={
        isCinematic
          ? "relative border-b border-border pb-20 pt-32 page-px sm:pt-36 md:pb-24 md:pt-44 lg:pt-48"
          : "relative border-b border-border bg-background pb-20 pt-32 page-px sm:pt-36 md:pb-24 md:pt-44 lg:pt-48 dark:bg-black"
      }
    >
      {isCinematic ? (
        <div
          className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, var(--page-cinematic-radial), transparent 55%), var(--page-cinematic-fade)",
          }}
        />
      ) : null}
      <div className="container relative mx-auto w-full min-w-0 max-w-4xl">
        {breadcrumbs?.length ? (
          <nav className="mb-8 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-2">
              {breadcrumbs.map((crumb, i) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  {i > 0 && <span className="text-foreground/25" aria-hidden>/</span>}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="text-foreground">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="transition-colors hover:text-brand-ink">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        {eyebrow ? (
          <p className="font-display text-xs font-normal uppercase tracking-[0.35em] text-brand-ink">{eyebrow}</p>
        ) : null}
        <h1 className="font-display mt-4 text-[clamp(2rem,5.5vw,4.5rem)] font-normal uppercase leading-[0.95] tracking-tight text-balance text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-6 max-w-2xl text-base font-normal leading-relaxed text-muted-foreground md:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  )
}

export function Prose({ children, className = "" }) {
  return (
    <div className={`bg-background page-section-y page-px dark:bg-black ${className}`}>
      <div className="container mx-auto w-full min-w-0 max-w-3xl space-y-6 text-base leading-relaxed text-muted-foreground md:text-lg [&_p]:mb-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
        {children}
      </div>
    </div>
  )
}
