import Link from "next/link";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { JobForm } from "@/components/network/JobForm";
import { isEventAdmin, isSuperAdmin } from "@/lib/network/admin-rbac";
import { requireUser } from "@/lib/network/auth";
import { canManagePartnerEvent } from "@/lib/network/event-organizer";
import { prisma } from "@/lib/network/prisma";

export default async function AdminNewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string | string[] }>;
}) {
  const admin = await requireUser("ADMIN");
  const superAdmin = isSuperAdmin(admin);
  const eventAdmin = isEventAdmin(admin);
  const tags = await prisma.categoryTag.findMany({ orderBy: { name: "asc" } });

  const eventRaw = (await searchParams).eventId;
  const eventId = Array.isArray(eventRaw) ? eventRaw[0] : eventRaw;

  const [partnerEvents, presetEvent] = await Promise.all([
    prisma.partnerEvent.findMany({
      where: { partnerId: admin.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    eventId
      ? prisma.partnerEvent
          .findUnique({
            where: { id: eventId },
            select: { id: true, name: true, location: true, partnerId: true },
          })
          .then(async (ev) => {
            if (!ev || !(await canManagePartnerEvent(admin, ev.id))) return null;
            return ev;
          })
      : Promise.resolve(null),
  ]);

  return (
    <div>
      <AdminHeader title={presetEvent ? `Post opportunity — ${presetEvent.name}` : "Post an opportunity"}>
        {superAdmin
          ? "Admin-posted opportunities skip partner verification, go live immediately, and invite the best-matched available vendors using the invite count in Settings."
          : eventAdmin
            ? "Your opportunity goes live immediately and invites the best-matched vendors. Link it to an event to group multiple roles."
            : null}
      </AdminHeader>
      {presetEvent ? (
        <>
          <Link
            href={`/network/admin/events/${presetEvent.id}`}
            className="mt-3 inline-block text-sm text-ht-gold hover:text-ht-gold-bright"
          >
            ← Back to event
          </Link>
          {superAdmin && presetEvent.partnerId !== admin.id ? (
            <p className="mt-2 max-w-2xl text-sm text-ht-muted">
              This opportunity will be posted under the partner organization that owns the event and
              will go live immediately.
            </p>
          ) : null}
        </>
      ) : null}
      <div className="mt-8">
        <JobForm
          key={presetEvent?.id ?? "new"}
          tags={tags.map((t) => ({ id: t.id, name: t.name }))}
          posterKind="admin"
          partnerEvents={partnerEvents}
          defaultPartnerEventId={presetEvent?.id}
          returnToEvent={Boolean(presetEvent)}
          defaults={presetEvent?.location ? { location: presetEvent.location } : undefined}
        />
      </div>
    </div>
  );
}
