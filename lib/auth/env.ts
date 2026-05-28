/** Resolved Google OAuth env (supports legacy `GOOGLE_CLIENT_*` names). */
export function getGoogleOAuthEnv() {
  const clientId =
    process.env.AUTH_GOOGLE_ID?.trim() || process.env.GOOGLE_CLIENT_ID?.trim() || ""
  const clientSecret =
    process.env.AUTH_GOOGLE_SECRET?.trim() || process.env.GOOGLE_CLIENT_SECRET?.trim() || ""
  return { clientId, clientSecret, configured: Boolean(clientId && clientSecret) }
}

export function isAuthSecretConfigured() {
  return Boolean(process.env.AUTH_SECRET?.trim())
}

export function isDevPasswordLoginEnabled() {
  return process.env.NODE_ENV === "development" && Boolean(process.env.AUTH_DEV_PASSWORD?.trim())
}
