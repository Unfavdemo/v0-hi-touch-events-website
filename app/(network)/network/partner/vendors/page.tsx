import Link from "next/link";
import type { Prisma } from "@/lib/generated/network-prisma/client";
import { VendorDirectoryTip } from "@/components/network/help/Tips";
import { InviteVendorForm } from "@/components/network/InviteVendorForm";
import { RosterButtons } from "@/components/network/RosterButtons";
import { RatingStars } from "@/components/network/RatingStars";
import { VendorAvatar } from "@/components/network/VendorAvatar";
import { Badge } from "@/components/network/ui/Badge";
import { Button } from "@/components/network/ui/Button";
import { requirePartnerOrg } from "@/lib/network/partner-org";
import { prisma } from "@/lib/network/prisma";
import { cn } from "@/lib/network/utils";

export default async function PartnerVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string }>;
}) {
  const { ownerId } = await requirePartnerOrg();
  const { tag, q } = await searchParams;
  const query = q?.trim() ?? "";

  const tags = await prisma.categoryTag.findMany({ orderBy: { name: "asc" } });
  const activeTag = tags.find((t) => t.slug === tag) ?? null;

  const profileWhere: Prisma.ProfileWhereInput = {
    flaggedForDismissal: false,
    ...(activeTag ? { categoryTags: { some: { id: activeTag.id } } } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { companyName: { contains: query, mode: "insensitive" } },
            { bio: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [vendors, openEvents, completedCounts, roster] = await Promise.all([
    prisma.user.findMany({
      where: { role: "FREELANCER", status: "APPROVED", profile: profileWhere },
      include: { profile: { include: { categoryTags: true } } },
    }),
    prisma.jobOpportunity.findMany({
      where: { postedById: ownerId, status: "ACTIVE" },
      select: { id: true, title: true, categoryTagId: true },
      orderBy: { eventStartTime: "asc" },
    }),
    prisma.jobOpportunity.groupBy({
      by: ["assignedFreelancerId"],
      where: { status: "COMPLETED", assignedFreelancerId: { not: null } },
      _count: { _all: true },
    }),
    prisma.partnerVendor.findMany({
      where: { partnerId: ownerId },
      select: { vendorId: true, favorite: true, blocked: true },
    }),
  ]);

  const rosterByVendor = new Map(roster.map((r) => [r.vendorId, r]));
  const blockedIds = new Set(roster.filter((r) => r.blocked).map((r) => r.vendorId));

  const completedBy = new Map(
    completedCounts.map((c) => [c.assignedFreelancerId, c._count._all]),
  );
  const sorted = [...vendors]
    .filter((v) => !blockedIds.has(v.id))
    .sort(
    (a, b) =>
      (b.profile?.ratingAvg ?? 0) - (a.profile?.ratingAvg ?? 0) ||
      (b.profile?.ratingCount ?? 0) - (a.profile?.ratingCount ?? 0),
  );

  return (
    <div className="space-y-8">
      <header>
        <p className="ht-label text-ht-blue-bright">Partner</p>
        <h1 className="mt-1 inline-flex flex-wrap items-center gap-2 text-3xl font-bold text-ht-cream">
          Find vendors
          <VendorDirectoryTip />
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ht-muted">
          Every vendor here is vetted by HiTouch Solutions. Our matching invites the best
          available people to each opportunity automatically — you can also hand-pick anyone
          below for one of your live opportunities.
        </p>
      </header>

      <form className="flex flex-wrap items-end gap-3" action="/partner/vendors">
        <div className="min-w-64 flex-1">
          <label htmlFor="q" className="ht-label block text-ht-muted">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={query}
            placeholder="Name, company, or specialty"
            className="mt-1.5 w-full border-2 border-ht-line bg-ht-panel px-3 py-2.5 text-base text-ht-cream placeholder:text-ht-muted/60 focus:border-ht-gold focus:outline-none"
          />
        </div>
        {activeTag ? <input type="hidden" name="tag" value={activeTag.slug} /> : null}
        <Button type="submit" className="shrink-0">
          Search
        </Button>
      </form>

      <nav className="flex flex-wrap gap-2" aria-label="Filter by category">
        <CategoryChip href={hrefWith(undefined, query)} active={!activeTag} label="All" />
        {tags.map((t) => (
          <CategoryChip
            key={t.id}
            href={hrefWith(t.slug, query)}
            active={activeTag?.id === t.id}
            label={t.name}
          />
        ))}
      </nav>

      {sorted.length === 0 ? (
        <p className="border-2 border-ht-line bg-ht-panel px-5 py-8 text-center text-sm text-ht-muted">
          No vendors match that search.
        </p>
      ) : (
        <ul className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(19rem,1fr))]">
          {sorted.map((v) => {
            const profile = v.profile!;
            const vendorTagIds = new Set(profile.categoryTags.map((t) => t.id));
            const matchingEvents = openEvents.filter((e) => vendorTagIds.has(e.categoryTagId));
            const completed = completedBy.get(v.id) ?? 0;
            const flags = rosterByVendor.get(v.id);
            return (
              <li key={v.id} className="flex flex-col border-2 border-ht-line bg-ht-panel p-5">
                <div className="flex items-start gap-4">
                  <VendorAvatar
                    name={profile.name}
                    type={profile.type}
                    headshotUrl={profile.headshotUrl}
                    logoUrl={profile.logoUrl}
                    size="md"
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/network/${v.id}`}
                      className="text-lg font-semibold text-ht-cream hover:text-ht-gold"
                    >
                      {profile.name}
                    </Link>
                    {profile.companyName ? (
                      <p className="text-sm text-ht-muted">{profile.companyName}</p>
                    ) : null}
                    <RatingStars
                      className="mt-1"
                      value={profile.ratingAvg}
                      count={profile.ratingCount}
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {profile.categoryTags.map((t) => (
                    <Badge key={t.id} variant="blue">
                      {t.name}
                    </Badge>
                  ))}
                </div>
                {profile.bio ? (
                  <p className="mt-3 line-clamp-3 text-sm text-ht-muted">{profile.bio}</p>
                ) : null}
                <div className="mt-auto space-y-3 border-t-2 border-ht-line pt-4">
                  <div className="flex items-center justify-between">
                    <span className="ht-label text-ht-muted">
                      {completed} job{completed === 1 ? "" : "s"} completed
                    </span>
                    <Link
                      href={`/network/${v.id}`}
                      className="ht-label text-ht-gold hover:text-ht-gold-bright"
                    >
                      View profile →
                    </Link>
                  </div>
                  <RosterButtons
                    vendorId={v.id}
                    favorite={Boolean(flags?.favorite)}
                    blocked={false}
                  />
                  {matchingEvents.length > 0 ? (
                    <InviteVendorForm freelancerId={v.id} events={matchingEvents} />
                  ) : (
                    <p className="text-xs text-ht-muted">
                      None of your live opportunities need this vendor&apos;s categories.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function hrefWith(tag: string | undefined, q: string): string {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (q) params.set("q", q);
  const s = params.toString();
  return s ? `/partner/vendors?${s}` : "/partner/vendors";
}

function CategoryChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "ht-label border-2 px-3 py-1.5 transition-colors",
        active
          ? "border-ht-blue bg-ht-blue text-white"
          : "border-ht-line bg-ht-panel text-ht-muted hover:border-ht-blue hover:text-ht-blue",
      )}
    >
      {label}
    </Link>
  );
}
