import type { Prisma } from "@/lib/generated/network-prisma/client";
import type { SessionUser } from "@/lib/network/auth";
import { adminJobsWhere, canManageJob, isSuperAdmin } from "@/lib/network/admin-rbac";
import { partnerOwnerId } from "@/lib/network/partner-org";
import { prisma } from "@/lib/network/prisma";

export type IncidentWithRelations = Prisma.IncidentGetPayload<{
  include: {
    vendor: { include: { profile: true } };
    reporter: { include: { profile: true } };
    job: true;
    voidedBy: { include: { profile: true } };
  };
}>;

const incidentInclude = {
  vendor: { include: { profile: true } },
  reporter: { include: { profile: true } },
  job: true,
  voidedBy: { include: { profile: true } },
} as const;

export function partnerIncidentsWhere(ownerId: string): Prisma.IncidentWhereInput {
  return {
    OR: [
      { job: { postedById: ownerId } },
      {
        jobId: null,
        vendor: { jobsAssigned: { some: { postedById: ownerId } } },
      },
    ],
  };
}

export async function adminIncidentsWhere(user: SessionUser): Promise<Prisma.IncidentWhereInput> {
  if (isSuperAdmin(user)) return {};
  const jobScope = adminJobsWhere(user);
  return {
    OR: [
      { job: jobScope },
      { vendor: { jobsAssigned: { some: jobScope } } },
    ],
  };
}

export async function freelancerIncidentsWhere(vendorId: string): Promise<Prisma.IncidentWhereInput> {
  return { vendorId };
}

/** Vendors only see their own; partners and admins see scoped rows; never expose to other vendors. */
export async function incidentsWhereForViewer(user: SessionUser): Promise<Prisma.IncidentWhereInput> {
  if (user.role === "FREELANCER") return freelancerIncidentsWhere(user.id);
  if (user.role === "PARTNER") {
    const ownerId = await partnerOwnerId(user.id);
    return partnerIncidentsWhere(ownerId);
  }
  if (user.role === "ADMIN") return adminIncidentsWhere(user);
  return { id: "never" };
}

export async function canViewIncident(
  user: SessionUser,
  incident: { vendorId: string; jobId: string | null; job?: { postedById: string } | null },
): Promise<boolean> {
  if (user.role === "FREELANCER") return incident.vendorId === user.id;
  if (user.role === "PARTNER") {
    const ownerId = await partnerOwnerId(user.id);
    if (incident.job?.postedById === ownerId) return true;
    if (!incident.jobId) {
      const hired = await prisma.jobOpportunity.count({
        where: { postedById: ownerId, assignedFreelancerId: incident.vendorId },
      });
      return hired > 0;
    }
    return false;
  }
  if (user.role === "ADMIN") {
    if (isSuperAdmin(user)) return true;
    if (incident.jobId && incident.job) {
      return canManageJob(user, { id: incident.jobId, postedById: incident.job.postedById });
    }
    const scoped = await prisma.jobOpportunity.count({
      where: {
        ...adminJobsWhere(user),
        assignedFreelancerId: incident.vendorId,
      },
    });
    return scoped > 0;
  }
  return false;
}

export async function canManageIncident(user: SessionUser, incidentId: string): Promise<boolean> {
  if (user.role !== "ADMIN" || user.status !== "APPROVED") return false;
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: { job: { select: { id: true, postedById: true } } },
  });
  if (!incident) return false;
  if (isSuperAdmin(user)) return true;
  if (incident.job) return canManageJob(user, incident.job);
  const scoped = await prisma.jobOpportunity.count({
    where: {
      ...adminJobsWhere(user),
      assignedFreelancerId: incident.vendorId,
    },
  });
  return scoped > 0;
}

export async function assertCanManageVendorForIncident(
  user: SessionUser,
  vendorId: string,
  jobId?: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (user.role !== "ADMIN" || user.status !== "APPROVED") {
    return { ok: false, error: "Only HiTouch admins can log incidents." };
  }
  if (isSuperAdmin(user)) return { ok: true };
  if (jobId) {
    const job = await prisma.jobOpportunity.findUnique({
      where: { id: jobId },
      select: { id: true, postedById: true, assignedFreelancerId: true },
    });
    if (!job) return { ok: false, error: "That opportunity was not found." };
    if (!(await canManageJob(user, job))) {
      return { ok: false, error: "That opportunity is outside your scope." };
    }
    if (job.assignedFreelancerId !== vendorId) {
      return { ok: false, error: "That vendor was not hired on the selected opportunity." };
    }
    return { ok: true };
  }
  const scoped = await prisma.jobOpportunity.count({
    where: { ...adminJobsWhere(user), assignedFreelancerId: vendorId },
  });
  if (scoped === 0) {
    return { ok: false, error: "Log incidents only for vendors on opportunities you manage." };
  }
  return { ok: true };
}

export { incidentInclude };
