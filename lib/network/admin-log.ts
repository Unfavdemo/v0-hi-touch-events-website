import type { Prisma, PrismaClient } from "@/lib/generated/network-prisma/client";

type Db = PrismaClient | Prisma.TransactionClient;

export async function logAdminAction(
  db: Db,
  params: {
    actorId: string;
    action: string;
    targetType: string;
    targetId: string;
    message: string;
  },
): Promise<void> {
  await db.adminAction.create({ data: params });
}
