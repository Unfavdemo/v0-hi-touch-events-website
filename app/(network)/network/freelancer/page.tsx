import Link from "next/link";
import {
  EventStatusTabs,
  countEventFilters,
  matchesEventFilter,
  parseEventFilter,
} from "@/components/network/EventStatusFilter";
import { JobCard } from "@/components/network/JobCard";
import { MembershipTip, RatingTip, SkillCategoriesTip } from "@/components/network/help/Tips";
import { RatingStars } from "@/components/network/RatingStars";
import { Badge, statusBadgeVariant } from "@/components/network/ui/Badge";
import { requireUser } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";
import { label } from "@/lib/network/labels";
import { vendorPaperworkComplete } from "@/lib/network/paperwork";
import { getRatingSummary } from "@/lib/network/ratings";
import { checkInLabel } from "@/lib/network/checkin";
import { formatDate, formatDateTime } from "@/lib/network/utils";

function displayDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default async function FreelancerOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const user = await requireUser("FREELANCER");
  const filter = parseEventFilter((await searchParams).status);

  const [summary, assignments, requisitions, openInvites, coiDoc] = await Promise.all([
    getRatingSummary(user.id),
    prisma.jobOpportunity.findMany({
      where: { assignedFreelancerId: user.id },
      include: { categoryTag: true },
      orderBy: { eventStartTime: "asc" },
    }),
    prisma.jobOpportunity.findMany({
      where: { postedById: user.id },
      include: { categoryTag: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.jobInvite.count({
      where: { freelancerId: user.id, status: "PENDING", job: { status: "ACTIVE" } },
    }),
    prisma.vendorDocument.findFirst({
      where: { vendorId: user.id, kind: "COI" },
      select: { expiresAt: true },
    }),
  ]);

  const myEvents = [
    ...assignments.map((job) => ({ job, relation: "hired" as const })),
    ...requisitions
      .filter((job) => job.assignedFreelancerId !== user.id)
      .map((job) => ({ job, relation: "posted" as const })),
  ].sort((a, b) => a.job.eventStartTime.getTime() - b.job.eventStartTime.getTime());
  const counts = countEventFilters(myEvents.map((e) => e.job.status));
  const shown = myEvents.filter((e) => matchesEventFilter(e.job.status, filter));
  if (filter === "completed") shown.reverse();

  const flagged = user.profile?.flaggedForDismissal ?? false;
  const membership = user.membership;
  const paperworkReady = vendorPaperworkComplete(user.profile);
  const todayKey = displayDayKey(new Date());
  const todayOnSite = assignments.filter(
    (j) =>
      displayDayKey(j.eventStartTime) === todayKey &&
      (j.status === "FILLED" || j.status === "ACTIVE"),
  );
  const coiSoon = new Date();
  coiSoon.setDate(coiSoon.getDate() + 30);
  const coiExpiringSoon =
    coiDoc?.expiresAt &&
    coiDoc.expiresAt <= coiSoon &&
    coiDoc.expiresAt >= new Date();

  return (
    <div className="space-y-10">
      <header>
        <p className="ht-label text-ht-gold">Vendor</p>
        <h1 className="mt-1 text-3xl font-bold text-ht-cream">
          {user.profile?.name ?? user.email}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ht-muted">
          Your home base — paperwork alerts, today&apos;s opportunities, ratings, and bookings. Use
          the sidebar for calendar, money, reviews, and account settings.
        </p>
      </header>

      {!paperworkReady ? (
        <Link
          href="/network/freelancer/documents"
          className="flex flex-wrap items-center justify-between gap-3 border-2 border-ht-gold bg-ht-panel px-5 py-4 hover:border-ht-gold-bright"
        >
          <span className="font-semibold text-ht-cream">
            Upload your W-9 in Documents and accept the vendor agreement so you can apply
            to opportunities.
          </span>
          <span className="ht-label text-ht-gold">Finish paperwork →</span>
        </Link>
      ) : null}

      {coiExpiringSoon ? (
        <Link
          href="/network/freelancer/documents"
          className="flex flex-wrap items-center justify-between gap-3 border-2 border-ht-gold bg-ht-panel px-5 py-4 hover:border-ht-gold-bright"
        >
          <span className="font-semibold text-ht-gold">
            Your certificate of insurance expires{" "}
            {coiDoc?.expiresAt ? formatDate(coiDoc.expiresAt) : "soon"}. Renew it in Documents.
          </span>
          <span className="ht-label text-ht-gold">Documents →</span>
        </Link>
      ) : null}

      {todayOnSite.length > 0 ? (
        <section className="border-2 border-ht-blue bg-ht-panel px-5 py-4">
          <h2 className="ht-label text-ht-blue-bright">Today on site</h2>
          <ul className="mt-3 space-y-2">
            {todayOnSite.map((job) => (
              <li key={job.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <Link href={`/network/freelancer/jobs/${job.id}`} className="font-semibold text-ht-cream hover:text-ht-gold">
                  {job.title}
                </Link>
                <span className="text-ht-muted">
                  {formatDateTime(job.eventStartTime)}
                  {checkInLabel(job) ? ` · ${checkInLabel(job)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {openInvites > 0 ? (
        <Link
          href="/network/freelancer/invites"
          className="flex flex-wrap items-center justify-between gap-3 border-2 border-ht-blue bg-ht-blue px-5 py-4 text-white hover:bg-ht-gold-bright"
        >
          <span className="font-semibold">
            You have {openInvites} opportunity invite{openInvites === 1 ? "" : "s"} waiting for a
            reply.
          </span>
          <span className="ht-label">Review invites →</span>
        </Link>
      ) : null}

      {flagged ? (
        <p className="border-2 border-ht-danger bg-ht-panel px-5 py-4 text-sm text-ht-danger">
          Your average rating dropped below 3.0, so the HiTouch team will review your
          account. Strong reviews on your next opportunitys will help protect your membership.
        </p>
      ) : summary.overall.avg !== null && summary.overall.avg < 3.5 ? (
        <p className="border-2 border-ht-gold bg-ht-panel px-5 py-4 text-sm text-ht-gold">
          Heads up — your average rating is below 3.5. If it stays low, your membership
          could be at risk.
        </p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-3">
        <section className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="ht-label text-ht-muted">
            Your rating
            <RatingTip />
          </h2>
          <div className="mt-3">
            <RatingStars value={summary.overall.avg} count={summary.overall.count} />
          </div>
          <dl className="mt-4 space-y-1.5 border-t border-ht-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ht-muted">From HiTouch</dt>
              <dd className="text-ht-cream">
                {summary.byType.INTERNAL_ADMIN.avg?.toFixed(2) ?? "—"} (
                {summary.byType.INTERNAL_ADMIN.count})
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ht-muted">From clients</dt>
              <dd className="text-ht-cream">
                {summary.byType.CLIENT_PARTNER.avg?.toFixed(2) ?? "—"} (
                {summary.byType.CLIENT_PARTNER.count})
              </dd>
            </div>
          </dl>
          <Link
            href="/network/freelancer/reviews"
            className="ht-label mt-4 inline-block text-ht-gold hover:text-ht-gold-bright"
          >
            All reviews →
          </Link>
          <Link
            href={`/network/${user.id}`}
            className="ht-label mt-2 block text-ht-muted hover:text-ht-gold"
          >
            View public profile →
          </Link>
          <Link
            href="/network/freelancer/profile"
            className="ht-label mt-2 block text-ht-muted hover:text-ht-gold"
          >
            Edit profile →
          </Link>
        </section>

        <section className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="ht-label text-ht-muted">
            Membership
            <MembershipTip />
          </h2>
          {membership ? (
            <>
              <p className="mt-3 text-xl font-bold text-ht-gold">
                {label(membership.tier)} plan
              </p>
              <Badge
                className="mt-2"
                variant={statusBadgeVariant(membership.status)}
              >
                {label(membership.status)}
              </Badge>
              {membership.currentPeriodEnd ? (
                <p className="mt-3 text-sm text-ht-muted">
                  Renews {formatDate(membership.currentPeriodEnd)}
                </p>
              ) : null}
              <Link
                href="/network/freelancer/membership"
                className="ht-label mt-3 inline-block text-ht-gold hover:text-ht-gold-bright"
              >
                Membership details →
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm text-ht-muted">You don&apos;t have a membership yet.</p>
          )}
        </section>

        <section className="border-2 border-ht-line bg-ht-panel p-5">
          <h2 className="ht-label text-ht-muted">
            Your skill tags
            <SkillCategoriesTip />
          </h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(user.profile?.categoryTags ?? []).map((tag) => (
              <Badge key={tag.id} variant="blue">
                {tag.name}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-xs text-ht-muted">
            You&apos;re only matched and invited to opportunities in these categories.
          </p>
        </section>
      </div>

      <section>
        <h2 className="ht-label text-ht-muted">
          Your opportunities ({myEvents.length})
        </h2>
        {myEvents.length === 0 ? (
          <p className="mt-4 text-sm text-ht-muted">
            No bookings yet.{" "}
            <Link href="/network/freelancer/invites" className="text-ht-gold hover:text-ht-gold-bright">
              Check your invites →
            </Link>
          </p>
        ) : (
          <>
            <div className="mt-4">
              <EventStatusTabs
                basePath="/freelancer"
                current={filter}
                counts={counts}
                audience="vendor"
              />
            </div>
            {shown.length === 0 ? (
              <p className="mt-6 border-2 border-dashed border-ht-line px-5 py-8 text-center text-sm text-ht-muted">
                No opportunities in this list right now.
              </p>
            ) : (
              <div className="mt-6 grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(19rem,1fr))]">
                {shown.map(({ job, relation }) => (
                  <div key={job.id} className="flex flex-col gap-2">
                    <div className="flex-1">
                      <JobCard job={job} href={`/network/freelancer/jobs/${job.id}`} />
                    </div>
                    <p className="ht-label px-1 text-ht-muted">
                      {relation === "hired" ? "You're hired" : "You shared this opportunity"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
