/**
 * Promote allowlisted admin emails to SUPERADMIN.
 * Usage: npx tsx scripts/promote-superadmin.ts [email@example.com]
 */
import "dotenv/config"
import { AdminRole } from "../lib/generated/prisma/client"
import { prisma } from "../lib/prisma"

function parseEmailList(raw: string | undefined): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

const explicit = process.argv.slice(2).map((e) => e.toLowerCase())
const fromEnv = [
  ...parseEmailList(process.env.ADMIN_BOOTSTRAP_EMAILS),
  ...parseEmailList(process.env.ADMIN_ALLOWLIST_EMAILS),
  ...parseEmailList(process.env.ADMIN_TEST_EMAILS),
]
const emails = [...new Set([...explicit, ...fromEnv])]

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.")
    process.exit(1)
  }
  if (emails.length === 0) {
    console.error("No emails. Pass an argument or set ADMIN_BOOTSTRAP_EMAILS in .env")
    process.exit(1)
  }

  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      console.log(`${email}: no User row yet — sign in once at /admin/login first`)
      continue
    }
    const admin = await prisma.adminUser.upsert({
      where: { userId: user.id },
      create: { userId: user.id, role: AdminRole.SUPERADMIN },
      update: { role: AdminRole.SUPERADMIN },
    })
    console.log(`${email}: SUPERADMIN (${admin.id})`)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
