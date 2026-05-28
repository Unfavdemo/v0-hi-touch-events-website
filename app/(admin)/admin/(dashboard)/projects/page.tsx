import Link from "next/link"
import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { eventProjectSearchWhere, normalizeAdminQuery } from "@/lib/admin-search"
import { AdminFilters } from "@/components/admin/admin-filters"
import { CrmListGuide } from "@/components/admin/crm-list-guide"
import { CRM_EMPTY, CRM_SECTION } from "@/lib/crm/admin-copy"
import { PROJECTS_LIST_GUIDE } from "@/lib/crm/workflows"

const projectInclude = { hiTouchClient: true } satisfies Prisma.EventProjectInclude

type ProjectWithClient = Prisma.EventProjectGetPayload<{ include: typeof projectInclude }>

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Projects | Admin",
  robots: { index: false, follow: false },
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; hiTouchClientId?: string }>
}) {
  const { q: qRaw, hiTouchClientId } = await searchParams
  const q = normalizeAdminQuery(qRaw)

  let projects: ProjectWithClient[] = []
  let hiTouchClients: { id: string; name: string }[] = []

  const where: Prisma.EventProjectWhereInput = {
    ...(q ? eventProjectSearchWhere(q) : {}),
    ...(hiTouchClientId && hiTouchClientId !== "__none__" ? { hiTouchClientId } : {}),
  }

  if (process.env.DATABASE_URL) {
    try {
      ;[projects, hiTouchClients] = await Promise.all([
        prisma.eventProject.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          take: 100,
          include: projectInclude,
        }),
        prisma.hiTouchClient.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
      ])
    } catch {
      projects = []
      hiTouchClients = []
    }
  }

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <h1 className="font-display text-3xl font-normal uppercase tracking-tight">Event projects</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{CRM_SECTION.projectsList}</p>

      <CrmListGuide steps={PROJECTS_LIST_GUIDE} stepDone={{ create: projects.length > 0 }} />

      <AdminFilters
        basePath="/admin/projects"
        q={qRaw ?? ""}
        searchPlaceholder="Project name, notes, client…"
        resultCount={projects.length}
        resultLabel="projects"
        selects={
          hiTouchClients.length > 0
            ? [
                {
                  name: "hiTouchClientId",
                  label: "HiTouch client",
                  value: hiTouchClientId,
                  options: [
                    { value: "", label: "All clients" },
                    ...hiTouchClients.map((c) => ({ value: c.id, label: c.name })),
                  ],
                },
              ]
            : []
        }
      />

      <div className="mt-8">
        <Link
          href="/admin/projects/new"
          className="font-display inline-flex rounded-full border-2 border-brand bg-brand px-6 py-3 text-[10px] uppercase tracking-[0.28em] text-brand-foreground transition-colors hover:bg-brand/90"
        >
          + Create new project
        </Link>
        <p className="mt-2 text-xs text-muted-foreground">Step-by-step setup — details, budget, email vendors, pick a winner.</p>
      </div>

      {!process.env.DATABASE_URL ? (
        <p className="mt-8 text-muted-foreground">Configure `DATABASE_URL`.</p>
      ) : projects.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          {q || hiTouchClientId ? "No projects match your filters." : CRM_EMPTY.projects}
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/projects/${p.id}`}
                className="block rounded-lg border border-border px-4 py-4 transition-colors hover:border-brand hover:bg-brand/5"
              >
                <span className="font-medium">{p.name}</span>
                {p.hiTouchClient ? (
                  <span className="mt-1 block text-sm text-muted-foreground">Client: {p.hiTouchClient.name}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
