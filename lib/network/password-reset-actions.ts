"use server";

import { redirect } from "next/navigation";
import {
  hashPassword,
  roleHome,
  setSessionCookie,
} from "@/lib/network/auth";
import {
  findUserForSetPasswordToken,
  verifySetPasswordToken,
} from "@/lib/network/password-reset";
import { prisma } from "@/lib/network/prisma";
import { firstZodError, setPasswordSchema } from "@/lib/network/validation";

export type SetPasswordState = { error?: string };

export async function setPasswordFromToken(
  _prev: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  const parsed = setPasswordSchema.safeParse({
    token: formData.get("token"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const userId = verifySetPasswordToken(parsed.data.token);
  if (!userId) {
    return { error: "This link is invalid or has expired. Ask an admin to send a new one." };
  }

  const user = await findUserForSetPasswordToken(parsed.data.token);
  if (!user) {
    return { error: "This link is invalid or has expired. Ask an admin to send a new one." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  await setSessionCookie(user.id);
  redirect(roleHome(user));
}
