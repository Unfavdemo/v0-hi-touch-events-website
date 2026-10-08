import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { JobForm } from "@/components/network/JobForm";
import { canManageJob } from "@/lib/network/admin-rbac";
import { requireUser } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";
import { toDatetimeLocalValue } from "@/lib/network/utils";

export default async function AdminEditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireUser("ADMIN");
  const { id } = await params;

  const job = await prisma.jobOpportunity.findUnique({
    where: { id },
    include: { partnerEvent: { select: { id: true, name: true } } },
  });
  if (!job) notFound();
  if (!(await canManageJob(admin, job))) notFound();
  if (job.status === "COMPLETED" || job.status === "FILLED") notFound();

  const tags = await prisma.categoryTag.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <Link href={`/network/admin/jobs/${job.id}`} className="ht-label text-ht-muted hover:text-ht-gold">
        ← {job.title}
      </Link>
      <div className="mt-4">
        <AdminHeader title="Edit opportunity">
          Update title, schedule, pay, and description. Link events and required documents on the
          opportunity page.
        </AdminHeader>
      </div>
      {job.partnerEvent ? (
        <p className="mt-2 text-sm text-ht-muted">
          Part of event:{" "}
          <Link href={`/network/admin/events/${job.partnerEvent.id}`} className="text-ht-gold hover:text-ht-gold-bright">
            {job.partnerEvent.name}
          </Link>
        </p>
      ) : null}
      <div className="mt-8">
        <JobForm
          tags={tags.map((t) => ({ id: t.id, name: t.name }))}
          posterKind="admin"
          editJobId={job.id}
          defaults={{
            title: job.title,
            description: job.description,
            categoryTagId: job.categoryTagId,
            payRate: job.payRate.toString(),
            location: job.location,
            isOpenBidding: job.isOpenBidding,
            setupTime: toDatetimeLocalValue(job.setupTime),
            eventStartTime: toDatetimeLocalValue(job.eventStartTime),
            eventEndTime: toDatetimeLocalValue(job.eventEndTime),
            breakdownTime: toDatetimeLocalValue(job.breakdownTime),
          }}
        />
      </div>
    </div>
  );
}
