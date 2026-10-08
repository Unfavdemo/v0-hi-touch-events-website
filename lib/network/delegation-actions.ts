"use server";

import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/network/auth";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { logAdminAction } from "@/lib/network/admin-log";
import type { ActionState } from "@/lib/network/auth-actions";
import { createNotification } from "@/lib/network/notifications";
import { prisma } from "@/lib/network/prisma";
import { eventAdminCreateSchema, firstZodError } from "@/lib/network/validation";

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function createEventAdmin(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireSuperAdmin();
  const parsed = eventAdminCreateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "An account with this email already exists." };

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      role: "ADMIN",
      adminScope: "EVENT",
      status: "APPROVED",
      profile: { create: { name: parsed.data.name, type: "INDIVIDUAL" } },
    },
  });
  await createNotification(
    prisma,
    user.id,
    "APPLICATION_UPDATE",
    "You were added as an opportunity admin. Sign in to work the opportunitys assigned to you.",
  );
  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "CREATE_EVENT_ADMIN",
    targetType: "user",
    targetId: user.id,
    message: `Created opportunity admin ${parsed.data.name} (${parsed.data.email})`,
  });
  revalidateAll();
  return { ok: true };
}

export async function delegateEvent(formData: FormData): Promise<void> {
  const actor = await requireSuperAdmin();
  const jobId = String(formData.get("jobId") ?? "");
  const adminId = String(formData.get("adminId") ?? "");
  if (!jobId || !adminId) return;

  const [job, admin] = await Promise.all([
    prisma.jobOpportunity.findUnique({ where: { id: jobId } }),
    prisma.user.findUnique({
      where: { id: adminId, role: "ADMIN", adminScope: "EVENT" },
      include: { profile: true },
    }),
  ]);
  if (!job || !admin) return;

  await prisma.eventDelegation.upsert({
    where: { jobId_adminId: { jobId, adminId } },
    update: {},
    create: { jobId, adminId, delegatedById: actor.id },
  });
  await createNotification(
    prisma,
    adminId,
    "JOB_ALERT",
    `You were assigned to "${job.title}". Open Your Opportunities to work it.`,
  );
  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "DELEGATE_EVENT",
    targetType: "job",
    targetId: jobId,
    message: `Assigned ${admin.profile?.name ?? admin.email} to "${job.title}"`,
  });
  revalidateAll();
}

export async function revokeEventDelegation(delegationId: string): Promise<void> {
  const actor = await requireSuperAdmin();
  const row = await prisma.eventDelegation.findUnique({
    where: { id: delegationId },
    include: {
      job: true,
      admin: { include: { profile: true } },
    },
  });
  if (!row) return;
  await prisma.eventDelegation.delete({ where: { id: delegationId } });
  await createNotification(
    prisma,
    row.adminId,
    "JOB_ALERT",
    `You were removed from "${row.job.title}".`,
  );
  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "REVOKE_DELEGATION",
    targetType: "job",
    targetId: row.jobId,
    message: `Removed ${row.admin.profile?.name ?? row.admin.email} from "${row.job.title}"`,
  });
  revalidateAll();
}
