import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import { getGoogleOAuthEnv } from "@/lib/auth/env"

const googleOAuth = getGoogleOAuthEnv()

function isStaleSessionError(error: Error): boolean {
  const msg = `${error.message} ${String(error.cause ?? "")}`
  return (
    error.name === "JWTSessionError" ||
    msg.includes("no matching decryption secret") ||
    msg.includes("JWTExpired")
  )
}

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  logger: {
    error(error) {
      if (isStaleSessionError(error)) return
      console.error(error)
    },
    warn(code) {
      console.warn(code)
    },
    debug() {},
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token.htouch"
          : "authjs.session-token.htouch",
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Host-authjs.csrf-token.htouch"
          : "authjs.csrf-token.htouch",
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.callback-url.htouch"
          : "authjs.callback-url.htouch",
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [
    Google({
      clientId: googleOAuth.clientId,
      clientSecret: googleOAuth.clientSecret,
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname

      if (path.startsWith("/portal")) {
        if (path === "/portal/login" || path === "/portal/verify") return true
        return Boolean(auth?.portal?.contactId)
      }

      if (!path.startsWith("/admin")) return true
      if (path === "/admin/login" || path.startsWith("/admin/login/")) return true
      return Boolean(auth?.isAdmin)
    },
  },
} satisfies NextAuthConfig
