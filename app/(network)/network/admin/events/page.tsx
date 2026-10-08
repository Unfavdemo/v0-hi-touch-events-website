import Link from "next/link";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { isSuperAdmin } from "@/lib/network/admin-rbac";
import { partnerEventsWhere, requireAdminEventsAccess } from "@/lib/network/event-organizer";
import { prisma } from "@/lib/network/prisma";
import { formatDateTime } from "@/lib/network/utils";

export default async function AdminEventsPage() {
  const admin = await requireAdminEventsAccess();
  const superAdmin = isSuperAdmin(admin);

  const events = await prisma.partnerEvent.findMany({
    where: partnerEventsWhere(admin),
    orderBy: { updatedAt: "desc" },
    include: {
      partner: { include: { profile: true } },
      opportunities: {
        select: { id: true, assignedFreelancerId: true, status: true },
      },
    },
    take: 100,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminHeader title={superAdmin ? "Events" : "Your events"}>
          {superAdmin
            ? "Partner and opportunity-admin events. Post opportunities inside an event — admin posts go live without partner approval."
            : "Group your opportunities under one show. Opportunities you post from an event go live immediately, same as a direct admin post."}
        </AdminHeader>
        <Link
          href="/network/admin/events/new"
          className="ht-label border-2 border-ht-gold bg-ht-gold px-4 py-2 font-semibold text-ht-black hover:bg-ht-gold-bright"
        >
          New event
        </Link>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-ht-muted">
          No events yet.{" "}
          <Link href="/network/admin/events/new" className="text-ht-gold hover:text-ht-gold-bright">
            Create one
          </Link>{" "}
          to bundle multiple vendor roles.
        </p>
      ) : (
        <ul className="space-y-3">
          {events.map((ev) => {
            const hired = new Set(
              ev.opportunities.map((o) => o.assignedFreelancerId).filter(Boolean),
            );
            return (
              <li key={ev.id} className="border-2 border-ht-line bg-ht-panel p-4">
                <Link
                  href={`/network/admin/events/${ev.id}`}
                  className="text-lg font-semibold text-ht-cream hover:text-ht-gold"
                >
                  {ev.name}
                </Link>
                {superAdmin ? (
                  <p className="mt-1 text-sm text-ht-muted">
                    {ev.partner.profile?.companyName ??
                      ev.partner.profile?.name ??
                      ev.partner.email}
                  </p>
                ) : null}
                <p className="mt-1 text-sm text-ht-muted">
                  {ev.applicationCloseAt
                    ? `Applications close ${formatDateTime(ev.applicationCloseAt)}`
                    : "No application deadline set"}
                </p>
                <p className="mt-1 text-xs text-ht-muted">
                  {ev.opportunities.length} opportunities · {hired.size} hired vendor
                  {hired.size === 1 ? "" : "s"}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
