import Link from "next/link";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { Badge, eventStatusLabel, statusBadgeVariant } from "@/components/network/ui/Badge";
import { adminJobsWhere } from "@/lib/network/admin-rbac";
import { dayKey, isStaffingGap, upcomingWindow } from "@/lib/network/admin-schedule";
import { requireUser } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";
import { formatDateTime, formatDay } from "@/lib/network/utils";

export default async function AdminSchedulePage() {
  const admin = await requireUser("ADMIN");
  const { start, end } = upcomingWindow(14);

  const jobs = await prisma.jobOpportunity.findMany({
    where: {
      ...adminJobsWhere(admin),
      eventStartTime: { gte: start, lte: end },
    },
    include: {
      categoryTag: true,
      assignedFreelancer: { include: { profile: true } },
      postedBy: { include: { profile: true } },
      _count: { select: { bids: true } },
    },
    orderBy: { eventStartTime: "asc" },
  });

  const gaps = jobs.filter(isStaffingGap);
  const byDay = new Map<string, typeof jobs>();
  for (const job of jobs) {
    const key = dayKey(job.eventStartTime);
    const list = byDay.get(key) ?? [];
    list.push(job);
    byDay.set(key, list);
  }

  return (
    <div className="space-y-10">
      <AdminHeader title="Schedule">
        Opportunities in the next 14 days. Staffing gaps are live opportunities with nobody hired yet.
      </AdminHeader>

      <section>
        <h2 className="ht-label text-ht-muted">Staffing gaps ({gaps.length})</h2>
        {gaps.length === 0 ? (
          <p className="mt-4 border-2 border-dashed border-ht-line px-5 py-8 text-center text-sm text-ht-muted">
            Every upcoming opportunity has a vendor, or nothing is live in this window.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {gaps.map((job) => (
              <li key={job.id} className="border-2 border-ht-danger/40 bg-ht-panel p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/network/admin/jobs/${job.id}`}
                      className="font-semibold text-ht-cream hover:text-ht-gold"
                    >
                      {job.title}
                    </Link>
                    <p className="mt-1 text-sm text-ht-muted">
                      {job.categoryTag.name} · {formatDateTime(job.eventStartTime)} ·{" "}
                      {job._count.bids} applicant{job._count.bids === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Badge variant="danger">Unstaffed</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="ht-label text-ht-muted">Next 14 days</h2>
        {jobs.length === 0 ? (
          <p className="border-2 border-dashed border-ht-line px-5 py-8 text-center text-sm text-ht-muted">
            No opportunities on the calendar in this window.
          </p>
        ) : (
          [...byDay.entries()].map(([key, dayJobs]) => (
            <div key={key}>
              <h3 className="ht-label text-ht-gold">{formatDay(dayJobs[0]!.eventStartTime)}</h3>
              <ul className="mt-2 divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
                {dayJobs.map((job) => (
                  <li key={job.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <Link
                        href={`/network/admin/jobs/${job.id}`}
                        className="font-medium text-ht-cream hover:text-ht-gold"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs text-ht-muted">
                        {job.categoryTag.name}
                        {job.assignedFreelancer
                          ? ` · ${job.assignedFreelancer.profile?.name ?? job.assignedFreelancer.email}`
                          : " · no vendor yet"}
                      </p>
                    </div>
                    <Badge variant={statusBadgeVariant(job.status)}>
                      {eventStatusLabel(job.status)}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
