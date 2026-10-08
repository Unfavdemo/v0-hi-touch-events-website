import Link from "next/link";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import {
  EVENT_FILTERS,
  EventStatusOverview,
  countEventFilters,
  matchesEventFilter,
  parseEventFilter,
} from "@/components/network/EventStatusFilter";
import { ApproveEventTip, EventStatusTip } from "@/components/network/help/Tips";
import { Badge, eventStatusLabel, statusBadgeVariant } from "@/components/network/ui/Badge";
import { Button } from "@/components/network/ui/Button";
import { adminJobsWhere, isEventAdmin, isSuperAdmin } from "@/lib/network/admin-rbac";
import { requireUser } from "@/lib/network/auth";
import { approveJob } from "@/lib/network/jobs";
import { prisma } from "@/lib/network/prisma";
import { formatDateTime, formatMoney } from "@/lib/network/utils";

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const admin = await requireUser("ADMIN");
  const superAdmin = isSuperAdmin(admin);
  const eventAdmin = isEventAdmin(admin);
  const filter = parseEventFilter((await searchParams).status);

  const allJobs = await prisma.jobOpportunity.findMany({
    where: adminJobsWhere(admin),
    include: {
      categoryTag: true,
      postedBy: { include: { profile: true } },
      delegations: { include: { admin: { include: { profile: true } } } },
      _count: { select: { bids: true, invites: true } },
    },
    orderBy: { eventStartTime: "asc" },
  });
  const counts = countEventFilters(allJobs.map((j) => j.status));
  const jobs = allJobs.filter((j) => matchesEventFilter(j.status, filter));
  if (filter === "completed") jobs.reverse();
  const filterLabel = EVENT_FILTERS.find((f) => f.value === filter)?.label ?? "Current";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminHeader title={superAdmin ? "Opportunities" : "Your opportunities"}>
          {superAdmin
            ? "Approve partner opportunities, hire vendors, assign opportunity admins, and mark work complete."
            : "Opportunities assigned to you or posted by you."}
        </AdminHeader>
        {superAdmin || eventAdmin ? (
          <Link
            href="/network/admin/jobs/new"
            className="ht-label border-2 border-ht-gold bg-ht-gold px-4 py-2 font-semibold text-white hover:bg-ht-gold-bright"
          >
            Post an opportunity
          </Link>
        ) : null}
      </div>

      <section>
        <h2 className="ht-label text-ht-muted">
          Overview
          <EventStatusTip />
        </h2>
        <div className="mt-4">
          <EventStatusOverview basePath="/admin/jobs" counts={counts} current={filter} />
        </div>
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">
          {filterLabel} ({jobs.length})
          {filter === "pending" ? <ApproveEventTip /> : null}
        </h2>
        {jobs.length === 0 ? (
          <p className="mt-4 border-2 border-dashed border-ht-line px-5 py-8 text-center text-sm text-ht-muted">
            {!superAdmin && allJobs.length === 0
              ? "No opportunities assigned to you yet. Post an opportunity or wait for a full admin to assign you."
              : filter === "pending"
                ? "Nothing waiting on you."
                : "No opportunities in this list."}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto border-2 border-ht-line">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b-2 border-ht-line bg-ht-panel">
                <tr>
                  <th className="ht-label px-4 py-3 text-ht-muted">Opportunity</th>
                  <th className="ht-label px-4 py-3 text-ht-muted">Organization</th>
                  {superAdmin ? (
                    <th className="ht-label px-4 py-3 text-ht-muted">Assigned admin</th>
                  ) : null}
                  <th className="ht-label px-4 py-3 text-ht-muted">Date</th>
                  <th className="ht-label px-4 py-3 text-ht-muted">Pay</th>
                  <th className="ht-label px-4 py-3 text-ht-muted">Invited</th>
                  <th className="ht-label px-4 py-3 text-ht-muted">Applied</th>
                  <th className="ht-label px-4 py-3 text-ht-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const org =
                    job.postedBy.profile?.companyName ??
                    job.postedBy.profile?.name ??
                    job.postedBy.email;
                  const contact = job.postedBy.profile?.name;
                  return (
                    <tr
                      key={job.id}
                      className="border-b border-ht-line bg-ht-panel/40 align-top last:border-b-0"
                    >
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/network/admin/jobs/${job.id}`}
                          className="font-medium text-ht-cream hover:text-ht-gold"
                        >
                          {job.title}
                        </Link>
                        <p className="mt-1 text-xs text-ht-muted">{job.categoryTag.name}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-ht-cream">{org}</p>
                        {contact && contact !== org ? (
                          <p className="mt-1 text-xs text-ht-muted">{contact}</p>
                        ) : null}
                      </td>
                      {superAdmin ? (
                        <td className="px-4 py-3.5 text-ht-muted">
                          {job.delegations.length === 0
                            ? "—"
                            : job.delegations
                                .map((d) => d.admin.profile?.name ?? d.admin.email)
                                .join(", ")}
                        </td>
                      ) : null}
                      <td className="px-4 py-3.5 whitespace-nowrap text-ht-muted">
                        {formatDateTime(job.eventStartTime)}
                      </td>
                      <td className="px-4 py-3.5 text-ht-gold">
                        {formatMoney(job.payRate.toString())}
                      </td>
                      <td className="px-4 py-3.5 text-ht-muted">{job._count.invites}</td>
                      <td className="px-4 py-3.5 text-ht-muted">{job._count.bids}</td>
                      <td className="px-4 py-3.5">
                        {job.status === "PENDING_APPROVAL" ? (
                          <form action={approveJob.bind(null, job.id)}>
                            <Button type="submit" size="sm" variant="blue">
                              Approve &amp; send invites
                            </Button>
                          </form>
                        ) : (
                          <Badge variant={statusBadgeVariant(job.status)}>
                            {eventStatusLabel(job.status)}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
