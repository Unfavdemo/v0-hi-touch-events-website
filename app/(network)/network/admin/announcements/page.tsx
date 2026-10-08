import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { AnnouncementForm } from "@/components/network/admin/AnnouncementForm";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { prisma } from "@/lib/network/prisma";
import { formatDateTime } from "@/lib/network/utils";

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string | string[] }>;
}) {
  await requireSuperAdmin();
  const rawJobId = (await searchParams).jobId;
  const defaultJobId =
    typeof rawJobId === "string" && rawJobId.length > 0 ? rawJobId : undefined;

  const [tags, jobs] = await Promise.all([
    prisma.categoryTag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.jobOpportunity.findMany({
      orderBy: { eventStartTime: "desc" },
      take: 120,
      select: { id: true, title: true, eventStartTime: true },
    }),
  ]);

  const opportunities = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    eventStartLabel: formatDateTime(j.eventStartTime),
  }));

  return (
    <div className="space-y-8">
      <AdminHeader title="Announcements">
        Send a notice to vendors, partners, a skill, membership status, or everyone tied to a
        specific opportunity. Choose in-app, email, and/or text for each send.
      </AdminHeader>
      <div className="max-w-xl border-2 border-ht-line bg-ht-panel p-6">
        <AnnouncementForm
          tags={tags}
          opportunities={opportunities}
          defaultJobId={
            defaultJobId && opportunities.some((o) => o.id === defaultJobId)
              ? defaultJobId
              : undefined
          }
        />
      </div>
    </div>
  );
}
