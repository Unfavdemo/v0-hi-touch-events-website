export function CrmSectionCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-xl border border-border bg-card p-6 shadow-sm ${className}`}>
      <h2 className="font-display text-lg uppercase tracking-tight">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  )
}
