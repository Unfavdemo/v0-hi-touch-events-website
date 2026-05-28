import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"
import { canAccessAdminEmail } from "@/lib/auth/allowlist"
import { validateDevLogin } from "@/lib/auth/dev-login"
import { isDevPasswordLoginEnabled } from "@/lib/auth/env"
import { createEmailProvider } from "@/lib/auth/email-provider"
import { normalizeAdminRole } from "@/lib/auth/roles"
import { AdminRole } from "@/lib/generated/prisma/client"
import type { PortalSession } from "@/types/next-auth"

function devCredentialsProvider() {
  return Credentials({
    id: "dev-credentials",
    name: "Dev",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (process.env.NODE_ENV !== "development") return null
      const result = await validateDevLogin(
        String(credentials?.email ?? ""),
        String(credentials?.password ?? ""),
      )
      if (!result.ok) return null
      return { id: result.userId, email: result.email, name: result.name }
    },
  })
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    createEmailProvider(),
    ...(process.env.NODE_ENV === "development" ? [devCredentialsProvider()] : []),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      const email = user.email?.toLowerCase()
      if (!email) return false

      const provider = account?.provider

      if (provider === "email") {
        if (canAccessAdminEmail(email)) return false
        const contact = await prisma.contact.findUnique({ where: { email } })
        if (!contact) return false
        const portal = await prisma.portalAccount.findFirst({
          where: { contactId: contact.id, enabled: true },
        })
        return Boolean(portal)
      }

      if (provider === "google" || provider === "dev-credentials") {
        if (!canAccessAdminEmail(email)) return false
        if (provider === "dev-credentials") return isDevPasswordLoginEnabled()
        return true
      }

      return false
    },
    async jwt({ token, user, account, trigger }) {
      try {
        if (user?.id && account) {
          const email = user.email?.toLowerCase() ?? ""

          if (account.provider === "email") {
            const contact = await prisma.contact.findUnique({ where: { email } })
            const portal = contact
              ? await prisma.portalAccount.findFirst({
                  where: { contactId: contact.id, enabled: true },
                })
              : null
            if (portal) {
              await prisma.portalAccount.update({
                where: { id: portal.id },
                data: { lastLoginAt: new Date() },
              })
              token.isAdmin = false
              token.adminRole = undefined
              token.portal = {
                kind: portal.kind as PortalSession["kind"],
                contactId: portal.contactId,
              }
            }
          } else if (canAccessAdminEmail(email)) {
            const admin = await prisma.adminUser.upsert({
              where: { userId: user.id },
              create: { userId: user.id, role: AdminRole.COORDINATOR as AdminRole },
              update: {},
            })
            token.isAdmin = true
            token.adminRole = normalizeAdminRole(admin.role)
            token.portal = undefined
          }
        } else if (token.sub) {
          if (token.portal?.contactId) {
            const portal = await prisma.portalAccount.findFirst({
              where: {
                contactId: token.portal.contactId,
                enabled: true,
                userId: token.sub,
              },
            })
            if (!portal) {
              token.portal = undefined
              token.isAdmin = false
            } else {
              token.isAdmin = false
              token.portal = {
                kind: portal.kind as PortalSession["kind"],
                contactId: portal.contactId,
              }
            }
          } else {
            const admin = await prisma.adminUser.findUnique({ where: { userId: token.sub } })
            const dbUser = await prisma.user.findUnique({ where: { id: token.sub } })
            const email = dbUser?.email?.toLowerCase() ?? ""
            const isAdmin = Boolean(admin) && Boolean(email) && canAccessAdminEmail(email)
            token.isAdmin = isAdmin
            token.adminRole = isAdmin && admin ? normalizeAdminRole(admin.role) : undefined
            if (!isAdmin) token.portal = undefined
          }
        }

        if (trigger === "update" && token.sub && token.isAdmin) {
          const admin = await prisma.adminUser.findUnique({ where: { userId: token.sub } })
          if (admin) token.adminRole = normalizeAdminRole(admin.role)
        }
      } catch {
        token.isAdmin = false
        token.portal = undefined
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ""
        session.isAdmin = Boolean(token.isAdmin)
        session.adminRole = token.adminRole
        session.portal = token.portal
      }
      return session
    },
  },
})
