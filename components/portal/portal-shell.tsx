"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import type { PortalKind } from "@/lib/generated/prisma/client"

export function PortalShell({
  kind,
  contactEmail,
  children,
}: {
  kind: PortalKind
  contactEmail: string
  children: React.ReactNode
}) {
  const home = kind === "VENDOR" ? "/portal/vendor" : "/portal/client"
  const label = kind === "VENDOR" ? "Vendor portal" : "Client portal"

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div>
            <Link href={home} className="font-display text-xs uppercase tracking-[0.35em] text-brand-ink">
              HiTouch {label}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">{contactEmail}</p>
          </div>
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/portal/login" })}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Sign out
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-10">{children}</div>
    </div>
  )
}
