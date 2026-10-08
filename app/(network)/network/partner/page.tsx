import Link from "next/link";
import {
  EventStatusTabs,
  countEventFilters,
  matchesEventFilter,
  parseEventFilter,
} from "@/components/network/EventStatusFilter";
import { JobCard } from "@/components/network/JobCard";
import { EventStatusTip } from "@/components/network/help/Tips";
import { requirePartnerOrg } from "@/lib/network/partner-org";
import { prisma } from "@/lib/network/prisma";

const STEPS = [
  {
    title: "Drop in your opportunity",
    body: "Category, schedule, location, and your rate. HiTouch Solutions verifies it.",
  },
  {
    title: "We invite the best matches",
    body: "Our matching invites top-rated vendors who are free that day. They apply or pass.",
  },
  {
    title: "You pick who works",
    body: "Applicants arrive ranked with our top picks highlighted. Hire with one click.",
  },
];

export default async function PartnerOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const { user, ownerId } = await requirePartnerOrg();
  const filter = parseEventFilter((await searchParams).status);

  const allJobs = await prisma.jobOpportunity.findMany({
    where: { postedById: ownerId },
    include: {
      categoryTag: true,
      _count: { select: { bids: true, invites: true } },
    },
    orderBy: { eventStartTime: "asc" },
  });
  const counts = countEventFilters(allJobs.map((j) => j.status));
  const jobs = allJobs.filter((j) => matchesEventFilter(j.status, filter));
  if (filter === "completed") jobs.reverse();

  const reviewsDue = await prisma.jobOpportunity.count({
    where: {
      postedById: ownerId,
      status: "COMPLETED",
      assignedFreelancerId: { not: null },
      reviews: { none: { reviewerType: "CLIENT_PARTNER" } },
    },
  });

  const ownerProfile =
    ownerId === user.id
      ? user.profile
      : (
          await prisma.user.findUnique({
            where: { id: ownerId },
            include: { profile: true },
          })
        )?.profile;

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="ht-label text-ht-blue-bright">Partner</p>
          <h1 className="mt-1 text-3xl font-bold text-ht-cream">
            {ownerProfile?.companyName ?? "Your organization"}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/network/partner/reports"
            className="ht-label border-2 border-ht-line px-4 py-2 font-semibold text-ht-muted hover:border-ht-gold hover:text-ht-gold"
          >
            Reports
          </Link>
          <Link
            href="/network/partner/calendar"
            className="ht-label border-2 border-ht-line px-4 py-2 font-semibold text-ht-muted hover:border-ht-gold hover:text-ht-gold"
          >
            Calendar
          </Link>
          <Link
            href="/network/partner/vendors"
            className="ht-label border-2 border-ht-blue px-4 py-2 font-semibold text-ht-blue hover:bg-ht-blue hover:text-white"
          >
            Find vendors
          </Link>
          <Link
            href="/network/partner/jobs/new"
            className="ht-label border-2 border-ht-gold bg-ht-gold px-4 py-2 font-semibold text-white hover:bg-ht-gold-bright"
          >
            Post an opportunity
          </Link>
        </div>
      </header>

      <ol className="grid gap-px border-2 border-ht-line bg-ht-line md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="bg-ht-panel p-5">
            <p className="ht-label text-ht-gold">Step {i + 1}</p>
            <p className="mt-1 font-semibold text-ht-cream">{step.title}</p>
            <p className="mt-1 text-sm text-ht-muted">{step.body}</p>
          </li>
        ))}
      </ol>

      {reviewsDue > 0 ? (
        <p className="border-2 border-ht-gold/60 bg-ht-panel px-5 py-4 text-sm text-ht-cream">
          {reviewsDue} completed opportunity{reviewsDue === 1 ? " needs" : "s need"} a review.{" "}
          <Link href="/network/partner/reviews" className="ht-label text-ht-gold hover:text-ht-gold-bright">
            Leave reviews
          </Link>
        </p>
      ) : null}

      <section>
        <h2 className="ht-label text-ht-muted">
          Your opportunities ({allJobs.length})
          <EventStatusTip />
        </h2>
        {allJobs.length === 0 ? (
          <p className="mt-4 text-sm text-ht-muted">
            No opportunities yet. Post your first one — HiTouch Solutions verifies it, then invites
            the best-matched vendors.
          </p>
        ) : (
          <>
            <div className="mt-4">
              <EventStatusTabs
                basePath="/partner"
                current={filter}
                counts={counts}
                audience="partner"
              />
            </div>
            {jobs.length === 0 ? (
              <p className="mt-6 border-2 border-dashed border-ht-line px-5 py-8 text-center text-sm text-ht-muted">
                No opportunities in this list right now.
              </p>
            ) : (
              <div className="mt-6 grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(19rem,1fr))]">
                {jobs.map((job) => (
                  <div key={job.id} className="flex flex-col gap-2">
                    <div className="flex-1">
                      <JobCard job={job} href={`/network/partner/jobs/${job.id}`} />
                    </div>
                    <p className="ht-label px-1 text-ht-muted">
                      {job._count.bids} applied · {job._count.invites} invited
                      {" · "}
                      <Link
                        href={`/network/partner/jobs/new?from=${job.id}`}
                        className="text-ht-gold hover:text-ht-gold-bright"
                      >
                        Duplicate
                      </Link>
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
