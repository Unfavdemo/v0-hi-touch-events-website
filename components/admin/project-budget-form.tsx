import { updateProjectBudget } from "@/lib/actions/projects"
import { BUDGET_USD_HINT } from "@/lib/crm/admin-copy"

export function ProjectBudgetForm({
  projectId,
  budgetUsd,
  nextStepHref,
}: {
  projectId: string
  budgetUsd: { toString(): string } | null
  nextStepHref: string
}) {
  const display =
    budgetUsd != null
      ? Number(budgetUsd).toLocaleString("en-US", { maximumFractionDigits: 0 })
      : ""

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-display text-lg uppercase tracking-tight">Project budget</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Optional — set a target so your team knows the spending limit for this event. {BUDGET_USD_HINT}
      </p>

      <form action={updateProjectBudget.bind(null, projectId)} className="mt-6 space-y-5">
        <div>
          <label className="text-sm font-medium">Total budget (USD)</label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input
              name="budgetUsd"
              inputMode="decimal"
              defaultValue={display}
              placeholder="0"
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-7 pr-3 text-sm"
            />
          </div>
        </div>

        <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          Line-item expenses and deals pipeline live under <strong>Deals</strong> in the sidebar. Link this project there when you need a full P&amp;L.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="font-display rounded-full border-2 border-brand bg-brand px-6 py-2.5 text-[10px] uppercase tracking-[0.28em] text-brand-foreground"
          >
            Save budget
          </button>
          <a href={nextStepHref} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Next: Email vendors →
          </a>
        </div>
      </form>
    </section>
  )
}
