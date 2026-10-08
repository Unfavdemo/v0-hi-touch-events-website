"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageJob } from "@/lib/network/admin-rbac";
import { getCurrentUser } from "@/lib/network/auth";
import type { ActionState } from "@/lib/network/auth-actions";
import { prisma } from "@/lib/network/prisma";
import { firstZodError, jobDocumentRequirementSchema } from "@/lib/network/validation";

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function addOpportunityDocumentRequirement(
  jobId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED") redirect("/network/login");

  const parsed = jobDocumentRequirementSchema.safeParse({
    label: formData.get("label"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const job = await prisma.jobOpportunity.findUnique({ where: { id: jobId } });
  if (!job) return { error: "Opportunity not found." };
  if (!(await canManageJob(user, job))) {
    return { error: "You cannot edit this opportunity." };
  }
  if (job.status === "COMPLETED" || job.status === "FILLED") {
    return { error: "Add requirements before the opportunity is filled or completed." };
  }

  const label = parsed.data.label.trim();
  const dup = await prisma.jobDocumentRequirement.findFirst({
    where: {
      jobId,
      kind: "CUSTOM",
      customLabel: { equals: label, mode: "insensitive" },
    },
  });
  if (dup) return { error: "That requirement is already on this opportunity." };

  await prisma.jobDocumentRequirement.create({
    data: {
      jobId,
      kind: "CUSTOM",
      customLabel: label,
      customDescription: parsed.data.description?.trim() || null,
    },
  });
  revalidateAll();
  return { ok: true };
}

export async function removeOpportunityDocumentRequirement(requirementId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.status !== "APPROVED") redirect("/network/login");

  const row = await prisma.jobDocumentRequirement.findUnique({
    where: { id: requirementId },
    include: { job: true },
  });
  if (!row) return;
  if (!(await canManageJob(user, row.job))) return;
  if (row.job.status === "COMPLETED") return;

  await prisma.jobDocumentRequirement.delete({ where: { id: requirementId } });
  revalidateAll();
}
