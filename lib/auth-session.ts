import { cookies } from "next/headers"
import { auth } from "@/auth"

/** Default Auth.js cookie names (before we switched to custom names in auth.config). */
const LEGACY_AUTH_COOKIE =
  /^(?:__Secure-|__Host-)?authjs\.(?:session-token|csrf-token|callback-url|pkce\.code_verifier)$/

/**
 * Drops cookies from an old `AUTH_SECRET` or default Auth.js names so decrypt is not retried every request.
 */
async function clearLegacyAuthCookies() {
  try {
    const jar = await cookies()
    for (const { name } of jar.getAll()) {
      if (LEGACY_AUTH_COOKIE.test(name)) {
        jar.delete(name)
      }
    }
  } catch {
    /* cookies() unavailable outside request (e.g. static generation) */
  }
}

/**
 * `auth()` throws when the session JWT was encrypted with a different `AUTH_SECRET`.
 * Returns null instead of crashing; clears legacy cookies when decrypt fails.
 */
export async function getSessionSafe() {
  try {
    return await auth()
  } catch {
    await clearLegacyAuthCookies()
    return null
  }
}
