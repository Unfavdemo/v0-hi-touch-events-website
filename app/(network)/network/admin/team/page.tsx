import { CreateEventAdminForm } from "@/components/network/CreateEventAdminForm";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { prisma } from "@/lib/network/prisma";

export default async function AdminTeamPage() {
  await requireSuperAdmin();
  const eventAdmins = await prisma.user.findMany({
    where: { role: "ADMIN", adminScope: "EVENT" },
    include: {
      profile: true,
      _count: { select: { eventDelegations: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <AdminHeader title="Team">
        Opportunity admins only see the opportunitys you assign. Add them here, then open an opportunity to
        assign.
      </AdminHeader>

      <section className="border-2 border-ht-line bg-ht-panel p-6">
        <h2 className="text-lg font-semibold text-ht-cream">Add an opportunity admin</h2>
        <CreateEventAdminForm />
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">Opportunity admins ({eventAdmins.length})</h2>
        {eventAdmins.length === 0 ? (
          <p className="mt-4 border-2 border-dashed border-ht-line px-5 py-8 text-center text-sm text-ht-muted">
            No opportunity admins yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
            {eventAdmins.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-ht-cream">{a.profile?.name ?? a.email}</p>
                  <p className="text-xs text-ht-muted">{a.email}</p>
                </div>
                <p className="text-sm text-ht-muted">
                  {a._count.eventDelegations} opportunit
                  {a._count.eventDelegations === 1 ? "y" : "ies"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
