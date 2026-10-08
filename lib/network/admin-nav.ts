import type { NavItem } from "@/components/network/DashboardShell";

export const SUPER_NAV: NavItem[] = [
  { href: "/network/admin", label: "Overview", section: "Today" },
  { href: "/network/admin/schedule", label: "Schedule", section: "Today" },
  { href: "/network/admin/jobs", label: "Opportunities", section: "Opportunities" },
  { href: "/network/admin/jobs/new", label: "Post an Opportunity", section: "Opportunities" },
  { href: "/network/admin/events", label: "Events", section: "Opportunities" },
  { href: "/network/admin/matching", label: "Matching", section: "Opportunities" },
  { href: "/network/admin/applications", label: "Applications", section: "People" },
  { href: "/network/admin/vendors", label: "Vendors", section: "People" },
  { href: "/network/admin/partners", label: "Partners", section: "People" },
  { href: "/network/admin/team", label: "Team", section: "People" },
  { href: "/network/admin/payouts", label: "Payouts", section: "Money" },
  { href: "/network/admin/memberships", label: "Memberships", section: "Money" },
  { href: "/network/admin/reviews", label: "Reviews", section: "Trust" },
  { href: "/network/admin/compliance", label: "Compliance", section: "Trust" },
  { href: "/network/admin/incidents", label: "Incidents", section: "Trust" },
  { href: "/network/admin/documents", label: "Documents", section: "Trust" },
  { href: "/network/admin/categories", label: "Categories", section: "System" },
  { href: "/network/admin/announcements", label: "Announcements", section: "System" },
  { href: "/network/admin/activity", label: "Activity", section: "System" },
  { href: "/network/admin/reports", label: "Reports", section: "System" },
  { href: "/network/admin/settings", label: "Settings", section: "System" },
];

export const EVENT_NAV: NavItem[] = [
  { href: "/network/admin", label: "Overview" },
  { href: "/network/admin/jobs", label: "Your Opportunities" },
  { href: "/network/admin/jobs/new", label: "Post an Opportunity" },
  { href: "/network/admin/events", label: "Events" },
  { href: "/network/admin/schedule", label: "Schedule", section: "Your tools" },
  { href: "/network/admin/payouts", label: "Payouts", section: "Your tools" },
  { href: "/network/admin/reviews", label: "Reviews", section: "Your tools" },
  { href: "/network/admin/incidents", label: "Incidents", section: "Your tools" },
];
