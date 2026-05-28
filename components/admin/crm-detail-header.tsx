import Link from "next/link"

export function CrmDetailHeader({
  backHref,
  backLabel,
  eyebrow,
  title,
  subtitle,
  badges,
}: {
  backHref: string
  backLabel: string
  eyebrow?: string
  title: string
  subtitle?: string
  badges?: React.ReactNode
}) {
  return (
    <header className="border-b border-border pb-6">
      <Link href={backHref} className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground hover:text-brand-ink">
        ← {backLabel}
      </Link>
      {eyebrow ? (
        <p className="font-display mt-6 text-[10px] uppercase tracking-[0.35em] text-brand-ink">{eyebrow}</p>
      ) : null}
      <h1 className={cnTitle(eyebrow)}>{title}</h1>
      {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
      {badges ? <div className="mt-3 flex flex-wrap gap-2">{badges}</div> : null}
    </header>
  )
}

function cnTitle(hasEyebrow?: string) {
  return hasEyebrow
    ? "font-display mt-2 text-3xl font-normal uppercase tracking-tight text-balance"
    : "font-display mt-6 text-3xl font-normal uppercase tracking-tight text-balance"
}
