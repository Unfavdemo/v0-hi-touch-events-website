"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/network/auth";
import { canMarkArrived, canMarkWrapped } from "@/lib/network/checkin";
import { notifyPartnerOrg } from "@/lib/network/notifications";
import { prisma } from "@/lib/network/prisma";

function revalidateCheckIn(jobId: string) {
  revalidatePath("/", "layout");
  revalidatePath(`/network/freelancer/jobs/${jobId}`);
  revalidatePath(`/network/partner/jobs/${jobId}`);
  revalidatePath(`/network/admin/jobs/${jobId}`);
  revalidatePath("/network/partner/calendar");
  revalidatePath("/network/freelancer");
}

async function requireAssignedVendor(jobId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "FREELANCER" || user.status !== "APPROVED") {
    redirect("/network/login");
  }
  const job = await prisma.jobOpportunity.findUnique({ where: { id: jobId } });
  if (!job || job.assignedFreelancerId !== user.id) return null;
  return { user, job };
}

export async function markVendorArrived(jobId: string): Promise<void> {
  const ctx = await requireAssignedVendor(jobId);
  if (!ctx || !canMarkArrived(ctx.job)) return;

  await prisma.jobOpportunity.update({
    where: { id: jobId },
    data: { vendorArrivedAt: new Date() },
  });

  const name = ctx.user.profile?.name ?? ctx.user.email;
  await notifyPartnerOrg(
    prisma,
    ctx.job.postedById,
    "VENDOR_ARRIVED",
    `${name} checked in on site for "${ctx.job.title}".`,
  );
  revalidateCheckIn(jobId);
}

export async function markVendorWrapped(jobId: string): Promise<void> {
  const ctx = await requireAssignedVendor(jobId);
  if (!ctx || !canMarkWrapped(ctx.job)) return;

  await prisma.jobOpportunity.update({
    where: { id: jobId },
    data: { vendorWrappedAt: new Date() },
  });

  const name = ctx.user.profile?.name ?? ctx.user.email;
  await notifyPartnerOrg(
    prisma,
    ctx.job.postedById,
    "VENDOR_WRAPPED",
    `${name} marked "${ctx.job.title}" wrapped. Mark it completed when you're ready to review and pay.`,
  );
  revalidateCheckIn(jobId);
}
