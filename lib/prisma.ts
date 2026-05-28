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

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

/**
 * Lazy Prisma client — importing this module must not require `DATABASE_URL`
 * (Next.js collects API route metadata at build time).
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    const value = Reflect.get(client, prop, client)
    return typeof value === "function" ? value.bind(client) : value
  },
})
