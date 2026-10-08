import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { normalizePgConnectionString } from "@/lib/db-connection"
import { PrismaClient } from "@/lib/generated/network-prisma/client"

const globalForPrisma = globalThis as unknown as {
  networkPrisma: PrismaClient | undefined
}

function resolveNetworkDatabaseUrl(): string {
  const raw =
    process.env.NETWORK_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim()
  if (!raw) {
    throw new Error(
      "NETWORK_DATABASE_URL is required for the member-network module. Set it in `.env` (falls back to DATABASE_URL only in local dev).",
    )
  }
  return normalizePgConnectionString(raw)
}

function createPrismaClient() {
  const pool = new Pool({ connectionString: resolveNetworkDatabaseUrl() })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.networkPrisma) {
    globalForPrisma.networkPrisma = createPrismaClient()
  }
  return globalForPrisma.networkPrisma
}

/** Lazy network Prisma client — build-safe without DATABASE_URL at import time. */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (prop === "then") return undefined
    const client = getPrismaClient()
    const value = Reflect.get(client, prop, client)
    return typeof value === "function" ? value.bind(client) : value
  },
})
