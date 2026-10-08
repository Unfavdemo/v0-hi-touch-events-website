import Link from "next/link";
import { requirePartnerOrg } from "@/lib/network/partner-org";
import { prisma } from "@/lib/network/prisma";

export default async function PartnerEventsPage() {
  const { ownerId } = await requirePartnerOrg();

  const events = await prisma.partnerEvent.findMany({
    where: { partnerId: ownerId },
    orderBy: { updatedAt: "desc" },
    include: {
      opportunities: {
        select: {
          id: true,
          title: true,
          status: true,
          assignedFreelancerId: true,
          eventStartTime: true,
        },
        orderBy: { eventStartTime: "asc" },
      },
    },
  });

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="ht-label text-ht-blue-bright">Partner</p>
          <h1 className="mt-1 text-3xl font-bold text-ht-cream">Events</h1>
          <p className="mt-2 max-w-2xl text-sm text-ht-muted">
            One event can include many opportunities — each with its own category, schedule slice,
            and hired vendor. Create the event first, then post or link opportunities to it.
          </p>
        </div>
        <Link
          href="/network/partner/events/new"
          className="ht-label border-2 border-ht-gold bg-ht-gold px-4 py-2 font-semibold text-ht-black hover:bg-ht-gold-bright"
        >
          New event
        </Link>
      </header>

      {events.length === 0 ? (
        <p className="border-2 border-ht-line bg-ht-panel p-6 text-sm text-ht-muted">
          No events yet.{" "}
          <Link href="/network/partner/events/new" className="text-ht-gold hover:text-ht-gold-bright">
            Create one
          </Link>{" "}
          before you post multiple vendor roles for the same show.
        </p>
      ) : (
        <ul className="space-y-4">
          {events.map((ev) => {
            const hired = new Set(
              ev.opportunities
                .map((o) => o.assignedFreelancerId)
                .filter((id): id is string => Boolean(id)),
            );
            return (
              <li key={ev.id} className="border-2 border-ht-line bg-ht-panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/network/partner/events/${ev.id}`}
                      className="text-xl font-semibold text-ht-cream hover:text-ht-gold"
                    >
                      {ev.name}
                    </Link>
                    {ev.location ? (
                      <p className="mt-1 text-sm text-ht-muted">{ev.location}</p>
                    ) : null}
                  </div>
                  <p className="text-sm text-ht-muted">
                    {ev.opportunities.length} opportunit
                    {ev.opportunities.length === 1 ? "y" : "ies"} · {hired.size} vendor
                    {hired.size === 1 ? "" : "s"} hired
                  </p>
                </div>
                {ev.opportunities.length > 0 ? (
                  <ul className="mt-4 space-y-1 border-t border-ht-line pt-3 text-sm text-ht-muted">
                    {ev.opportunities.slice(0, 4).map((o) => (
                      <li key={o.id}>
                        <Link href={`/network/partner/jobs/${o.id}`} className="text-ht-cream hover:text-ht-gold">
                          {o.title}
                        </Link>
                        {o.assignedFreelancerId ? " · vendor hired" : null}
                      </li>
                    ))}
                    {ev.opportunities.length > 4 ? (
                      <li>+{ev.opportunities.length - 4} more</li>
                    ) : null}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-ht-muted">No opportunities linked yet.</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
