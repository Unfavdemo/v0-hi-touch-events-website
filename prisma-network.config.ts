import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma-network/schema.prisma",
  migrations: {
    path: "prisma-network/migrations",
  },
  datasource: {
    url: process.env["NETWORK_DATABASE_URL"] ?? process.env["DATABASE_URL"],
  },
})
