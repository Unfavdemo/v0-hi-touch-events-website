"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { logAdminAction } from "@/lib/network/admin-log";
import { createNotification } from "@/lib/network/notifications";
import { prisma } from "@/lib/network/prisma";

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function approveUser(userId: string): Promise<void> {
  const actor = await requireSuperAdmin();
  const user = await prisma.user.update({
    where: { id: userId, status: "PENDING" },
    data: { status: "APPROVED" },
    include: { profile: true },
  });
  await createNotification(
    prisma,
    userId,
    "APPLICATION_UPDATE",
    "Your HiTouch Solutions application was approved. Welcome to the network.",
  );
  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "APPROVE_USER",
    targetType: "user",
    targetId: userId,
    message: `Approved ${user.profile?.name ?? user.email}`,
  });
  revalidateAll();
}

export async function rejectUser(userId: string): Promise<void> {
  const actor = await requireSuperAdmin();
  const user = await prisma.user.update({
    where: { id: userId, status: "PENDING" },
    data: { status: "REJECTED" },
    include: { profile: true },
  });
  await createNotification(
    prisma,
    userId,
    "APPLICATION_UPDATE",
    "Your HiTouch Solutions application was not approved at this time.",
  );
  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "REJECT_USER",
    targetType: "user",
    targetId: userId,
    message: `Rejected ${user.profile?.name ?? user.email}`,
  });
  revalidateAll();
}

export async function suspendUser(userId: string): Promise<void> {
  const actor = await requireSuperAdmin();
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: "SUSPENDED" },
    include: { profile: true },
  });
  await createNotification(
    prisma,
    userId,
    "DISMISSAL_NOTICE",
    "Your HiTouch Solutions membership has been suspended following review.",
  );
  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "SUSPEND_USER",
    targetType: "user",
    targetId: userId,
    message: `Suspended ${user.profile?.name ?? user.email}`,
  });
  revalidateAll();
}

export async function reinstateUser(userId: string): Promise<void> {
  const actor = await requireSuperAdmin();
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: "APPROVED" },
    include: { profile: true },
  });
  await createNotification(
    prisma,
    userId,
    "APPLICATION_UPDATE",
    "Your HiTouch Solutions membership has been reinstated.",
  );
  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "REINSTATE_USER",
    targetType: "user",
    targetId: userId,
    message: `Reinstated ${user.profile?.name ?? user.email}`,
  });
  revalidateAll();
}

export async function clearDismissalFlag(userId: string): Promise<void> {
  const actor = await requireSuperAdmin();
  const profile = await prisma.profile.update({
    where: { userId },
    data: { flaggedForDismissal: false },
  });
  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "CLEAR_DISMISSAL_FLAG",
    targetType: "user",
    targetId: userId,
    message: `Cleared dismissal flag for ${profile.name}`,
  });
  revalidateAll();
}

export async function saveMemberNotes(userId: string, formData: FormData): Promise<void> {
  const actor = await requireSuperAdmin();
  const notes = String(formData.get("adminNotes") ?? "").trim();
  const profile = await prisma.profile.update({
    where: { userId },
    data: { adminNotes: notes || null },
  });
  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "SAVE_MEMBER_NOTES",
    targetType: "user",
    targetId: userId,
    message: `Updated notes for ${profile.name}`,
  });
  revalidateAll();
}
