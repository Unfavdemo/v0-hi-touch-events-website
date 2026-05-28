import Link from "next/link"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { updateHiTouchClient } from "@/lib/actions/crm"
import { CLIENT_WORKFLOW_STEPS, parseWorkflowStep } from "@/lib/crm/workflows"
import { CrmDetailHeader } from "@/components/admin/crm-detail-header"
import { CrmSectionCard } from "@/components/admin/crm-section-card"
import { CrmWorkspace } from "@/components/admin/crm-workspace"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Edit HiTouch client | Admin",
  robots: { index: false, follow: false },
}

const STEP_IDS = CLIENT_WORKFLOW_STEPS.map((s) => s.id)

export default async function AdminHiTouchClientEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ step?: string }>
}) {
  const { id } = await params
  const { step: stepRaw } = await searchParams
  const initialStep = parseWorkflowStep(stepRaw, STEP_IDS, "profile")
  const base = `/admin/clients/${id}`

  if (!process.env.DATABASE_URL) {
    return (
      <main className="p-6 md:p-10">
        <p className="text-muted-foreground">Configure `DATABASE_URL`.</p>
      </main>
    )
  }

  const [client, projectCount, dealCount, contactTagCount] = await Promise.all([
    prisma.hiTouchClient.findUnique({ where: { id } }),
    prisma.eventProject.count({ where: { hiTouchClientId: id } }),
    prisma.deal.count({ where: { hiTouchClientId: id } }),
    prisma.contactHiTouchClient.count({ where: { hiTouchClientId: id } }),
  ])

  if (!client) notFound()

  const stepDone: Record<string, boolean> = {
    profile: Boolean(client.name && client.slug),
    links: projectCount > 0 || dealCount > 0 || contactTagCount > 0,
  }

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <CrmDetailHeader
        backHref="/admin/clients"
        backLabel="HiTouch clients"
        eyebrow="HiTouch client"
        title={client.name}
        subtitle={client.kind.toLowerCase()}
      />

      <Suspense fallback={<p className="mt-10 text-sm text-muted-foreground">Loading…</p>}>
        <div className="mt-10">
          <CrmWorkspace basePath={base} steps={CLIENT_WORKFLOW_STEPS} initialStep={initialStep} stepDone={stepDone}>
            {{
              profile: (
                <CrmSectionCard title="Client profile" description="This is the nonprofit or corporate account you produce events for.">
                  <form action={updateHiTouchClient.bind(null, client.id)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <input
                        name="name"
                        required
                        defaultValue={client.name}
                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">URL slug</label>
                      <input
                        name="slug"
                        required
                        defaultValue={client.slug}
                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <select
                        name="kind"
                        defaultValue={client.kind}
                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="NONPROFIT">Nonprofit</option>
                        <option value="CORPORATE">Corporate</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Notes</label>
                      <textarea
                        name="notes"
                        rows={4}
                        defaultValue={client.notes ?? ""}
                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        className="font-display rounded-full border-2 border-brand bg-brand px-6 py-2.5 text-[10px] uppercase tracking-[0.28em] text-brand-foreground"
                      >
                        Save
                      </button>
                      <a href={`${base}?step=links`} className="text-sm text-muted-foreground hover:underline">
                        Next: Linked records →
                      </a>
                    </div>
                  </form>
                </CrmSectionCard>
              ),
              links: (
                <CrmSectionCard title="Linked records" description="Jump to related projects, deals, and tagged contacts.">
                  <dl className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-border p-4">
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Tagged contacts</dt>
                      <dd className="mt-2 font-display text-2xl tabular-nums">{contactTagCount}</dd>
                      <Link href="/admin/crm/contacts" className="mt-2 inline-block text-xs text-brand-ink hover:underline">
                        View contacts →
                      </Link>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Projects</dt>
                      <dd className="mt-2 font-display text-2xl tabular-nums">{projectCount}</dd>
                      <Link href="/admin/projects" className="mt-2 inline-block text-xs text-brand-ink hover:underline">
                        View projects →
                      </Link>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Deals</dt>
                      <dd className="mt-2 font-display text-2xl tabular-nums">{dealCount}</dd>
                      <Link href="/admin/deals" className="mt-2 inline-block text-xs text-brand-ink hover:underline">
                        View deals →
                      </Link>
                    </div>
                  </dl>
                </CrmSectionCard>
              ),
            }}
          </CrmWorkspace>
        </div>
      </Suspense>
    </main>
  )
}
