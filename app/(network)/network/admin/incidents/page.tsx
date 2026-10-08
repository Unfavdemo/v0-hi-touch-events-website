import { AdminHeader } from "@/components/network/admin/AdminHeader";
import { IncidentForm } from "@/components/network/admin/IncidentForm";
import { IncidentHistory, type IncidentHistoryRow } from "@/components/network/admin/IncidentHistory";
import { adminJobsWhere, isSuperAdmin } from "@/lib/network/admin-rbac";
import { requireUser } from "@/lib/network/auth";
import { adminIncidentsWhere, canManageIncident, incidentInclude } from "@/lib/network/incident-access";
import { prisma } from "@/lib/network/prisma";

export default async function AdminIncidentsPage() {
  const admin = await requireUser("ADMIN");
  const scope = await adminIncidentsWhere(admin);

  const [incidents, jobs, vendors] = await Promise.all([
    prisma.incident.findMany({
      where: scope,
      include: incidentInclude,
      orderBy: { createdAt: "desc" },
    }),
    prisma.jobOpportunity.findMany({
      where: isSuperAdmin(admin) ? {} : adminJobsWhere(admin),
      orderBy: { eventStartTime: "desc" },
      take: 80,
      select: { id: true, title: true },
    }),
    prisma.user.findMany({
      where: isSuperAdmin(admin)
        ? { role: "FREELANCER", status: "APPROVED" }
        : {
            role: "FREELANCER",
            status: "APPROVED",
            jobsAssigned: { some: adminJobsWhere(admin) },
          },
      include: { profile: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const manageFlags = await Promise.all(
    incidents.map((i) => canManageIncident(admin, i.id)),
  );

  const rows: IncidentHistoryRow[] = incidents.map((i, idx) => ({
    id: i.id,
    kind: i.kind,
    notes: i.notes,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
    voidedAt: i.voidedAt?.toISOString() ?? null,
    vendorId: i.vendorId,
    vendorName: i.vendor.profile?.name ?? i.vendor.email,
    reporterName: i.reporter.profile?.name ?? i.reporter.email,
    voidedByName: i.voidedBy?.profile?.name ?? i.voidedBy?.email ?? null,
    jobId: i.jobId,
    jobTitle: i.job?.title ?? null,
    canManage: manageFlags[idx] ?? false,
  }));

  return (
    <div className="space-y-10">
      <AdminHeader title="Incidents">
        Log no-shows, complaints, and damage. Partners see incidents on their opportunities;
        vendors see only their own — never other vendors&apos; records.
      </AdminHeader>

      <section className="border-2 border-ht-line bg-ht-panel p-6">
        <h2 className="text-lg font-semibold text-ht-cream">Log an incident</h2>
        <div className="mt-4 max-w-xl">
          <IncidentForm
            vendors={vendors.map((v) => ({ id: v.id, name: v.profile?.name ?? v.email }))}
            jobs={jobs}
          />
        </div>
      </section>

      <section>
        <h2 className="ht-label text-ht-muted">History</h2>
        <div className="mt-4">
          <IncidentHistory rows={rows} jobs={jobs} />
        </div>
      </section>
    </div>
  );
}
