import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { normalizePgConnectionString } from "@/lib/db-connection"
import { PrismaClient } from "@/lib/generated/prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL?.trim()
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to use Prisma. Set it in `.env.local` or your host environment.")
  }
  const pool = new Pool({ connectionString: normalizePgConnectionString(connectionString) })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
