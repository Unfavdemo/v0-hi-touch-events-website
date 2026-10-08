import { VendorHeader } from "@/components/network/freelancer/VendorHeader";
import { VendorClientsTip } from "@/components/network/help/Tips";
import { Badge } from "@/components/network/ui/Badge";
import { requireUser } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";
import { formatDate } from "@/lib/network/utils";

export default async function FreelancerClientsPage() {
  const user = await requireUser("FREELANCER");

  const [jobs, favorites] = await Promise.all([
    prisma.jobOpportunity.findMany({
      where: {
        assignedFreelancerId: user.id,
        status: { in: ["FILLED", "COMPLETED"] },
      },
      include: { postedBy: { include: { profile: true } } },
      orderBy: { eventStartTime: "desc" },
    }),
    prisma.partnerVendor.findMany({
      where: { vendorId: user.id, favorite: true },
      include: { partner: { include: { profile: true } } },
    }),
  ]);

  const clientMap = new Map<
    string,
    { id: string; name: string; events: number; lastEvent: Date; favorited: boolean }
  >();

  for (const job of jobs) {
    const id = job.postedById;
    const name =
      job.postedBy.profile?.companyName ?? job.postedBy.profile?.name ?? "Partner";
    const row = clientMap.get(id) ?? {
      id,
      name,
      events: 0,
      lastEvent: job.eventStartTime,
      favorited: false,
    };
    row.events += 1;
    if (job.eventStartTime > row.lastEvent) row.lastEvent = job.eventStartTime;
    clientMap.set(id, row);
  }

  for (const fav of favorites) {
    const id = fav.partnerId;
    const name =
      fav.partner.profile?.companyName ?? fav.partner.profile?.name ?? "Partner";
    const row = clientMap.get(id) ?? {
      id,
      name,
      events: 0,
      lastEvent: new Date(0),
      favorited: true,
    };
    row.favorited = true;
    clientMap.set(id, row);
  }

  const clients = [...clientMap.values()].sort(
    (a, b) => b.lastEvent.getTime() - a.lastEvent.getTime(),
  );

  return (
    <div className="space-y-8">
      <VendorHeader title="Clients" tip={<VendorClientsTip />}>
        Partners who booked you and anyone who favorited you for future opportunities.
      </VendorHeader>

      {clients.length === 0 ? (
        <p className="border-2 border-ht-line bg-ht-panel px-5 py-8 text-center text-sm text-ht-muted">
          Clients show up after your first booking.
        </p>
      ) : (
        <ul className="divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
          {clients.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-semibold text-ht-cream">{c.name}</p>
                <p className="mt-1 text-sm text-ht-muted">
                  {c.events > 0
                    ? `${c.events} opportunit${c.events === 1 ? "y" : "ies"} · last ${formatDate(c.lastEvent)}`
                    : "Favorited you — no bookings yet"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {c.favorited ? <Badge variant="gold">Favorite</Badge> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
