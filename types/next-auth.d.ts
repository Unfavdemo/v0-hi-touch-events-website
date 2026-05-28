import type { DefaultSession } from "next-auth"
import type { AdminRoleName } from "@/lib/auth/roles"

export type PortalSession = {
  kind: "CLIENT" | "VENDOR"
  contactId: string
}

declare module "next-auth" {
  interface Session {
    isAdmin?: boolean
    adminRole?: AdminRoleName
    portal?: PortalSession
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    isAdmin?: boolean
    adminRole?: AdminRoleName
    portal?: PortalSession
  }
}
