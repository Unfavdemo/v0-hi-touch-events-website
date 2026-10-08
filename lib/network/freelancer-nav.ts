import type { NavItem } from "@/components/network/DashboardShell";
import type { ProfileType } from "@/lib/generated/network-prisma/client";

const BASE_NAV: NavItem[] = [
  { href: "/network/freelancer", label: "Overview", section: "Today" },
  { href: "/network/freelancer/calendar", label: "Calendar", section: "Today" },
  { href: "/network/freelancer/invites", label: "Invites", section: "Work" },
  { href: "/network/freelancer/jobs", label: "Job Board", section: "Work" },
  { href: "/network/freelancer/bids", label: "My Applications", section: "Work" },
  { href: "/network/freelancer/messages", label: "Messages", section: "Work" },
  { href: "/network/freelancer/jobs/submit", label: "Share an Opportunity", section: "Work" },
  { href: "/network/freelancer/profile", label: "Profile", section: "Reputation" },
  { href: "/network/freelancer/reviews", label: "Reviews", section: "Reputation" },
  { href: "/network/freelancer/documents", label: "Documents", section: "Business" },
  { href: "/network/freelancer/payments", label: "Payments", section: "Business" },
  { href: "/network/freelancer/reports", label: "Reports", section: "Business" },
  { href: "/network/freelancer/membership", label: "Membership", section: "Business" },
  { href: "/network/freelancer/clients", label: "Clients", section: "Business" },
  { href: "/network/freelancer/settings", label: "Settings", section: "Account" },
  { href: "/network/freelancer/support", label: "Support", section: "Account" },
];

export function freelancerNav(profileType?: ProfileType | null): NavItem[] {
  if (profileType !== "BUSINESS") return BASE_NAV;
  const crew: NavItem = {
    href: "/network/freelancer/crew",
    label: "Crew",
    section: "Account",
  };
  const settingsIdx = BASE_NAV.findIndex((n) => n.href === "/freelancer/settings");
  const nav = [...BASE_NAV];
  nav.splice(settingsIdx, 0, crew);
  return nav;
}
