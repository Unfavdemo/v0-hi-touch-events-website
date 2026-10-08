import "dotenv/config"
import { prisma } from "../lib/network/prisma"

async function main() {
  const n = await prisma.user.count()
  console.log("network users", n)
  const admin = await prisma.user.findUnique({ where: { email: "admin@hitouch.io" } })
  console.log("admin exists", Boolean(admin), admin?.role)
  const vendor = await prisma.user.findUnique({ where: { email: "marcus.dj@example.com" } })
  console.log("vendor exists", Boolean(vendor), vendor?.role)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // no $disconnect on proxy
    process.exit(0)
  })
