"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { can, roleLabel, type Permission } from "@/lib/auth/permissions"

export type AdminShellRole = "COORDINATOR" | "SUPERADMIN"

const NAV_GROUPS: {
  heading: string
  items: { href: string; label: string; permission: Permission | null }[]
}[] = [
  {
    heading: "Home",
    items: [{ href: "/admin", label: "Dashboard", permission: null }],
  },
  {
    heading: "Intake",
    items: [{ href: "/admin/pending", label: "Pending", permission: "pending.read" }],
  },
  {
    heading: "People & org",
    items: [
      { href: "/admin/crm/contacts", label: "Contacts", permission: "contacts.read" },
      { href: "/admin/crm/companies", label: "Companies", permission: "companies.read" },
      { href: "/admin/clients", label: "HiTouch clients", permission: "clients.read" },
    ],
  },
  {
    heading: "Pipeline",
    items: [
      { href: "/admin/deals", label: "Deals", permission: "deals.read" },
      { href: "/admin/tasks", label: "Tasks", permission: "tasks.read" },
      { href: "/admin/lists", label: "Lists", permission: "lists.read" },
    ],
  },
  {
    heading: "Events",
    items: [{ href: "/admin/projects", label: "Projects", permission: "projects.read" }],
  },
  {
    heading: "Site & team",
    items: [
      { href: "/admin/case-studies", label: "Case studies", permission: "case_studies.read" },
      { href: "/admin/notifications", label: "Notifications", permission: "notifications.read" },
      { href: "/admin/audit", label: "Audit log", permission: "audit.read" },
      { href: "/admin/settings/team", label: "Team", permission: "admin.users.manage" },
    ],
  },
]

export function AdminShell({
  userEmail,
  adminRole,
  children,
}: {
  userEmail?: string | null
  adminRole: AdminShellRole
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <aside className="border-b border-border bg-muted/20 px-4 py-6 md:w-56 md shrink-0 md:border-b-0 md:border-r">
        <Link href="/admin" className="font-display text-xs uppercase tracking-[0.35em] text-brand-ink">
          HiTouch Admin
        </Link>
        {userEmail ? <p className="mt-2 truncate text-xs text-muted-foreground">{userEmail}</p> : null}
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-brand-ink">{roleLabel(adminRole)}</p>
        <nav className="mt-6 space-y-6" aria-label="Main">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter((item) => !item.permission || can(adminRole, item.permission))
            if (visibleItems.length === 0) return null
            return (
              <div key={group.heading}>
                <p className="font-display text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{group.heading}</p>
                <ul className="mt-2 flex flex-row flex-wrap gap-1 md:flex-col md:gap-0.5">
                  {visibleItems.map((item) => {
                    const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm transition-colors",
                            active ? "bg-brand/15 font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>
        <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
          <Link
            href="/"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Public site
          </Link>
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/admin/login" })}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </div>
    </div>
  )
}
