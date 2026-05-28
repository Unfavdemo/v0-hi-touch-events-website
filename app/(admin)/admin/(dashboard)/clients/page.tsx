import Link from "next/link"
import { ClientKind, type Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { createHiTouchClient } from "@/lib/actions/crm"
import { hiTouchClientSearchWhere, normalizeAdminQuery } from "@/lib/admin-search"
import { AdminFilters } from "@/components/admin/admin-filters"
import { CrmListGuide } from "@/components/admin/crm-list-guide"
import { CRM_SECTION } from "@/lib/crm/admin-copy"
import { CLIENTS_LIST_GUIDE } from "@/lib/crm/workflows"

const clientInclude = {
  _count: { select: { contacts: true, companies: true, projects: true } },
} satisfies Prisma.HiTouchClientInclude

type HiTouchClientRow = Prisma.HiTouchClientGetPayload<{ include: typeof clientInclude }>

export const dynamic = "force-dynamic"

export const metadata = {
  title: "HiTouch clients | Admin",
  robots: { index: false, follow: false },
}

const KIND_OPTIONS = [
  { value: "", label: "All kinds" },
  { value: ClientKind.NONPROFIT, label: "Nonprofit" },
  { value: ClientKind.CORPORATE, label: "Corporate" },
  { value: ClientKind.OTHER, label: "Other" },
]

export default async function AdminHiTouchClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kind?: string }>
}) {
  const { q: qRaw, kind: kindFilter } = await searchParams
  const q = normalizeAdminQuery(qRaw)

  let clients: HiTouchClientRow[] = []

  const where: Prisma.HiTouchClientWhereInput = {
    ...(q ? hiTouchClientSearchWhere(q) : {}),
    ...(kindFilter && Object.values(ClientKind).includes(kindFilter as ClientKind)
      ? { kind: kindFilter as ClientKind }
      : {}),
  }

  if (process.env.DATABASE_URL) {
    try {
      clients = await prisma.hiTouchClient.findMany({
        where,
        orderBy: { name: "asc" },
        include: clientInclude,
      })
    } catch {
      clients = []
    }
  }

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <h1 className="font-display text-3xl font-normal uppercase tracking-tight">HiTouch clients</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{CRM_SECTION.clientsList}</p>

      <CrmListGuide steps={CLIENTS_LIST_GUIDE} stepDone={{ create: clients.length > 0 }} />

      <AdminFilters
        basePath="/admin/clients"
        q={qRaw ?? ""}
        searchPlaceholder="Name, slug…"
        resultCount={clients.length}
        resultLabel="clients"
        selects={[
          {
            name: "kind",
            label: "Kind",
            value: kindFilter,
            options: KIND_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
          },
        ]}
      />

      <section id="add-client" className="mt-8 max-w-lg rounded-lg border border-border p-4">
        <h2 className="font-display text-xs uppercase tracking-[0.28em] text-brand-ink">Add client</h2>
        <form action={createHiTouchClient} className="mt-3 space-y-2">
          <input name="name" required placeholder="Display name" className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm" />
          <input name="slug" placeholder="URL slug (optional — derived from name)" className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm" />
          <select name="kind" className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm">
            <option value="NONPROFIT">Nonprofit</option>
            <option value="CORPORATE">Corporate</option>
            <option value="OTHER">Other</option>
          </select>
          <textarea name="notes" rows={2} placeholder="Notes (optional)" className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm" />
          <button type="submit" className="font-display text-[10px] uppercase tracking-[0.2em] text-brand-ink hover:underline">
            Create
          </button>
        </form>
      </section>

      {!process.env.DATABASE_URL ? (
        <p className="mt-8 text-muted-foreground">Configure `DATABASE_URL`.</p>
      ) : clients.length === 0 ? (
        <p className="mt-8 text-muted-foreground">{q || kindFilter ? "No clients match your filters." : "No clients yet."}</p>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-lg border border-border">
          {clients.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.slug} · {c.kind.toLowerCase()} · {c._count.contacts} contacts · {c._count.companies} companies ·{" "}
                  {c._count.projects} projects
                </p>
              </div>
              <Link href={`/admin/clients/${c.id}`} className="text-[10px] uppercase tracking-[0.2em] text-brand-ink hover:underline">
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
