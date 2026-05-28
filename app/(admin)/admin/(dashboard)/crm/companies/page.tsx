import Link from "next/link"
import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { createCompany } from "@/lib/actions/crm"
import { companySearchWhere, normalizeAdminQuery } from "@/lib/admin-search"
import { AdminFilters } from "@/components/admin/admin-filters"
import { AdminPagination } from "@/components/admin/admin-pagination"
import { CrmListGuide } from "@/components/admin/crm-list-guide"
import { CRM_EMPTY, CRM_SECTION } from "@/lib/crm/admin-copy"
import { COMPANIES_LIST_GUIDE } from "@/lib/crm/workflows"
import { ADMIN_PAGE_SIZE, adminSkip, parseAdminPage } from "@/lib/admin-pagination"

const companyInclude = {
  _count: { select: { contacts: true, clientTags: true } },
} satisfies Prisma.CompanyInclude

type CompanyRow = Prisma.CompanyGetPayload<{ include: typeof companyInclude }>

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Companies | Admin",
  robots: { index: false, follow: false },
}

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q: qRaw, page: pageRaw } = await searchParams
  const q = normalizeAdminQuery(qRaw)
  const page = parseAdminPage(pageRaw)

  let companies: CompanyRow[] = []
  let total = 0
  const where: Prisma.CompanyWhereInput = q ? companySearchWhere(q) : {}

  if (process.env.DATABASE_URL) {
    try {
      ;[companies, total] = await Promise.all([
        prisma.company.findMany({
          where,
          orderBy: { name: "asc" },
          skip: adminSkip(page),
          take: ADMIN_PAGE_SIZE,
          include: companyInclude,
        }),
        prisma.company.count({ where }),
      ])
    } catch {
      companies = []
      total = 0
    }
  }

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <h1 className="font-display text-3xl font-normal uppercase tracking-tight">Companies</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{CRM_SECTION.companiesList}</p>

      <CrmListGuide steps={COMPANIES_LIST_GUIDE} stepDone={{ create: total > 0, tag: total > 0 }} />

      <AdminFilters
        basePath="/admin/crm/companies"
        q={qRaw ?? ""}
        searchPlaceholder="Company name, website…"
        resultCount={total}
        resultLabel="companies"
      />

      <section id="add-company" className="mt-8 max-w-md rounded-lg border border-border p-4">
        <h2 className="font-display text-xs uppercase tracking-[0.28em] text-brand-ink">New company</h2>
        <form action={createCompany} className="mt-3 space-y-2">
          <input name="name" required placeholder="Name" className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm" />
          <input name="website" placeholder="Website (optional)" className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm" />
          <button type="submit" className="font-display text-[10px] uppercase tracking-[0.2em] text-brand-ink hover:underline">
            Create
          </button>
        </form>
      </section>
      {!process.env.DATABASE_URL ? (
        <p className="mt-8 text-muted-foreground">Configure `DATABASE_URL`.</p>
      ) : companies.length === 0 ? (
        <p className="mt-8 text-muted-foreground">{q ? "No companies match your search." : CRM_EMPTY.companies}</p>
      ) : (
        <>
          <div id="companies-list" className="mt-8 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-border bg-muted/30 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contacts</th>
                  <th className="px-4 py-3">Client tags</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className="border-b border-border/80 last:border-0">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 tabular-nums">{c._count.contacts}</td>
                    <td className="px-4 py-3 tabular-nums">{c._count.clientTags}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/crm/companies/${c.id}`} className="text-[10px] uppercase tracking-[0.2em] text-brand-ink hover:underline">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination
            basePath="/admin/crm/companies"
            page={page}
            pageSize={ADMIN_PAGE_SIZE}
            total={total}
            searchParams={{ q: qRaw }}
          />
        </>
      )}
    </main>
  )
}
