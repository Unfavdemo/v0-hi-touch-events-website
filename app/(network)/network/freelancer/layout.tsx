import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/network/DashboardShell";
import { hasActiveMembership, requireUser } from "@/lib/network/auth";
import { freelancerNav } from "@/lib/network/freelancer-nav";
import { ensurePartnerEventApplicationReminders } from "@/lib/network/partner-event-outreach";

export default async function FreelancerLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("FREELANCER");
  if (!hasActiveMembership(user)) redirect("/network/membership-required");
  await ensurePartnerEventApplicationReminders();

  return (
    <DashboardShell
      user={user}
      navItems={freelancerNav(user.profile?.type)}
      roleLabel="Vendor Portal"
    >
      {children}
    </DashboardShell>
  );
}
