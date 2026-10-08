"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/network/auth";
import type { ActionState } from "@/lib/network/auth-actions";
import { prisma } from "@/lib/network/prisma";
import { firstZodError, vendorCrewMemberSchema } from "@/lib/network/validation";

function revalidateCrew(jobId?: string) {
  revalidatePath("/network/freelancer/crew");
  if (jobId) {
    revalidatePath(`/network/freelancer/jobs/${jobId}`);
    revalidatePath(`/network/partner/jobs/${jobId}`);
  }
  revalidatePath("/", "layout");
}

async function requireBusinessVendor() {
  const user = await getCurrentUser();
  if (!user || user.role !== "FREELANCER" || user.status !== "APPROVED") {
    redirect("/network/login");
  }
  if (user.profile?.type !== "BUSINESS") {
    redirect("/network/freelancer");
  }
  return user;
}

export async function createCrewMember(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireBusinessVendor();
  const parsed = vendorCrewMemberSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  await prisma.vendorCrewMember.create({
    data: { vendorId: user.id, ...parsed.data, phone: parsed.data.phone ?? null },
  });
  revalidateCrew();
  return { ok: true };
}

export async function deleteCrewMember(memberId: string): Promise<void> {
  const user = await requireBusinessVendor();
  const member = await prisma.vendorCrewMember.findUnique({ where: { id: memberId } });
  if (!member || member.vendorId !== user.id) return;

  await prisma.vendorCrewMember.delete({ where: { id: memberId } });
  revalidateCrew();
}

async function assertCanAssignJob(jobId: string, vendorId: string) {
  const job = await prisma.jobOpportunity.findUnique({ where: { id: jobId } });
  if (
    !job ||
    job.assignedFreelancerId !== vendorId ||
    !["FILLED", "COMPLETED"].includes(job.status)
  ) {
    return null;
  }
  return job;
}

export async function assignCrewToJob(jobId: string, crewMemberId: string): Promise<void> {
  const user = await requireBusinessVendor();
  const job = await assertCanAssignJob(jobId, user.id);
  if (!job) return;

  const member = await prisma.vendorCrewMember.findUnique({ where: { id: crewMemberId } });
  if (!member || member.vendorId !== user.id) return;

  await prisma.jobCrewAssignment.upsert({
    where: { jobId_crewMemberId: { jobId, crewMemberId } },
    create: { jobId, crewMemberId, vendorId: user.id },
    update: {},
  });
  revalidateCrew(jobId);
}

export async function unassignCrewFromJob(jobId: string, crewMemberId: string): Promise<void> {
  const user = await requireBusinessVendor();
  const job = await assertCanAssignJob(jobId, user.id);
  if (!job) return;

  await prisma.jobCrewAssignment.deleteMany({
    where: { jobId, crewMemberId, vendorId: user.id },
  });
  revalidateCrew(jobId);
}

export async function setJobCrewAssignments(jobId: string, crewMemberIds: string[]): Promise<void> {
  const user = await requireBusinessVendor();
  const job = await assertCanAssignJob(jobId, user.id);
  if (!job) return;

  const members = await prisma.vendorCrewMember.findMany({
    where: { vendorId: user.id, id: { in: crewMemberIds } },
    select: { id: true },
  });
  const allowed = new Set(members.map((m) => m.id));

  await prisma.$transaction([
    prisma.jobCrewAssignment.deleteMany({ where: { jobId, vendorId: user.id } }),
    prisma.jobCrewAssignment.createMany({
      data: [...allowed].map((crewMemberId) => ({
        jobId,
        crewMemberId,
        vendorId: user.id,
      })),
      skipDuplicates: true,
    }),
  ]);
  revalidateCrew(jobId);
}
