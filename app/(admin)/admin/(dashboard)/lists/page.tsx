import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { createContactList } from "@/lib/actions/lists"
import { CrmListGuide } from "@/components/admin/crm-list-guide"
import { LISTS_LIST_GUIDE } from "@/lib/crm/workflows"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Contact lists | Admin",
  robots: { index: false, follow: false },
}

export default async function AdminListsPage() {
  if (!process.env.DATABASE_URL) {
    return (
      <main className="p-6 md:p-10">
        <p className="text-muted-foreground">Configure DATABASE_URL.</p>
      </main>
    )
  }

  const lists = await prisma.contactList.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { members: true } },
      createdBy: { include: { user: { select: { email: true } } } },
    },
  })

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <h1 className="font-display text-3xl font-normal uppercase tracking-tight">Lists</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Saved groups of contacts for campaigns, invites, or exports — without changing the underlying records.
      </p>

      <CrmListGuide steps={LISTS_LIST_GUIDE} stepDone={{ create: lists.length > 0 }} />

      <details id="add-list" className="mt-8 rounded-lg border border-border p-4">
        <summary className="cursor-pointer font-display text-sm uppercase tracking-[0.28em] text-brand-ink">
          Create list
        </summary>
        <form action={createContactList} className="mt-4 grid max-w-md gap-3">
          <input name="name" required placeholder="List name" className="rounded border border-border bg-background px-3 py-2 text-sm" />
          <textarea name="description" rows={2} placeholder="Description" className="rounded border border-border bg-background px-3 py-2 text-sm" />
          <button type="submit" className="font-display w-fit rounded-full border-2 border-brand px-4 py-2 text-[10px] uppercase tracking-[0.2em]">
            Create
          </button>
        </form>
      </details>

      <ul id="lists" className="mt-8 space-y-2">
        {lists.length === 0 ? (
          <li className="text-sm text-muted-foreground">No lists yet.</li>
        ) : (
          lists.map((list) => (
            <li key={list.id}>
              <Link
                href={`/admin/lists/${list.id}`}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-muted/30"
              >
                <div>
                  <p className="font-medium">{list.name}</p>
                  {list.description ? <p className="mt-1 text-xs text-muted-foreground">{list.description}</p> : null}
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">{list._count.members} contacts</span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </main>
  )
}
