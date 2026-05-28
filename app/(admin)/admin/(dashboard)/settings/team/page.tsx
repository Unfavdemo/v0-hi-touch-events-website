import { AdminRole } from "@/lib/generated/prisma/client"
import { updateAdminUserRole } from "@/lib/actions/admin-users"
import { requirePermission } from "@/lib/auth/guard"
import { roleLabel } from "@/lib/auth/permissions"
import { normalizeAdminRole } from "@/lib/auth/roles"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Team | Admin",
  robots: { index: false, follow: false },
}

export default async function AdminTeamPage() {
  await requirePermission("admin.users.manage")

  const admins = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    include: { user: { select: { email: true, name: true } } },
  })

  return (
    <main id="admin-main" className="p-6 md:p-10">
      <h1 className="font-display text-3xl font-normal uppercase tracking-tight">Team roles</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Master Admins have full CRM access. Event Coordinators manage contacts, projects, and vendors but cannot
        moderate intake or change system settings.
      </p>

      <div className="mt-8 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-border bg-muted/30 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => {
              const role = normalizeAdminRole(a.role)
              return (
                <tr key={a.id} className="border-b border-border/80 last:border-0">
                  <td className="px-4 py-3">{a.user.email ?? "—"}</td>
                  <td className="px-4 py-3">{roleLabel(role)}</td>
                  <td className="px-4 py-3">
                    <form action={updateAdminUserRole.bind(null, a.id)} className="flex items-center gap-2">
                      <select
                        name="role"
                        defaultValue={role}
                        className="rounded border border-border bg-background px-2 py-1 text-xs"
                      >
                        <option value={AdminRole.COORDINATOR}>Event Coordinator</option>
                        <option value={AdminRole.SUPERADMIN}>Master Admin</option>
                      </select>
                      <button type="submit" className="text-[10px] uppercase tracking-[0.2em] text-brand-ink hover:underline">
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
