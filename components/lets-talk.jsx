import { getInquiryMailtoHref } from "@/lib/site"

export function LetsTalk() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-background page-section-y dark:bg-black page-px">
      <div
        className="pointer-events-none absolute -left-24 bottom-0 top-0 w-48 opacity-[0.12]"
        style={{
          background:
            'repeating-linear-gradient(-12deg, transparent, transparent 8px, rgba(var(--brand-rgb), 0.35) 8px, rgba(var(--brand-rgb), 0.35) 9px)',
        }}
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 top-0 w-48 opacity-[0.12]"
        style={{
          background:
            'repeating-linear-gradient(12deg, transparent, transparent 8px, rgba(var(--brand-rgb), 0.35) 8px, rgba(var(--brand-rgb), 0.35) 9px)',
        }}
      />
      <div className="container relative mx-auto flex w-full min-w-0 max-w-full flex-col items-center text-center">
        <p className="font-display text-xs font-normal uppercase tracking-[0.35em] text-brand-ink">Connect with us</p>
        <h2 className="font-display mt-4 max-w-4xl text-[clamp(1.5rem,4.5vw,3.25rem)] font-normal uppercase leading-tight tracking-tight text-balance text-foreground">
          Let&apos;s work together on something great.
        </h2>
        <a
          href={getInquiryMailtoHref()}
          className="font-display mt-10 inline-flex rounded-full border-2 border-brand px-12 py-4 text-[10px] font-normal uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-brand/15"
        >
          Connect with us
        </a>
      </div>
    </section>
  )
}
