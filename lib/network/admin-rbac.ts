import { redirect } from "next/navigation";
import type { Prisma } from "@/lib/generated/network-prisma/client";
import type { SessionUser } from "@/lib/network/auth";
import { getCurrentUser } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";
import { isPartnerOrgMember } from "@/lib/network/partner-org";

export function isSuperAdmin(user: { role: string; adminScope?: string | null }): boolean {
  return user.role === "ADMIN" && user.adminScope !== "EVENT";
}

export function isEventAdmin(user: { role: string; adminScope?: string | null }): boolean {
  return user.role === "ADMIN" && user.adminScope === "EVENT";
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED") redirect("/network/login");
  if (!isSuperAdmin(user)) redirect("/network/admin");
  return user;
}

export async function delegatedJobIds(adminId: string): Promise<string[]> {
  const rows = await prisma.eventDelegation.findMany({
    where: { adminId },
    select: { jobId: true },
  });
  return rows.map((r) => r.jobId);
}

export function adminJobsWhere(user: SessionUser): Prisma.JobOpportunityWhereInput {
  if (isSuperAdmin(user)) return {};
  return {
    OR: [
      { delegations: { some: { adminId: user.id } } },
      { postedById: user.id },
    ],
  };
}

export const jobsWhereForAdmin = adminJobsWhere;

export async function canManageJob(
  user: { id: string; role: string; adminScope?: string | null; status?: string },
  job: { id: string; postedById: string },
): Promise<boolean> {
  if (user.status && user.status !== "APPROVED") return false;
  if (job.postedById === user.id) return true;
  if (user.role === "PARTNER") {
    if (await isPartnerOrgMember(user.id, job.postedById)) return true;
  }
  if (isSuperAdmin(user)) return true;
  if (!isEventAdmin(user)) return false;
  const row = await prisma.eventDelegation.findUnique({
    where: { jobId_adminId: { jobId: job.id, adminId: user.id } },
  });
  return Boolean(row);
}
