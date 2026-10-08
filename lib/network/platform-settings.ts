import type { Prisma, PrismaClient } from "@/lib/generated/network-prisma/client";
import { prisma } from "@/lib/network/prisma";

type Db = PrismaClient | Prisma.TransactionClient;

export const DEFAULT_WARNING_THRESHOLD = 3.5;
export const DEFAULT_DISMISSAL_THRESHOLD = 3.0;
export const DEFAULT_INVITE_TARGET = 5;
export const DEFAULT_SEND_MORE_EXTRA = 3;

export const PLATFORM_SETTINGS_ID = "default";

export interface PlatformSettingsValues {
  warningThreshold: number;
  dismissalThreshold: number;
  inviteTarget: number;
  sendMoreExtra: number;
}

const FALLBACK: PlatformSettingsValues = {
  warningThreshold: DEFAULT_WARNING_THRESHOLD,
  dismissalThreshold: DEFAULT_DISMISSAL_THRESHOLD,
  inviteTarget: DEFAULT_INVITE_TARGET,
  sendMoreExtra: DEFAULT_SEND_MORE_EXTRA,
};

export async function getPlatformSettings(db: Db = prisma): Promise<PlatformSettingsValues> {
  const row = await db.platformSettings.findUnique({
    where: { id: PLATFORM_SETTINGS_ID },
  });
  if (!row) return { ...FALLBACK };
  return {
    warningThreshold: row.warningThreshold,
    dismissalThreshold: row.dismissalThreshold,
    inviteTarget: row.inviteTarget,
    sendMoreExtra: row.sendMoreExtra,
  };
}

export async function upsertPlatformSettings(
  values: PlatformSettingsValues,
  db: Db = prisma,
): Promise<PlatformSettingsValues> {
  const row = await db.platformSettings.upsert({
    where: { id: PLATFORM_SETTINGS_ID },
    create: { id: PLATFORM_SETTINGS_ID, ...values },
    update: values,
  });
  return {
    warningThreshold: row.warningThreshold,
    dismissalThreshold: row.dismissalThreshold,
    inviteTarget: row.inviteTarget,
    sendMoreExtra: row.sendMoreExtra,
  };
}
