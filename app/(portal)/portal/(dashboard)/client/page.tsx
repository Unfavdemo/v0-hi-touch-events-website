import Link from "next/link"
import { PortalKind } from "@/lib/generated/prisma/client"
import { requirePortalSession } from "@/lib/portal-route-guard"
import {
  getClientPortalWorkspace,
  getClientPortalWorkspaces,
} from "@/lib/queries/client-portal-workspace"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Client workspace | HiTouch",
  robots: { index: false, follow: false },
}

export default async function PortalClientPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>
}) {
  const { portal, contact } = await requirePortalSession(PortalKind.CLIENT)
  const { clientId: clientIdRaw } = await searchParams
  const workspaces = await getClientPortalWorkspaces(portal.contactId)

  const clientId = clientIdRaw && workspaces.some((w) => w.id === clientIdRaw) ? clientIdRaw : workspaces[0]?.id

  const workspace = clientId ? await getClientPortalWorkspace(portal.contactId, clientId) : null

  return (
    <>
      <h1 className="font-display text-2xl font-normal uppercase tracking-tight">Client workspace</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Signed in as {[contact.firstName, contact.lastName].filter(Boolean).join(" ") || contact.email}
        {contact.company ? ` · ${contact.company.name}` : ""}
      </p>

      {workspaces.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No HiTouch client relationships are linked to your profile yet. Contact your HiTouch coordinator.
        </p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {workspaces.map((w) => (
              <Link
                key={w.id}
                href={`/portal/client?clientId=${w.id}`}
                className={`rounded-full border px-3 py-1 text-xs ${
                  w.id === clientId ? "border-brand bg-brand/10" : "border-border"
                }`}
              >
                {w.name}
                {w.isPrimary ? " · primary" : ""}
              </Link>
            ))}
          </div>

          {workspace?.hiTouchClient ? (
            <section className="mt-10">
              <h2 className="font-display text-sm uppercase tracking-[0.28em] text-brand-ink">
                {workspace.hiTouchClient.name}
              </h2>

              {workspace.company ? (
                <div className="mt-4 rounded-lg border border-border p-4 text-sm">
                  <p className="font-medium">{workspace.company.name}</p>
                  {workspace.company.website ? (
                    <p className="mt-1 text-muted-foreground">{workspace.company.website}</p>
                  ) : null}
                </div>
              ) : null}

              <h3 className="font-display mt-8 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Related contacts at your company
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {workspace.relatedContacts.length === 0 ? (
                  <li className="text-muted-foreground">No other contacts on this client stream.</li>
                ) : (
                  workspace.relatedContacts.map((c) => (
                    <li key={c.id}>
                      {[c.firstName, c.lastName].filter(Boolean).join(" ") || c.email}
                      <span className="ml-2 text-muted-foreground">{c.email}</span>
                    </li>
                  ))
                )}
              </ul>

              <h3 className="font-display mt-8 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Projects
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {workspace.projects.length === 0 ? (
                  <li className="text-muted-foreground">No projects listed.</li>
                ) : (
                  workspace.projects.map((p) => (
                    <li key={p.id}>
                      {p.name}
                      {p.startsAt ? ` · ${p.startsAt.toLocaleDateString()}` : ""}
                    </li>
                  ))
                )}
              </ul>

            </section>
          ) : null}
        </>
      )}
    </>
  )
}
