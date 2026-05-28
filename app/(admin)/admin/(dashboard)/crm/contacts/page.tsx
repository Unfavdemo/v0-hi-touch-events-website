import Link from "next/link"
import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { contactSearchWhere, normalizeAdminQuery } from "@/lib/admin-search"
import { AdminFilters } from "@/components/admin/admin-filters"
import { AdminPagination } from "@/components/admin/admin-pagination"
import { CreateContactForm } from "@/components/admin/create-contact-form"
import { CrmListGuide } from "@/components/admin/crm-list-guide"
import { CRM_EMPTY, CRM_SECTION } from "@/lib/crm/admin-copy"
import { CONTACTS_LIST_GUIDE } from "@/lib/crm/workflows"
import { ADMIN_PAGE_SIZE, adminSkip, parseAdminPage } from "@/lib/admin-pagination"

type ContactRow = Prisma.ContactGetPayload<{
  include: {
    company: true
    clientTags: { include: { hiTouchClient: true } }
  }
}>

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Contacts | Admin",
  robots: { index: false, follow: false },
}

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q: qRaw, page: pageRaw } = await searchParams
  const q = normalizeAdminQuery(qRaw)
  const page = parseAdminPage(pageRaw)

  let contacts: ContactRow[] = []
  let total = 0
  let companies: { id: string; name: string }[] = []
  const where: Prisma.ContactWhereInput = q ? contactSearchWhere(q) : {}

  if (process.env.DATABASE_URL) {
    try {
      ;[contacts, total, companies] = await Promise.all([
        prisma.contact.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip: adminSkip(page),
          take: ADMIN_PAGE_SIZE,
          include: {
            company: true,
            clientTags: { include: { hiTouchClient: true } },
          },
        }),
        prisma.contact.count({ where }),
        prisma.company.findMany({ orderBy: { name: "asc" }, take: 500, select: { id: true, name: true } }),
      ])
    } catch {
      contacts = []
      total = 0
      companies = []
    }
  }

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <h1 className="font-display text-3xl font-normal uppercase tracking-tight">Contacts</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{CRM_SECTION.contactsList}</p>

      <CrmListGuide steps={CONTACTS_LIST_GUIDE} stepDone={{ add: total > 0, open: total > 0 }} />

      <AdminFilters
        basePath="/admin/crm/contacts"
        q={qRaw ?? ""}
        searchPlaceholder="Name, email, company…"
        resultCount={total}
        resultLabel="contacts"
      />

      {!process.env.DATABASE_URL ? (
        <p className="mt-8 text-muted-foreground">Configure `DATABASE_URL`.</p>
      ) : (
        <>
          <CreateContactForm companies={companies} />
          {contacts.length === 0 ? (
            <p className="mt-8 text-muted-foreground">{q ? "No contacts match your search." : CRM_EMPTY.contacts}</p>
          ) : (
            <div id="contacts-list" className="mt-4 overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-border bg-muted/30 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">HiTouch clients</th>
                    <th className="px-4 py-3 w-24" />
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c.id} className="border-b border-border/80 last:border-0">
                      <td className="px-4 py-3">{[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}</td>
                      <td className="px-4 py-3">{c.email}</td>
                      <td className="px-4 py-3">{c.company?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.clientTags.map((t) => t.hiTouchClient.name).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/crm/contacts/${c.id}`}
                          className="text-[10px] uppercase tracking-[0.2em] text-brand-ink hover:underline"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <AdminPagination
            basePath="/admin/crm/contacts"
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
