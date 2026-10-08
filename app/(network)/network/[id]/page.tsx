import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandMark } from "@/components/network/BrandMark";
import { RatingStars } from "@/components/network/RatingStars";
import { SocialLinkRow } from "@/components/network/SocialLinkRow";
import { StarDistribution } from "@/components/network/StarDistribution";
import { VendorAvatar } from "@/components/network/VendorAvatar";
import { Badge } from "@/components/network/ui/Badge";
import { getCurrentUser } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";
import { getRatingSummary } from "@/lib/network/ratings";
import { VENDOR_RATING_REVIEWER_TYPES } from "@/lib/network/review-policy";
import { parseSocialLinks, phoneHref } from "@/lib/network/social";
import { formatDate, formatMoney } from "@/lib/network/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const vendor = await prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  });
  const name = vendor?.profile?.name;
  if (!name) return { title: "Vendor profile — HiTouch Solutions" };
  return {
    title: `${name} — HiTouch Solutions talent`,
    description: vendor.profile?.bio ?? `${name} is on the HiTouch Solutions vendor network.`,
  };
}

export default async function VendorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const viewer = await getCurrentUser();

  const vendor = await prisma.user.findUnique({
    where: { id },
    include: { profile: { include: { categoryTags: true } } },
  });
  if (
    !vendor ||
    vendor.role !== "FREELANCER" ||
    !vendor.profile ||
    (vendor.status !== "APPROVED" && vendor.status !== "SUSPENDED")
  ) {
    notFound();
  }

  const [summary, reviews, completedJobs, starGroups, portfolio] = await Promise.all([
    getRatingSummary(vendor.id),
    prisma.review.findMany({
      where: {
        freelancerId: vendor.id,
        hiddenAt: null,
        reviewerType: { in: [...VENDOR_RATING_REVIEWER_TYPES] },
      },
      include: { job: { include: { categoryTag: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.jobOpportunity.findMany({
      where: { assignedFreelancerId: vendor.id, status: "COMPLETED" },
      include: {
        categoryTag: true,
        postedBy: { include: { profile: true } },
      },
      orderBy: { eventEndTime: "desc" },
      take: 8,
    }),
    prisma.review.groupBy({
      by: ["stars"],
      where: {
        freelancerId: vendor.id,
        hiddenAt: null,
        reviewerType: { in: [...VENDOR_RATING_REVIEWER_TYPES] },
      },
      _count: { _all: true },
    }),
    prisma.vendorDocument.findMany({
      where: { vendorId: vendor.id, kind: "PORTFOLIO" },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  const profile = vendor.profile;
  const socials = parseSocialLinks(profile.socialLinks);
  const isOwn = viewer?.id === vendor.id;
  const completedCount = await prisma.jobOpportunity.count({
    where: { assignedFreelancerId: vendor.id, status: "COMPLETED" },
  });
  const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of starGroups) {
    starCounts[row.stars] = row._count._all;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-ht-blue">
        <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-6">
          <BrandMark variant="reversed" sublabel="Vendor Network" />
          <nav className="flex items-center gap-3">
            {isOwn ? (
              <Link
                href="/network/freelancer/profile"
                className="ht-label border-2 border-white bg-white px-4 py-2 font-semibold text-ht-blue hover:bg-ht-gold-bright"
              >
                Edit profile
              </Link>
            ) : (
              <Link href="/network/login" className="ht-label text-white/70 hover:text-white">
                Member login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="ht-brand-bar h-1.5 w-full" />
      <div className="relative overflow-hidden border-b-2 border-ht-line bg-ht-panel-2">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#292a75]/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <VendorAvatar
              name={profile.name}
              type={profile.type}
              headshotUrl={profile.headshotUrl}
              logoUrl={profile.logoUrl}
            />
            <div className="min-w-0 flex-1 pb-1">
              <p className="ht-label text-ht-blue-bright">
                {profile.type === "BUSINESS" ? "Business vendor" : "Independent talent"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="font-serif text-5xl tracking-tight text-ht-cream sm:text-6xl">
                  {profile.name}
                </h1>
                {vendor.status === "APPROVED" ? (
                  <Badge variant="gold">Verified</Badge>
                ) : (
                  <Badge variant="danger">Suspended</Badge>
                )}
              </div>
              {profile.companyName ? (
                <p className="mt-2 text-lg text-ht-muted">{profile.companyName}</p>
              ) : null}
              <div className="mt-4">
                <RatingStars value={summary.overall.avg} count={summary.overall.count} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="flex flex-wrap gap-1.5">
          {profile.categoryTags.map((tag) => (
            <Badge key={tag.id} variant="blue">
              {tag.name}
            </Badge>
          ))}
        </div>

        <div className="mt-8 grid gap-px border-2 border-ht-line bg-ht-line sm:grid-cols-3">
          <Stat
            label="Jobs completed"
            value={String(completedCount)}
            hint="Assignments marked complete on the network"
          />
          <Stat
            label="On the bench since"
            value={formatDate(vendor.createdAt)}
            hint="Date this vendor joined HiTouch Solutions"
          />
          <Stat
            label="Network standing"
            value={
              vendor.status === "SUSPENDED"
                ? "Suspended"
                : summary.overall.avg === null
                  ? "New"
                  : summary.overall.avg >= 4.5
                    ? "Excellent"
                    : summary.overall.avg >= 3.5
                      ? "In good standing"
                      : "Under review"
            }
            hint="Based on dual HiTouch + client ratings"
          />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            <section>
              <h2 className="ht-label text-ht-gold">About</h2>
              {profile.bio ? (
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-ht-cream/90">
                  {profile.bio}
                </p>
              ) : (
                <p className="mt-4 text-sm text-ht-muted">
                  This vendor hasn&apos;t added a bio yet.
                </p>
              )}
              {(profile.phone || socials.email || profile.mailingAddress) ? (
                <div className="mt-4 space-y-1 text-base text-ht-muted">
                  {socials.email ? (
                    <p>
                      Email:{" "}
                      <a
                        href={`mailto:${socials.email}`}
                        className="text-ht-gold hover:text-ht-gold-bright"
                      >
                        {socials.email}
                      </a>
                    </p>
                  ) : null}
                  {profile.phone ? (
                    <p>
                      Phone:{" "}
                      <a
                        href={phoneHref(profile.phone, "tel")}
                        className="text-ht-gold hover:text-ht-gold-bright"
                      >
                        {profile.phone}
                      </a>
                      {" · "}
                      <a
                        href={phoneHref(profile.phone, "sms")}
                        className="text-ht-gold hover:text-ht-gold-bright"
                      >
                        Text
                      </a>
                    </p>
                  ) : null}
                  {profile.mailingAddress ? (
                    <p>Mailing address: {profile.mailingAddress}</p>
                  ) : null}
                </div>
              ) : null}
              <div className="mt-5">
                <SocialLinkRow raw={profile.socialLinks} />
              </div>
            </section>

            {(profile.defaultRate ||
              profile.travelRadiusMiles ||
              profile.crewSize ||
              profile.equipmentNotes) ? (
              <section>
                <h2 className="ht-label text-ht-gold">Services</h2>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  {profile.defaultRate ? (
                    <div>
                      <dt className="text-ht-muted">Typical rate</dt>
                      <dd className="font-semibold text-ht-cream">
                        {formatMoney(profile.defaultRate.toString())}
                      </dd>
                    </div>
                  ) : null}
                  {profile.travelRadiusMiles ? (
                    <div>
                      <dt className="text-ht-muted">Travel radius</dt>
                      <dd className="font-semibold text-ht-cream">
                        {profile.travelRadiusMiles} miles
                      </dd>
                    </div>
                  ) : null}
                  {profile.crewSize ? (
                    <div>
                      <dt className="text-ht-muted">Typical crew</dt>
                      <dd className="font-semibold text-ht-cream">{profile.crewSize} people</dd>
                    </div>
                  ) : null}
                </dl>
                {profile.equipmentNotes ? (
                  <p className="mt-4 text-sm leading-relaxed text-ht-cream/90">
                    {profile.equipmentNotes}
                  </p>
                ) : null}
              </section>
            ) : null}

            {portfolio.length > 0 ? (
              <section>
                <h2 className="ht-label text-ht-gold">Portfolio</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {portfolio.map((doc) => (
                    <li key={doc.id} className="border-2 border-ht-line bg-ht-panel">
                      <a
                        href={`/api/vendor-documents/${doc.id}`}
                        className="block px-4 py-3 text-sm font-medium text-ht-cream hover:text-ht-gold"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {doc.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section>
              <h2 className="ht-label text-ht-gold">
                Completed work ({completedCount})
              </h2>
              {completedJobs.length === 0 ? (
                <p className="mt-4 border-2 border-ht-line bg-ht-panel px-5 py-6 text-sm text-ht-muted">
                  No completed assignments on the network yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {completedJobs.map((job) => (
                    <li key={job.id} className="border-2 border-ht-line bg-ht-panel p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ht-cream">{job.title}</p>
                          <p className="mt-1 text-sm text-ht-muted">
                            {job.location}
                            {job.postedBy.profile?.companyName
                              ? ` · ${job.postedBy.profile.companyName}`
                              : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="blue">{job.categoryTag.name}</Badge>
                          <p className="mt-2 text-xs text-ht-muted">
                            {formatDate(job.eventStartTime)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="ht-label text-ht-gold">Reviews</h2>
              <p className="mt-2 text-sm text-ht-muted">
                Each completed job can be rated independently by HiTouch Solutions and by
                the client partner.
              </p>
              {reviews.length === 0 ? (
                <p className="mt-4 border-2 border-ht-line bg-ht-panel px-5 py-6 text-sm text-ht-muted">
                  No reviews yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {reviews.map((review) => (
                    <li key={review.id} className="border-2 border-ht-line bg-ht-panel p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={
                              review.reviewerType === "INTERNAL_ADMIN" ? "gold" : "blue"
                            }
                          >
                            {review.reviewerType === "INTERNAL_ADMIN"
                              ? "HiTouch Solutions"
                              : "Client partner"}
                          </Badge>
                          <span className="text-xs text-ht-muted">{review.job.title}</span>
                          <Badge variant="muted">{review.job.categoryTag.name}</Badge>
                        </div>
                        <span className="text-xs text-ht-muted">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <div className="mt-3">
                        <RatingStars value={review.stars} />
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-ht-cream">
                        {review.feedback}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
            <section className="border-2 border-ht-line bg-ht-panel p-5">
              <h2 className="ht-label text-ht-muted">Rating breakdown</h2>
              <p className="mt-4 text-4xl font-bold text-ht-gold">
                {summary.overall.avg?.toFixed(2) ?? "—"}
              </p>
              <p className="mt-1 text-xs text-ht-muted">
                {summary.overall.count} review{summary.overall.count === 1 ? "" : "s"}{" "}
                cumulative
              </p>
              <dl className="mt-5 space-y-2 border-t-2 border-ht-line pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ht-muted">HiTouch Solutions</dt>
                  <dd className="font-semibold text-ht-cream">
                    {summary.byType.INTERNAL_ADMIN.avg?.toFixed(2) ?? "—"}
                    <span className="ml-1 font-normal text-ht-muted">
                      ({summary.byType.INTERNAL_ADMIN.count})
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ht-muted">Client partners</dt>
                  <dd className="font-semibold text-ht-cream">
                    {summary.byType.CLIENT_PARTNER.avg?.toFixed(2) ?? "—"}
                    <span className="ml-1 font-normal text-ht-muted">
                      ({summary.byType.CLIENT_PARTNER.count})
                    </span>
                  </dd>
                </div>
              </dl>
              <div className="mt-5 border-t-2 border-ht-line pt-4">
                <StarDistribution counts={starCounts} total={summary.overall.count} />
              </div>
            </section>

            <section className="border-2 border-ht-line bg-ht-panel p-5">
              <h2 className="ht-label text-ht-muted">Book this vendor</h2>
              <p className="mt-3 text-sm leading-relaxed text-ht-muted">
                Partners post an opportunity, and HiTouch invites the best available vendors in
                that category to apply. You can also invite this vendor directly.
              </p>
              <Link
                href="/network/join/partner"
                className="ht-label mt-5 inline-block border-2 border-ht-gold bg-ht-gold px-4 py-2 font-semibold text-white hover:bg-ht-gold-bright"
              >
                Request to join as a partner
              </Link>
            </section>
          </aside>
        </div>
      </main>

      <footer className="border-t-2 border-ht-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <p className="text-sm text-ht-muted">
            © {new Date().getFullYear()} HiTouch Solutions. All rights reserved.
          </p>
          <Link href="/" className="ht-label text-ht-muted hover:text-ht-gold">
            Back to home
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="bg-ht-panel p-5">
      <p className="ht-label text-ht-muted">{label}</p>
      <p className="mt-2 text-xl font-semibold text-ht-cream">{value}</p>
      <p className="mt-1 text-xs text-ht-muted">{hint}</p>
    </div>
  );
}
