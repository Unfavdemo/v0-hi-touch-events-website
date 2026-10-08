import type { ReactNode } from "react";
import { DashboardShell } from "@/components/network/DashboardShell";
import { EVENT_NAV, SUPER_NAV } from "@/lib/network/admin-nav";
import { isSuperAdmin } from "@/lib/network/admin-rbac";
import { requireUser } from "@/lib/network/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("ADMIN");
  const superAdmin = isSuperAdmin(user);
  return (
    <DashboardShell
      user={user}
      navItems={superAdmin ? SUPER_NAV : EVENT_NAV}
      roleLabel={superAdmin ? "Admin Console" : "Opportunity Admin"}
    >
      {children}
    </DashboardShell>
  );
}
