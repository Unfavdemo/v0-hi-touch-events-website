"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/network/auth";
import type { ActionState } from "@/lib/network/auth-actions";
import { prisma } from "@/lib/network/prisma";
import {
  changePasswordSchema,
  firstZodError,
  vendorSettingsSchema,
} from "@/lib/network/validation";

export async function updateVendorSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "FREELANCER" || user.status !== "APPROVED") {
    redirect("/network/login");
  }

  const parsed = vendorSettingsSchema.safeParse({
    timezone: formData.get("timezone"),
    emergencyContact: formData.get("emergencyContact") || undefined,
    invites: formData.get("prefInvites") === "1",
    hired: formData.get("prefHired") === "1",
    messages: formData.get("prefMessages") === "1",
    payments: formData.get("prefPayments") === "1",
    announcements: formData.get("prefAnnouncements") === "1",
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const { timezone, emergencyContact, ...prefs } = parsed.data;

  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      timezone,
      emergencyContact: emergencyContact ?? null,
      notificationPrefs: prefs,
    },
  });

  revalidatePath("/network/freelancer/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function changeVendorPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "FREELANCER" || user.status !== "APPROVED") {
    redirect("/network/login");
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const row = await prisma.user.findUnique({ where: { id: user.id } });
  if (!row || !(await verifyPassword(parsed.data.currentPassword, row.passwordHash))) {
    return { error: "Your current password doesn't match." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  return { ok: true };
}
