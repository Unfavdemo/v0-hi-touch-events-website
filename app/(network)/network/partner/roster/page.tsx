import Link from "next/link";
import { InviteVendorForm } from "@/components/network/InviteVendorForm";
import { RosterButtons } from "@/components/network/RosterButtons";
import { RatingStars } from "@/components/network/RatingStars";
import { VendorAvatar } from "@/components/network/VendorAvatar";
import { Badge } from "@/components/network/ui/Badge";
import { requirePartnerOrg } from "@/lib/network/partner-org";
import { prisma } from "@/lib/network/prisma";
import { formatDate } from "@/lib/network/utils";

export default async function PartnerRosterPage() {
  const { ownerId } = await requirePartnerOrg();

  const [hires, roster, openEvents] = await Promise.all([
    prisma.jobOpportunity.findMany({
      where: {
        postedById: ownerId,
        assignedFreelancerId: { not: null },
        status: { in: ["FILLED", "COMPLETED"] },
      },
      include: {
        categoryTag: true,
        assignedFreelancer: { include: { profile: { include: { categoryTags: true } } } },
      },
      orderBy: { eventStartTime: "desc" },
    }),
    prisma.partnerVendor.findMany({
      where: { partnerId: ownerId },
      include: { vendor: { include: { profile: { include: { categoryTags: true } } } } },
    }),
    prisma.jobOpportunity.findMany({
      where: { postedById: ownerId, status: "ACTIVE" },
      select: { id: true, title: true, categoryTagId: true },
      orderBy: { eventStartTime: "asc" },
    }),
  ]);

  type VendorRow = {
    id: string;
    name: string;
    companyName: string | null;
    type: "INDIVIDUAL" | "BUSINESS";
    headshotUrl: string | null;
    logoUrl: string | null;
    ratingAvg: number | null;
    ratingCount: number;
    tags: { id: string; name: string }[];
    favorite: boolean;
    blocked: boolean;
    hireCount: number;
    lastEvent: { id: string; title: string; when: Date } | null;
  };

  const byId = new Map<string, VendorRow>();

  function ensure(vendor: {
    id: string;
    profile: {
      name: string;
      companyName: string | null;
      type: "INDIVIDUAL" | "BUSINESS";
      headshotUrl: string | null;
      logoUrl: string | null;
      ratingAvg: number | null;
      ratingCount: number;
      categoryTags: { id: string; name: string }[];
    } | null;
  }): VendorRow | null {
    if (!vendor.profile) return null;
    const existing = byId.get(vendor.id);
    if (existing) return existing;
    const row: VendorRow = {
      id: vendor.id,
      name: vendor.profile.name,
      companyName: vendor.profile.companyName,
      type: vendor.profile.type,
      headshotUrl: vendor.profile.headshotUrl,
      logoUrl: vendor.profile.logoUrl,
      ratingAvg: vendor.profile.ratingAvg,
      ratingCount: vendor.profile.ratingCount,
      tags: vendor.profile.categoryTags,
      favorite: false,
      blocked: false,
      hireCount: 0,
      lastEvent: null,
    };
    byId.set(vendor.id, row);
    return row;
  }

  for (const job of hires) {
    const vendor = job.assignedFreelancer;
    if (!vendor) continue;
    const row = ensure(vendor);
    if (!row) continue;
    row.hireCount += 1;
    if (!row.lastEvent) {
      row.lastEvent = { id: job.id, title: job.title, when: job.eventStartTime };
    }
  }

  for (const entry of roster) {
    const row = ensure(entry.vendor);
    if (!row) continue;
    row.favorite = entry.favorite;
    row.blocked = entry.blocked;
  }

  const all = [...byId.values()];
  const favorites = all.filter((v) => v.favorite && !v.blocked);
  const blocked = all.filter((v) => v.blocked);
  const hired = all.filter((v) => v.hireCount > 0 && !v.favorite && !v.blocked);

  function VendorCard({ vendor }: { vendor: VendorRow }) {
    const tagIds = new Set(vendor.tags.map((t) => t.id));
    const matchingEvents = openEvents.filter((e) => tagIds.has(e.categoryTagId));
    return (
      <li className="flex flex-col border-2 border-ht-line bg-ht-panel p-5">
        <div className="flex items-start gap-4">
          <VendorAvatar
            name={vendor.name}
            type={vendor.type}
            headshotUrl={vendor.headshotUrl}
            logoUrl={vendor.logoUrl}
            size="md"
          />
          <div className="min-w-0">
            <Link
              href={`/network/${vendor.id}`}
              className="text-lg font-semibold text-ht-cream hover:text-ht-gold"
            >
              {vendor.name}
            </Link>
            {vendor.companyName ? (
              <p className="text-sm text-ht-muted">{vendor.companyName}</p>
            ) : null}
            <RatingStars className="mt-1" value={vendor.ratingAvg} count={vendor.ratingCount} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {vendor.tags.map((t) => (
            <Badge key={t.id} variant="blue">
              {t.name}
            </Badge>
          ))}
        </div>
        <p className="mt-3 text-sm text-ht-muted">
          {vendor.hireCount > 0
            ? `Hired ${vendor.hireCount} time${vendor.hireCount === 1 ? "" : "s"}`
            : "Saved to your roster"}
          {vendor.lastEvent ? (
            <>
              {" · "}
              <Link href={`/network/partner/jobs/${vendor.lastEvent.id}`} className="hover:text-ht-gold">
                {vendor.lastEvent.title}
              </Link>
              {` · ${formatDate(vendor.lastEvent.when)}`}
            </>
          ) : null}
        </p>
        <div className="mt-auto space-y-3 border-t-2 border-ht-line pt-4">
          <RosterButtons vendorId={vendor.id} favorite={vendor.favorite} blocked={vendor.blocked} />
          {vendor.blocked ? (
            <p className="text-xs text-ht-muted">
              Blocked vendors are hidden from Find Vendors and matching for your opportunities.
            </p>
          ) : matchingEvents.length > 0 ? (
            <InviteVendorForm freelancerId={vendor.id} events={matchingEvents} />
          ) : (
            <p className="text-xs text-ht-muted">
              None of your live opportunities need this vendor&apos;s categories.
            </p>
          )}
        </div>
      </li>
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <p className="ht-label text-ht-blue-bright">Partner</p>
        <h1 className="mt-1 text-3xl font-bold text-ht-cream">My Vendors</h1>
        <p className="mt-2 max-w-2xl text-sm text-ht-muted">
          People you&apos;ve hired, plus anyone you favorite from{" "}
          <Link href="/network/partner/vendors" className="text-ht-gold hover:text-ht-gold-bright">
            Find Vendors
          </Link>
          . Favorites rank higher in matching. Blocked vendors won&apos;t be invited to your
          opportunities.
        </p>
      </header>

      {all.length === 0 ? (
        <p className="border-2 border-ht-line bg-ht-panel px-5 py-8 text-center text-sm text-ht-muted">
          Your roster fills in after you hire someone, or favorite a vendor from Find Vendors.
        </p>
      ) : (
        <>
          <section>
            <h2 className="ht-label text-ht-muted">Favorites ({favorites.length})</h2>
            {favorites.length === 0 ? (
              <p className="mt-4 text-sm text-ht-muted">
                Favorite vendors you want to work with again. They get a boost when we match
                your opportunities.
              </p>
            ) : (
              <ul className="mt-4 grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(19rem,1fr))]">
                {favorites.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="ht-label text-ht-muted">Hired before ({hired.length})</h2>
            {hired.length === 0 ? (
              <p className="mt-4 text-sm text-ht-muted">
                Vendors you hire show up here so you can invite them to the next opportunity.
              </p>
            ) : (
              <ul className="mt-4 grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(19rem,1fr))]">
                {hired.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </ul>
            )}
          </section>

          {blocked.length > 0 ? (
            <section>
              <h2 className="ht-label text-ht-muted">Blocked ({blocked.length})</h2>
              <ul className="mt-4 grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(19rem,1fr))]">
                {blocked.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
