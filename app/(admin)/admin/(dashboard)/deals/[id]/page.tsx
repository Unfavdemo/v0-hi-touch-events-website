import Link from "next/link"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { updateDeal, deleteDeal } from "@/lib/actions/deals"
import { DEAL_WORKFLOW_STEPS, parseWorkflowStep } from "@/lib/crm/workflows"
import { DEAL_STAGE_LABELS, DEAL_STAGES, formatDealAmount } from "@/lib/crm/deal-stages"
import { CrmDetailHeader } from "@/components/admin/crm-detail-header"
import { CrmSectionCard } from "@/components/admin/crm-section-card"
import { CrmWorkspace } from "@/components/admin/crm-workspace"

export const dynamic = "force-dynamic"

const STEP_IDS = DEAL_WORKFLOW_STEPS.map((s) => s.id)

export default async function AdminDealDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ step?: string }>
}) {
  const { id } = await params
  const { step: stepRaw } = await searchParams
  const initialStep = parseWorkflowStep(stepRaw, STEP_IDS, "deal")
  const base = `/admin/deals/${id}`

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      contact: true,
      company: true,
      hiTouchClient: true,
      project: true,
      owner: { include: { user: true } },
      tasks: { orderBy: { dueAt: "asc" } },
    },
  })
  if (!deal) notFound()

  const [contacts, companies, clients, admins] = await Promise.all([
    prisma.contact.findMany({ orderBy: { email: "asc" }, take: 200 }),
    prisma.company.findMany({ orderBy: { name: "asc" }, take: 100 }),
    prisma.hiTouchClient.findMany({ orderBy: { name: "asc" } }),
    prisma.adminUser.findMany({ include: { user: { select: { email: true, name: true } } } }),
  ])

  const stepDone: Record<string, boolean> = {
    deal: Boolean(deal.amount || deal.closeDate),
    links: Boolean(deal.contactId || deal.companyId || deal.projectId),
    tasks: deal.tasks.length > 0,
  }

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <CrmDetailHeader
        backHref="/admin/deals"
        backLabel="Deals"
        eyebrow="Deal"
        title={deal.name}
        subtitle={`${DEAL_STAGE_LABELS[deal.stage]} · ${formatDealAmount(deal.amount, deal.currency)}`}
      />

      <Suspense fallback={<p className="mt-10 text-sm text-muted-foreground">Loading…</p>}>
        <div className="mt-10">
          <CrmWorkspace basePath={base} steps={DEAL_WORKFLOW_STEPS} initialStep={initialStep} stepDone={stepDone}>
            {{
              deal: (
                <CrmSectionCard title="Deal details" description="Update stage and amount as the opportunity moves.">
                  <form action={updateDeal.bind(null, deal.id)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Deal name</label>
                      <input
                        name="name"
                        defaultValue={deal.name}
                        required
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Stage</label>
                      <select name="stage" defaultValue={deal.stage} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        {DEAL_STAGES.map((s) => (
                          <option key={s} value={s}>
                            {DEAL_STAGE_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Amount</label>
                        <input
                          name="amount"
                          defaultValue={deal.amount?.toString() ?? ""}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Expected close</label>
                        <input
                          name="closeDate"
                          type="date"
                          defaultValue={deal.closeDate ? deal.closeDate.toISOString().slice(0, 10) : ""}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <textarea
                      name="notes"
                      rows={4}
                      defaultValue={deal.notes ?? ""}
                      placeholder="Notes"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        className="font-display rounded-full border-2 border-brand bg-brand px-6 py-2.5 text-[10px] uppercase tracking-[0.28em] text-brand-foreground"
                      >
                        Save deal
                      </button>
                      <a href={`${base}?step=links`} className="text-sm text-muted-foreground hover:underline">
                        Next: Related records →
                      </a>
                    </div>
                  </form>
                </CrmSectionCard>
              ),
              links: (
                <CrmSectionCard title="Related records" description="Link this deal to people, companies, and projects.">
                  <form action={updateDeal.bind(null, deal.id)} className="space-y-4">
                    <input type="hidden" name="name" value={deal.name} />
                    <input type="hidden" name="stage" value={deal.stage} />
                    <div>
                      <label className="text-sm font-medium">Contact</label>
                      <select name="contactId" defaultValue={deal.contactId ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option value="">— None —</option>
                        {contacts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {[c.firstName, c.lastName].filter(Boolean).join(" ") || c.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Company</label>
                      <select name="companyId" defaultValue={deal.companyId ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option value="">— None —</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">HiTouch client</label>
                      <select
                        name="hiTouchClientId"
                        defaultValue={deal.hiTouchClientId ?? ""}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="">— None —</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Owner</label>
                      <select name="ownerId" defaultValue={deal.ownerId ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option value="">— None —</option>
                        {admins.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.user.email ?? a.user.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="font-display rounded-full border-2 border-brand px-6 py-2.5 text-[10px] uppercase tracking-[0.28em]"
                    >
                      Save links
                    </button>
                  </form>
                  {deal.project ? (
                    <p className="mt-4 text-sm">
                      Project:{" "}
                      <Link href={`/admin/projects/${deal.project.id}`} className="text-brand-ink hover:underline">
                        {deal.project.name}
                      </Link>
                    </p>
                  ) : null}
                  <a href={`${base}?step=tasks`} className="mt-4 inline-block text-sm text-muted-foreground hover:underline">
                    Next: Follow-ups →
                  </a>
                </CrmSectionCard>
              ),
              tasks: (
                <CrmSectionCard title="Follow-up tasks" description="Tasks linked to this deal.">
                  {deal.tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No tasks yet.{" "}
                      <Link href="/admin/tasks" className="text-brand-ink hover:underline">
                        Create one
                      </Link>{" "}
                      and link it to this deal.
                    </p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {deal.tasks.map((t) => (
                        <li key={t.id} className="rounded-lg border border-border px-3 py-2">
                          <Link href="/admin/tasks" className="font-medium hover:underline">
                            {t.title}
                          </Link>
                          {t.dueAt ? <span className="ml-2 text-muted-foreground">Due {t.dueAt.toLocaleDateString()}</span> : null}
                        </li>
                      ))}
                    </ul>
                  )}
                  <form action={deleteDeal.bind(null, deal.id)} className="mt-8 border-t border-border pt-4">
                    <button type="submit" className="text-xs text-destructive hover:underline">
                      Delete deal
                    </button>
                  </form>
                </CrmSectionCard>
              ),
            }}
          </CrmWorkspace>
        </div>
      </Suspense>
    </main>
  )
}
