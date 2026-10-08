"use server";

import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/network/admin-log";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import type { ActionState } from "@/lib/network/auth-actions";
import { prisma } from "@/lib/network/prisma";
import { categoryTagSchema, firstZodError } from "@/lib/network/validation";

function revalidateAll() {
  revalidatePath("/", "layout");
}

function slugifyCategory(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCategoryTag(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireSuperAdmin();
  const parsed = categoryTagSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const slug = slugifyCategory(parsed.data.name);
  const clash = await prisma.categoryTag.findFirst({
    where: { OR: [{ name: parsed.data.name }, { slug }] },
  });
  if (clash) return { error: "That category already exists." };

  const tag = await prisma.categoryTag.create({
    data: { name: parsed.data.name, slug },
  });
  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "CREATE_CATEGORY",
    targetType: "category",
    targetId: tag.id,
    message: `Added category ${tag.name}`,
  });
  revalidateAll();
  return { ok: true };
}

export async function renameCategoryTag(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = categoryTagSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const slug = slugifyCategory(parsed.data.name);
  const clash = await prisma.categoryTag.findFirst({
    where: { OR: [{ name: parsed.data.name }, { slug }], NOT: { id } },
  });
  if (clash) return { error: "That category already exists." };

  const tag = await prisma.categoryTag.update({
    where: { id },
    data: { name: parsed.data.name, slug },
  });
  await logAdminAction(prisma, {
    actorId: actor.id,
    action: "RENAME_CATEGORY",
    targetType: "category",
    targetId: tag.id,
    message: `Renamed category to ${tag.name}`,
  });
  revalidateAll();
  return { ok: true };
}
