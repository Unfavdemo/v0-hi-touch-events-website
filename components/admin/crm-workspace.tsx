"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import type { WorkflowStep } from "@/lib/crm/workflows"

export function CrmWorkspace({
  basePath,
  steps,
  initialStep,
  stepDone,
  children,
  checklistLabel = "Your checklist",
}: {
  basePath: string
  steps: readonly WorkflowStep[]
  initialStep: string
  stepDone: Record<string, boolean>
  children: Record<string, React.ReactNode>
  checklistLabel?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const validIds = steps.map((s) => s.id)
  const paramStep = searchParams.get("step")
  const activeStep = paramStep && validIds.includes(paramStep) ? paramStep : initialStep

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const goTo = useCallback(
    (step: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("step", step)
      const qs = params.toString()
      router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false })
    },
    [basePath, router, searchParams]
  )

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <nav aria-label="Workflow steps" className="lg:sticky lg:top-6 lg:w-56 lg:shrink-0">
        <p className="font-display text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{checklistLabel}</p>
        <ol className="mt-3 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {steps.map((step, index) => {
            const active = activeStep === step.id
            const done = stepDone[step.id]
            return (
              <li key={step.id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => goTo(step.id)}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-left transition-colors lg:min-w-0",
                    active
                      ? "border-brand bg-brand/10"
                      : "border-border bg-background hover:border-brand/50 hover:bg-muted/40"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
                        done ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
                      )}
                      aria-hidden
                    >
                      {done ? "✓" : index + 1}
                    </span>
                    <span className="font-display text-[11px] uppercase tracking-[0.12em]">
                      {step.label.replace(/^\d+\.\s*/, "")}
                    </span>
                  </span>
                  <span className="mt-1 block pl-7 text-[11px] leading-snug text-muted-foreground">{step.hint}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="min-w-0 flex-1">{mounted ? children[activeStep] : children[initialStep]}</div>
    </div>
  )
}
