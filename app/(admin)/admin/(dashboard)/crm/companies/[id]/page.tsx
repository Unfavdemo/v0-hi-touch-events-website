import Link from "next/link"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCompanyTimeline } from "@/lib/queries/company-timeline"
import { tagCompanyHiTouchClient, untagCompanyHiTouchClient, updateCompany } from "@/lib/actions/crm"
import { COMPANY_WORKFLOW_STEPS, parseWorkflowStep } from "@/lib/crm/workflows"
import { CompanyMasterTimeline } from "@/components/admin/company-master-timeline"
import { CrmDetailHeader } from "@/components/admin/crm-detail-header"
import { CrmSectionCard } from "@/components/admin/crm-section-card"
import { CrmWorkspace } from "@/components/admin/crm-workspace"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Company | Admin",
  robots: { index: false, follow: false },
}

const STEP_IDS = COMPANY_WORKFLOW_STEPS.map((s) => s.id)

export default async function AdminCompanyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ step?: string; hiTouchClientId?: string }>
}) {
  const { id } = await params
  const { step: stepRaw, hiTouchClientId } = await searchParams
  const initialStep = parseWorkflowStep(stepRaw, STEP_IDS, "profile")
  const base = `/admin/crm/companies/${id}`

  if (!process.env.DATABASE_URL) {
    return (
      <main className="p-6 md:p-10">
        <p className="text-muted-foreground">Configure `DATABASE_URL`.</p>
      </main>
    )
  }

  const [company, hiTouchClients, timeline] = await Promise.all([
    prisma.company.findUnique({
      where: { id },
      include: {
        clientTags: { include: { hiTouchClient: true } },
        contacts: {
          orderBy: { email: "asc" },
          take: 200,
          include: { clientTags: { include: { hiTouchClient: true } } },
        },
      },
    }),
    prisma.hiTouchClient.findMany({ orderBy: { name: "asc" } }),
    getCompanyTimeline(id, { hiTouchClientId: hiTouchClientId || undefined }),
  ])

  if (!company) notFound()

  const tagged = new Set(company.clientTags.map((t) => t.hiTouchClientId))
  const filteredContacts = hiTouchClientId
    ? company.contacts.filter((c) => c.clientTags.some((t) => t.hiTouchClientId === hiTouchClientId))
    : company.contacts

  const stepDone: Record<string, boolean> = {
    profile: Boolean(company.name && (company.website || company.notes)),
    tags: company.clientTags.length > 0,
    contacts: company.contacts.length > 0,
    timeline: timeline.length > 0,
  }

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <CrmDetailHeader backHref="/admin/crm/companies" backLabel="Companies" eyebrow="Company" title={company.name} />

      <Suspense fallback={<p className="mt-10 text-sm text-muted-foreground">Loading…</p>}>
        <div className="mt-10">
          <CrmWorkspace basePath={base} steps={COMPANY_WORKFLOW_STEPS} initialStep={initialStep} stepDone={stepDone}>
            {{
              profile: (
                <CrmSectionCard title="Company info" description="Name and website shown across the CRM.">
                  <form action={updateCompany.bind(null, company.id)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Company name</label>
                      <input
                        name="name"
                        required
                        defaultValue={company.name}
                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Website</label>
                      <input
                        name="website"
                        defaultValue={company.website ?? ""}
                        placeholder="https://"
                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Notes</label>
                      <textarea
                        name="notes"
                        rows={3}
                        defaultValue={company.notes ?? ""}
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
                      <a href={`${base}?step=tags`} className="text-sm text-muted-foreground hover:underline">
                        Next: Client tags →
                      </a>
                    </div>
                  </form>
                </CrmSectionCard>
              ),
              tags: (
                <CrmSectionCard title="HiTouch client tags" description="Which accounts this company works with.">
                  <ul className="space-y-2 text-sm">
                    {hiTouchClients.map((hc) => (
                      <li
                        key={hc.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                      >
                        <span>{hc.name}</span>
                        {tagged.has(hc.id) ? (
                          <form
                            action={async () => {
                              "use server"
                              await untagCompanyHiTouchClient(company.id, hc.id)
                            }}
                          >
                            <button type="submit" className="text-xs text-destructive hover:underline">
                              Remove
                            </button>
                          </form>
                        ) : (
                          <form
                            action={async () => {
                              "use server"
                              await tagCompanyHiTouchClient(company.id, hc.id)
                            }}
                          >
                            <button type="submit" className="text-xs text-brand-ink hover:underline">
                              Add
                            </button>
                          </form>
                        )}
                      </li>
                    ))}
                  </ul>
                  <a href={`${base}?step=contacts`} className="mt-4 inline-block text-sm text-muted-foreground hover:underline">
                    Next: People →
                  </a>
                </CrmSectionCard>
              ),
              contacts: (
                <CrmSectionCard title="People at this company" description="Open a contact to edit their profile.">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Link
                      href={base}
                      className={`rounded-full border px-3 py-1 ${!hiTouchClientId ? "border-brand bg-brand/10" : "border-border"}`}
                    >
                      All
                    </Link>
                    {hiTouchClients.map((hc) => (
                      <Link
                        key={hc.id}
                        href={`${base}?step=contacts&hiTouchClientId=${hc.id}`}
                        className={`rounded-full border px-3 py-1 ${hiTouchClientId === hc.id ? "border-brand bg-brand/10" : "border-border"}`}
                      >
                        {hc.name}
                      </Link>
                    ))}
                  </div>
                  <ul className="mt-4 space-y-2 text-sm">
                    {filteredContacts.length === 0 ? (
                      <li className="text-muted-foreground">
                        No contacts yet.{" "}
                        <Link href="/admin/crm/contacts" className="text-brand-ink hover:underline">
                          Add one
                        </Link>{" "}
                        and assign this company.
                      </li>
                    ) : (
                      filteredContacts.map((c) => (
                        <li key={c.id} className="rounded-lg border border-border px-3 py-2">
                          <Link href={`/admin/crm/contacts/${c.id}`} className="font-medium text-brand-ink hover:underline">
                            {[c.firstName, c.lastName].filter(Boolean).join(" ") || c.email}
                          </Link>
                          <span className="ml-2 text-muted-foreground">{c.email}</span>
                        </li>
                      ))
                    )}
                  </ul>
                  <a href={`${base}?step=timeline`} className="mt-4 inline-block text-sm text-muted-foreground hover:underline">
                    Next: Timeline →
                  </a>
                </CrmSectionCard>
              ),
              timeline: (
                <div>
                  <CompanyMasterTimeline items={timeline} />
                </div>
              ),
            }}
          </CrmWorkspace>
        </div>
      </Suspense>
    </main>
  )
}
