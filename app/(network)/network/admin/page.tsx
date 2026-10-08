import Link from "next/link";
import { EventStatusOverview, countEventFilters } from "@/components/network/EventStatusFilter";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { EventStatusTip } from "@/components/network/help/Tips";
import { adminJobsWhere, isSuperAdmin } from "@/lib/network/admin-rbac";
import { isStaffingGap, upcomingWindow } from "@/lib/network/admin-schedule";
import { requireUser } from "@/lib/network/auth";
import { getPlatformSettings } from "@/lib/network/platform-settings";
import { prisma } from "@/lib/network/prisma";

function firstApplicantHours(createdAt: Date, firstBidAt: Date | undefined): string {
  if (firstBidAt == null) return "—";
  const hours = Math.round((firstBidAt.getTime() - createdAt.getTime()) / 36e5);
  if (hours <= 0) return "under an hour";
  return `${hours}h`;
}

export default async function AdminOverviewPage() {
  const admin = await requireUser("ADMIN");
  const superAdmin = isSuperAdmin(admin);
  const window = upcomingWindow(14);

  const matchingPromise = superAdmin
    ? (async () => {
        const { inviteTarget } = await getPlatformSettings();
        const [activeJobs, pendingGroups] = await Promise.all([
          prisma.jobOpportunity.findMany({
            where: { status: "ACTIVE" },
            include: {
              categoryTag: true,
              invites: { select: { status: true } },
              bids: { select: { createdAt: true }, orderBy: { createdAt: "asc" }, take: 1 },
            },
            orderBy: { eventStartTime: "desc" },
            take: 6,
          }),
          prisma.jobInvite.groupBy({
            by: ["freelancerId"],
            where: { status: "PENDING" },
            _count: { _all: true },
          }),
        ]);
        const underTarget = await prisma.jobOpportunity.findMany({
          where: { status: "ACTIVE" },
          select: { _count: { select: { invites: true } } },
        });
        const shortCount = underTarget.filter((j) => j._count.invites < inviteTarget).length;
        const vendorsIgnoring = pendingGroups.filter((g) => g._count._all >= 2).length;
        return { inviteTarget, activeJobs, shortCount, vendorsIgnoring };
      })()
    : Promise.resolve(null);

  const [jobStatuses, pendingCount, flaggedCount, upcoming, matching] = await Promise.all([
    prisma.jobOpportunity.findMany({
      where: adminJobsWhere(admin),
      select: { status: true },
    }),
    superAdmin
      ? prisma.user.count({ where: { status: "PENDING", role: { not: "ADMIN" } } })
      : Promise.resolve(0),
    superAdmin
      ? prisma.profile.count({ where: { flaggedForDismissal: true } })
      : Promise.resolve(0),
    prisma.jobOpportunity.findMany({
      where: {
        ...adminJobsWhere(admin),
        eventStartTime: { gte: window.start, lte: window.end },
      },
      select: { status: true, assignedFreelancerId: true },
    }),
    matchingPromise,
  ]);

  const gaps = upcoming.filter(isStaffingGap).length;

  return (
    <div className="space-y-10">
      <AdminHeader title="Today at HiTouch">
        {superAdmin
          ? "Intake, staffing, and quality — jump into the queue that needs you."
          : "Your assigned opportunities for the next two weeks."}
      </AdminHeader>

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="ht-label text-ht-muted">
            Opportunities overview
            <EventStatusTip />
          </h2>
          <Link href="/network/admin/jobs" className="ht-label text-ht-gold hover:text-ht-gold-bright">
            Manage opportunities →
          </Link>
        </div>
        <div className="mt-4">
          <EventStatusOverview
            basePath="/admin/jobs"
            counts={countEventFilters(jobStatuses.map((j) => j.status))}
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {superAdmin ? (
          <>
            <Link
              href="/network/admin/applications"
              className="border-2 border-ht-line bg-ht-panel p-5 hover:border-ht-gold"
            >
              <p className="ht-label text-ht-muted">Applications</p>
              <p className="mt-2 text-3xl font-bold text-ht-cream">{pendingCount}</p>
              <p className="mt-1 text-sm text-ht-muted">Waiting to join</p>
            </Link>
            <Link
              href="/network/admin/vendors"
              className="border-2 border-ht-line bg-ht-panel p-5 hover:border-ht-gold"
            >
              <p className="ht-label text-ht-muted">Low ratings</p>
              <p className="mt-2 text-3xl font-bold text-ht-cream">{flaggedCount}</p>
              <p className="mt-1 text-sm text-ht-muted">Flagged for review</p>
            </Link>
          </>
        ) : null}
        <Link
          href="/network/admin/schedule"
          className="border-2 border-ht-line bg-ht-panel p-5 hover:border-ht-gold"
        >
          <p className="ht-label text-ht-muted">Staffing gaps</p>
          <p className="mt-2 text-3xl font-bold text-ht-cream">{gaps}</p>
          <p className="mt-1 text-sm text-ht-muted">Active opportunities in 14 days with no vendor</p>
        </Link>
        {superAdmin && matching ? (
          <>
            <Link
              href="/network/admin/matching"
              className="border-2 border-ht-line bg-ht-panel p-5 hover:border-ht-gold"
            >
              <p className="ht-label text-ht-muted">Matching — short invites</p>
              <p className="mt-2 text-3xl font-bold text-ht-cream">{matching.shortCount}</p>
              <p className="mt-1 text-sm text-ht-muted">
                Live opportunities below {matching.inviteTarget} invites
              </p>
            </Link>
            <Link
              href="/network/admin/matching"
              className="border-2 border-ht-line bg-ht-panel p-5 hover:border-ht-gold"
            >
              <p className="ht-label text-ht-muted">Matching — open invites</p>
              <p className="mt-2 text-3xl font-bold text-ht-cream">{matching.vendorsIgnoring}</p>
              <p className="mt-1 text-sm text-ht-muted">Vendors holding 2+ pending invites</p>
            </Link>
          </>
        ) : null}
      </section>

      {superAdmin && matching && matching.activeJobs.length > 0 ? (
        <section>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="ht-label text-ht-muted">Matching</h2>
            <Link href="/network/admin/matching" className="ht-label text-ht-gold hover:text-ht-gold-bright">
              Full matching report →
            </Link>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-ht-muted">
            Invite funnel on live opportunities — who was invited, who applied, and how fast the
            first quote landed.
          </p>
          <div className="mt-4 overflow-x-auto border-2 border-ht-line">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b-2 border-ht-line bg-ht-panel">
                <tr>
                  <th className="ht-label px-4 py-3 text-ht-muted">Opportunity</th>
                  <th className="ht-label px-4 py-3 text-ht-muted">Invited</th>
                  <th className="ht-label px-4 py-3 text-ht-muted">Applied</th>
                  <th className="ht-label px-4 py-3 text-ht-muted">Declined</th>
                  <th className="ht-label px-4 py-3 text-ht-muted">First applicant</th>
                </tr>
              </thead>
              <tbody>
                {matching.activeJobs.map((job) => {
                  const applied = job.invites.filter((i) => i.status === "APPLIED").length;
                  const declined = job.invites.filter((i) => i.status === "DECLINED").length;
                  const firstBid = job.bids[0]?.createdAt;
                  return (
                    <tr key={job.id} className="border-b border-ht-line last:border-b-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/network/admin/jobs/${job.id}`}
                          className="text-ht-cream hover:text-ht-gold"
                        >
                          {job.title}
                        </Link>
                        <p className="text-xs text-ht-muted">{job.categoryTag.name}</p>
                      </td>
                      <td className="px-4 py-3 text-ht-muted">{job.invites.length}</td>
                      <td className="px-4 py-3 text-ht-muted">{applied}</td>
                      <td className="px-4 py-3 text-ht-muted">{declined}</td>
                      <td className="px-4 py-3 text-ht-muted">
                        {firstApplicantHours(job.createdAt, firstBid)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
