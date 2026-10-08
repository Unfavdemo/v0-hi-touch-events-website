"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/network/auth-actions";
import { logAdminAction } from "@/lib/network/admin-log";
import { getCurrentUser } from "@/lib/network/auth";
import { createNotification } from "@/lib/network/notifications";
import { prisma } from "@/lib/network/prisma";
import { formatMoney } from "@/lib/network/utils";
import { firstZodError, vendorPaySchema } from "@/lib/network/validation";
import { canManageJob } from "@/lib/network/admin-rbac";

function revalidatePay() {
  revalidatePath("/", "layout");
  revalidatePath("/network/partner/reports");
  revalidatePath("/network/partner/payments");
}

async function requireHireManager(jobId: string) {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED") redirect("/network/login");
  const job = await prisma.jobOpportunity.findUnique({
    where: { id: jobId },
    include: {
      bids: true,
      postedBy: { include: { profile: true } },
      assignedFreelancer: { include: { profile: true } },
    },
  });
  if (!job || !job.assignedFreelancerId) return null;
  if (job.status !== "FILLED" && job.status !== "COMPLETED") return null;
  if (!(await canManageJob(user, job))) return null;
  return { user, job };
}

export async function markVendorPaid(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = vendorPaySchema.safeParse({
    jobId: formData.get("jobId"),
    method: formData.get("method"),
    amount: formData.get("amount"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const ctx = await requireHireManager(parsed.data.jobId);
  if (!ctx) return { error: "You can only record pay for vendors you hired." };
  const { job } = ctx;
  if (job.vendorPaidAt) return { error: "This vendor is already marked paid." };

  try {
    await prisma.jobOpportunity.update({
      where: { id: job.id },
      data: {
        vendorPaidAt: new Date(),
        vendorPayMethod: parsed.data.method,
        vendorPaidAmount: parsed.data.amount,
        vendorPayNote: parsed.data.note ?? null,
      },
    });
  } catch (err) {
    console.error(err);
    return { error: "Could not save that payment. Try again." };
  }

  await logAdminAction(prisma, {
    actorId: ctx.user.id,
    action: "MARK_VENDOR_PAID",
    targetType: "job",
    targetId: job.id,
    message: `Marked vendor paid ${formatMoney(parsed.data.amount)} on "${job.title}"`,
  });

  const org =
    job.postedBy.profile?.companyName ?? job.postedBy.profile?.name ?? "The partner";
  await createNotification(
    prisma,
    job.assignedFreelancerId!,
    "JOB_ALERT",
    `${org} marked you paid ${formatMoney(parsed.data.amount)} for "${job.title}".`,
  );

  revalidatePay();
  return { ok: true };
}

export async function clearVendorPaid(jobId: string): Promise<void> {
  const ctx = await requireHireManager(jobId);
  if (!ctx || !ctx.job.vendorPaidAt) return;

  await prisma.jobOpportunity.update({
    where: { id: jobId },
    data: {
      vendorPaidAt: null,
      vendorPayMethod: null,
      vendorPaidAmount: null,
      vendorPayNote: null,
    },
  });
  await logAdminAction(prisma, {
    actorId: ctx.user.id,
    action: "CLEAR_VENDOR_PAID",
    targetType: "job",
    targetId: jobId,
    message: `Cleared paid mark on "${ctx.job.title}"`,
  });

  revalidatePay();
}
