import Link from "next/link"
import { cn } from "@/lib/utils"
import type { ListGuideStep } from "@/lib/crm/workflows"

export function CrmListGuide({
  steps,
  stepDone = {},
}: {
  steps: readonly ListGuideStep[]
  stepDone?: Record<string, boolean>
}) {
  return (
    <nav aria-label="Getting started" className="mt-6 rounded-xl border border-border bg-muted/20 p-4">
      <p className="font-display text-[10px] uppercase tracking-[0.28em] text-muted-foreground">How this page works</p>
      <ol className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {steps.map((step, i) => {
          const done = stepDone[step.id]
          const isExternal = step.href.startsWith("/")
          const className = cn(
            "flex min-w-[140px] flex-1 items-start gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors",
            done ? "border-brand/40 bg-brand/5" : "border-border bg-background hover:border-brand/40"
          )
          const inner = (
            <>
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]",
                  done ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
                )}
                aria-hidden
              >
                {done ? "✓" : i + 1}
              </span>
              <span>
                <span className="block text-sm font-medium">{step.label}</span>
                <span className="block text-[11px] text-muted-foreground">{step.hint}</span>
              </span>
            </>
          )
          return (
            <li key={step.id} className="flex-1">
              {isExternal ? (
                <Link href={step.href} className={className}>
                  {inner}
                </Link>
              ) : (
                <a href={step.href} className={className}>
                  {inner}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
