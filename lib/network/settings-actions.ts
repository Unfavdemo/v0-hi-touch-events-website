"use server";

import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/network/admin-log";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import type { ActionState } from "@/lib/network/auth-actions";
import { upsertPlatformSettings } from "@/lib/network/platform-settings";
import { prisma } from "@/lib/network/prisma";
import { firstZodError, platformSettingsSchema } from "@/lib/network/validation";

export async function savePlatformSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireSuperAdmin();
  const parsed = platformSettingsSchema.safeParse({
    warningThreshold: formData.get("warningThreshold"),
    dismissalThreshold: formData.get("dismissalThreshold"),
    inviteTarget: formData.get("inviteTarget"),
    sendMoreExtra: formData.get("sendMoreExtra"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  if (parsed.data.dismissalThreshold > parsed.data.warningThreshold) {
    return { error: "Dismissal threshold should be at or below the warning threshold." };
  }

  await upsertPlatformSettings(parsed.data);
  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "UPDATE_SETTINGS",
    targetType: "settings",
    targetId: "default",
    message: `Updated matching and rating settings (warn ${parsed.data.warningThreshold}, dismiss ${parsed.data.dismissalThreshold}, invites ${parsed.data.inviteTarget})`,
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
