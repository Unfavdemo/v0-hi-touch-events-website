import Link from "next/link"
import { createDeal } from "@/lib/actions/deals"
import { getDealsByStage } from "@/lib/queries/crm-dashboard"
import { DealPipelineBoard } from "@/components/admin/deal-pipeline-board"
import { CrmListGuide } from "@/components/admin/crm-list-guide"
import { DEALS_LIST_GUIDE } from "@/lib/crm/workflows"
import { prisma } from "@/lib/prisma"
import { formatDealAmount, OPEN_DEAL_STAGES } from "@/lib/crm/deal-stages"
import { DealStage } from "@/lib/generated/prisma/client"
import type { DealStage as DealStageEnum } from "@/lib/generated/prisma/client"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Deals pipeline | Admin",
  robots: { index: false, follow: false },
}

export default async function AdminDealsPage() {
  if (!process.env.DATABASE_URL) {
    return (
      <main className="p-6 md:p-10">
        <p className="text-muted-foreground">Configure DATABASE_URL.</p>
      </main>
    )
  }

  const [deals, contacts, companies, clients, pipelineValue] = await Promise.all([
    getDealsByStage(),
    prisma.contact.findMany({ orderBy: { email: "asc" }, take: 200, select: { id: true, email: true, firstName: true, lastName: true } }),
    prisma.company.findMany({ orderBy: { name: "asc" }, take: 100, select: { id: true, name: true } }),
    prisma.hiTouchClient.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.deal.aggregate({
      where: { stage: { in: OPEN_DEAL_STAGES as DealStageEnum[] } },
      _sum: { amount: true },
    }),
  ])

  const wonCount = deals.filter((d) => d.stage === DealStage.CLOSED_WON).length

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-normal uppercase tracking-tight">Deals</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sales pipeline — drag cards to change stage. Open pipeline: {formatDealAmount(pipelineValue._sum.amount)} ·{" "}
            {wonCount} won
          </p>
        </div>
        <Link
          href="/admin/tasks"
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-brand-ink"
        >
          View tasks →
        </Link>
      </div>

      <CrmListGuide steps={DEALS_LIST_GUIDE} stepDone={{ create: deals.length > 0, pipeline: deals.length > 0 }} />

      <details id="add-deal" className="mt-8 rounded-lg border border-border p-4">
        <summary className="cursor-pointer font-display text-sm uppercase tracking-[0.28em] text-brand-ink">
          Create deal
        </summary>
        <form action={createDeal} className="mt-4 grid max-w-xl gap-3">
          <input name="name" required placeholder="Deal name" className="rounded border border-border bg-background px-3 py-2 text-sm" />
          <input name="amount" type="text" placeholder="Amount (e.g. 15000)" className="rounded border border-border bg-background px-3 py-2 text-sm" />
          <input name="closeDate" type="date" className="rounded border border-border bg-background px-3 py-2 text-sm" />
          <select name="contactId" defaultValue="" className="rounded border border-border bg-background px-3 py-2 text-sm">
            <option value="">— Contact —</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {[c.firstName, c.lastName].filter(Boolean).join(" ") || c.email}
              </option>
            ))}
          </select>
          <select name="companyId" defaultValue="" className="rounded border border-border bg-background px-3 py-2 text-sm">
            <option value="">— Company —</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select name="hiTouchClientId" defaultValue="" className="rounded border border-border bg-background px-3 py-2 text-sm">
            <option value="">— HiTouch client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <textarea name="notes" rows={2} placeholder="Internal notes" className="rounded border border-border bg-background px-3 py-2 text-sm" />
          <button type="submit" className="font-display w-fit rounded-full border-2 border-brand px-4 py-2 text-[10px] uppercase tracking-[0.2em]">
            Add deal
          </button>
        </form>
      </details>

      <div id="pipeline">
        <DealPipelineBoard deals={deals} />
      </div>
    </main>
  )
}
