import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { prisma } from "@/lib/network/prisma";
import { formatDateTime } from "@/lib/network/utils";

export default async function AdminActivityPage() {
  await requireSuperAdmin();
  const actions = await prisma.adminAction.findMany({
    include: { actor: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
    take: 120,
  });

  return (
    <div className="space-y-8">
      <AdminHeader title="Activity">Who approved, assigned, hid, or paid — recent admin actions.</AdminHeader>
      {actions.length === 0 ? (
        <p className="border-2 border-dashed border-ht-line px-5 py-8 text-center text-sm text-ht-muted">
          No admin actions recorded yet.
        </p>
      ) : (
        <ul className="divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
          {actions.map((a) => (
            <li key={a.id} className="px-4 py-3 text-sm">
              <p className="text-ht-cream">{a.message}</p>
              <p className="mt-1 text-xs text-ht-muted">
                {a.actor.profile?.name ?? a.actor.email} · {formatDateTime(a.createdAt)} ·{" "}
                {a.action}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
