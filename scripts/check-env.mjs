#!/usr/bin/env node
import "dotenv/config"

const checks = [
  { key: "DATABASE_URL", required: true },
  { key: "AUTH_SECRET", required: true },
  {
    key: "AUTH_GOOGLE_ID",
    required: process.env.NODE_ENV === "production",
    alt: "GOOGLE_CLIENT_ID",
  },
  {
    key: "AUTH_GOOGLE_SECRET",
    required: process.env.NODE_ENV === "production",
    alt: "GOOGLE_CLIENT_SECRET",
  },
]

let failed = 0
for (const c of checks) {
  const ok = Boolean(process.env[c.key]?.trim() || (c.alt && process.env[c.alt]?.trim()))
  const status = ok ? "ok" : c.required ? "MISSING" : "optional"
  console.log(`${c.key}: ${status}`)
  if (!ok && c.required) failed++
}

process.exit(failed > 0 ? 1 : 0)
