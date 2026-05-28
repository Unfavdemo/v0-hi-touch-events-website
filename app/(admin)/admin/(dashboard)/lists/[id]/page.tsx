import Link from "next/link"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { addContactToList, removeContactFromList, deleteContactList } from "@/lib/actions/lists"
import { LIST_WORKFLOW_STEPS, parseWorkflowStep } from "@/lib/crm/workflows"
import { CrmDetailHeader } from "@/components/admin/crm-detail-header"
import { CrmSectionCard } from "@/components/admin/crm-section-card"
import { CrmWorkspace } from "@/components/admin/crm-workspace"

export const dynamic = "force-dynamic"

const STEP_IDS = LIST_WORKFLOW_STEPS.map((s) => s.id)

export default async function AdminListDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ step?: string }>
}) {
  const { id } = await params
  const { step: stepRaw } = await searchParams
  const initialStep = parseWorkflowStep(stepRaw, STEP_IDS, "add")
  const base = `/admin/lists/${id}`

  const list = await prisma.contactList.findUnique({
    where: { id },
    include: {
      members: {
        include: { contact: { include: { company: true } } },
        orderBy: { addedAt: "desc" },
      },
    },
  })
  if (!list) notFound()

  const memberIds = new Set(list.members.map((m) => m.contactId))
  const availableContacts = await prisma.contact.findMany({
    where: memberIds.size > 0 ? { id: { notIn: [...memberIds] } } : undefined,
    orderBy: { email: "asc" },
    take: 200,
    select: { id: true, email: true, firstName: true, lastName: true },
  })

  const stepDone: Record<string, boolean> = {
    add: list.members.length > 0,
    members: list.members.length > 0,
  }

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <CrmDetailHeader
        backHref="/admin/lists"
        backLabel="Lists"
        eyebrow="Contact list"
        title={list.name}
        subtitle={list.description ?? undefined}
      />

      <Suspense fallback={<p className="mt-10 text-sm text-muted-foreground">Loading…</p>}>
        <div className="mt-10">
          <CrmWorkspace basePath={base} steps={LIST_WORKFLOW_STEPS} initialStep={initialStep} stepDone={stepDone}>
            {{
              add: (
                <CrmSectionCard title="Add people" description="Search your contacts and add them to this list.">
                  <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
                    {availableContacts.length === 0 ? (
                      <li className="text-muted-foreground">Everyone is already on this list.</li>
                    ) : (
                      availableContacts.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                        >
                          <span>
                            {[c.firstName, c.lastName].filter(Boolean).join(" ") || c.email}
                            <span className="ml-2 text-muted-foreground">{c.email}</span>
                          </span>
                          <form action={addContactToList.bind(null, list.id, c.id)}>
                            <button type="submit" className="text-xs font-medium text-brand-ink hover:underline">
                              Add
                            </button>
                          </form>
                        </li>
                      ))
                    )}
                  </ul>
                  <a href={`${base}?step=members`} className="mt-4 inline-block text-sm text-muted-foreground hover:underline">
                    Next: Members →
                  </a>
                </CrmSectionCard>
              ),
              members: (
                <CrmSectionCard title={`Members (${list.members.length})`} description="People on this list for campaigns or outreach.">
                  <ul className="space-y-2 text-sm">
                    {list.members.map((m) => (
                      <li key={m.contactId} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                        <div>
                          <Link href={`/admin/crm/contacts/${m.contact.id}`} className="font-medium hover:underline">
                            {[m.contact.firstName, m.contact.lastName].filter(Boolean).join(" ") || m.contact.email}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {m.contact.email}
                            {m.contact.company ? ` · ${m.contact.company.name}` : ""}
                          </p>
                        </div>
                        <form action={removeContactFromList.bind(null, list.id, m.contactId)}>
                          <button type="submit" className="text-xs text-destructive hover:underline">
                            Remove
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                  <form action={deleteContactList.bind(null, list.id)} className="mt-8 border-t border-border pt-4">
                    <button type="submit" className="text-xs text-destructive hover:underline">
                      Delete list
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
