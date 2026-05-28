/**
 * Normalizes `DATABASE_URL` for node-postgres so Neon / hosted Postgres URLs don't emit
 * the pg v9 `sslmode=require` deprecation warning (treated as verify-full today).
 */
export function normalizePgConnectionString(url: string): string {
  const trimmed = url.trim()
  if (!/^postgres(ql)?:\/\//i.test(trimmed)) {
    return trimmed
  }
  try {
    const parsed = new URL(trimmed)
    const ssl = parsed.searchParams.get("sslmode")
    if (ssl === "require" || ssl === "prefer" || ssl === "verify-ca") {
      parsed.searchParams.set("sslmode", "verify-full")
    }
    return parsed.toString()
  } catch {
    return trimmed
  }
}
