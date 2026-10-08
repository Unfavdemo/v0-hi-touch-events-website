import type { ReactNode } from "react";
import { DashboardShell } from "@/components/network/DashboardShell";
import { requirePartnerOrg } from "@/lib/network/partner-org";
import { ensureUpcomingEventReminders } from "@/lib/network/notifications";
import { ensurePartnerEventApplicationReminders } from "@/lib/network/partner-event-outreach";

const NAV = [
  { href: "/partner", label: "Your Opportunities" },
  { href: "/partner/events", label: "Events" },
  { href: "/partner/calendar", label: "Calendar" },
  { href: "/partner/jobs/new", label: "Post an Opportunity" },
  { href: "/partner/roster", label: "My Vendors" },
  { href: "/partner/vendors", label: "Find Vendors" },
  { href: "/partner/reviews", label: "Reviews" },
  { href: "/partner/incidents", label: "Incidents" },
  { href: "/partner/messages", label: "Messages" },
  { href: "/partner/documents", label: "Documents" },
  { href: "/partner/payments", label: "Payments" },
  { href: "/partner/reports", label: "Reports" },
  { href: "/partner/organization", label: "Organization" },
];

export default async function PartnerLayout({ children }: { children: ReactNode }) {
  const { user, ownerId } = await requirePartnerOrg();
  await ensureUpcomingEventReminders(ownerId);
  await ensurePartnerEventApplicationReminders();
  return (
    <DashboardShell user={user} navItems={NAV} roleLabel="Partner Portal">
      {children}
    </DashboardShell>
  );
}
