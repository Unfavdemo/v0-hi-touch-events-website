"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { updateDealStage } from "@/lib/actions/deals"
import { DEAL_STAGE_LABELS, DEAL_STAGES, formatDealAmount, type DealStageName } from "@/lib/crm/deal-stages"

type DealCard = {
  id: string
  name: string
  stage: DealStageName
  amount: { toString(): string } | null
  currency: string
  closeDate: Date | null
  contact: { id: string; email: string; firstName: string | null; lastName: string | null } | null
  company: { id: string; name: string } | null
}

export function DealPipelineBoard({ deals }: { deals: DealCard[] }) {
  const [pending, start] = useTransition()
  const router = useRouter()

  const byStage = Object.fromEntries(DEAL_STAGES.map((s) => [s, [] as DealCard[]])) as Record<DealStageName, DealCard[]>
  for (const d of deals) {
    byStage[d.stage]?.push(d)
  }

  return (
    <div className="mt-8 flex gap-3 overflow-x-auto pb-4">
      {DEAL_STAGES.map((stage) => (
        <div
          key={stage}
          className="flex w-64 shrink-0 flex-col rounded-lg border border-border bg-muted/20"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="font-display text-[10px] uppercase tracking-[0.22em] text-brand-ink">
              {DEAL_STAGE_LABELS[stage]}
            </p>
            <p className="text-xs text-muted-foreground">{byStage[stage].length} deals</p>
          </div>
          <ul className="flex min-h-[120px] flex-1 flex-col gap-2 p-2">
            {byStage[stage].map((deal) => {
              const contactName =
                [deal.contact?.firstName, deal.contact?.lastName].filter(Boolean).join(" ") ||
                deal.contact?.email
              return (
                <li key={deal.id} className="rounded-md border border-border bg-card p-3 text-sm shadow-sm">
                  <Link href={`/admin/deals/${deal.id}`} className="font-medium hover:text-brand-ink">
                    {deal.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDealAmount(deal.amount, deal.currency)}
                    {deal.closeDate ? ` · close ${deal.closeDate.toLocaleDateString()}` : ""}
                  </p>
                  {contactName || deal.company ? (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {contactName}
                      {deal.company ? ` · ${deal.company.name}` : ""}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {DEAL_STAGES.filter((s) => s !== deal.stage).map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            await updateDealStage(deal.id, s)
                            router.refresh()
                          })
                        }
                        className="rounded border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground hover:border-brand hover:text-foreground disabled:opacity-50"
                        title={`Move to ${DEAL_STAGE_LABELS[s]}`}
                      >
                        → {DEAL_STAGE_LABELS[s].split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
