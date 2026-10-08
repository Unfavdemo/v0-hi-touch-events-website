import Link from "next/link";
import { Badge } from "@/components/network/ui/Badge";
import { requirePartnerOrg } from "@/lib/network/partner-org";
import { partnerIncidentsWhere, incidentInclude } from "@/lib/network/incident-access";
import { label } from "@/lib/network/labels";
import { prisma } from "@/lib/network/prisma";
import { formatDate } from "@/lib/network/utils";

export default async function PartnerIncidentsPage() {
  const { ownerId } = await requirePartnerOrg();

  const incidents = await prisma.incident.findMany({
    where: {
      ...partnerIncidentsWhere(ownerId),
      voidedAt: null,
    },
    include: incidentInclude,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-8">
      <header>
        <p className="ht-label text-ht-blue-bright">Partner</p>
        <h1 className="mt-1 text-3xl font-bold text-ht-cream">Incidents</h1>
        <p className="mt-2 max-w-2xl text-sm text-ht-muted">
          HiTouch logs on vendors you have hired. Other vendors cannot see these records — only
          you, HiTouch, and the vendor involved.
        </p>
      </header>

      {incidents.length === 0 ? (
        <p className="border-2 border-dashed border-ht-line px-5 py-8 text-center text-sm text-ht-muted">
          No incidents on your opportunities yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {incidents.map((i) => (
            <li key={i.id} className="border-2 border-ht-line bg-ht-panel p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="danger">{label(i.kind)}</Badge>
                <Link
                  href={`/network/${i.vendorId}`}
                  className="font-semibold text-ht-cream hover:text-ht-gold"
                >
                  {i.vendor.profile?.name ?? i.vendor.email}
                </Link>
              </div>
              <p className="mt-2 text-sm text-ht-cream">{i.notes}</p>
              <p className="mt-2 text-xs text-ht-muted">
                {formatDate(i.createdAt)}
                {i.job ? (
                  <>
                    {" · "}
                    <Link href={`/network/partner/jobs/${i.job.id}`} className="text-ht-gold hover:text-ht-gold-bright">
                      {i.job.title}
                    </Link>
                  </>
                ) : null}
                {" · logged by HiTouch"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
