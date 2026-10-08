import type { ReactNode } from "react";
import { BrandMark } from "@/components/network/BrandMark";
import { DashboardNavLink } from "@/components/network/DashboardNavLink";
import { HelpDialog } from "@/components/network/help/HelpDialog";
import { HowToUseButton } from "@/components/network/help/HowToUse";
import { NotificationList } from "@/components/network/NotificationList";
import { signOut } from "@/lib/network/auth-actions";
import type { SessionUser } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";
import { getPlatformSettings } from "@/lib/network/platform-settings";

export interface NavItem {
  href: string;
  label: string;
  section?: string;
}

interface DashboardShellProps {
  user: SessionUser;
  navItems: NavItem[];
  roleLabel: string;
  children: ReactNode;
}

export async function DashboardShell({
  user,
  navItems,
  roleLabel,
  children,
}: DashboardShellProps) {
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const { inviteTarget } = await getPlatformSettings();

  return (
    <div className="flex min-h-screen bg-ht-black">
      <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col bg-ht-blue">
        <div className="border-b border-white/15 p-5">
          <BrandMark variant="reversed" sublabel={roleLabel} />
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto p-3" aria-label="Dashboard">
          {groupNav(navItems).map((group) => (
            <div key={group.section ?? group.items[0]?.href} className="mb-3 last:mb-0">
              {group.section ? (
                <p className="px-3 pb-1 pt-2 text-[0.65rem] font-semibold tracking-[0.18em] text-white/40 uppercase">
                  {group.section}
                </p>
              ) : null}
              {group.items.map((item) => (
                <DashboardNavLink key={item.href} href={item.href} label={item.label} />
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/15 px-3 py-4">
          <p className="truncate px-1 text-base font-semibold text-white">
            {user.profile?.name ?? user.email}
          </p>
          <p className="mt-0.5 truncate px-1 text-xs text-white/60">{user.email}</p>
          <div className="mt-4 space-y-2">
            <HelpDialog
              title="Notifications"
              icon={<BellIcon />}
              label={
                <>
                  <span className="flex-1 text-left">Notifications</span>
                  {unreadCount > 0 ? (
                    <span className="bg-white px-1.5 py-1 text-[0.7rem] leading-none font-bold text-ht-blue">
                      {unreadCount} new
                    </span>
                  ) : null}
                </>
              }
              triggerClassName="justify-between border-white/40 text-white hover:border-white hover:bg-white/10"
            >
              <NotificationList notifications={notifications} />
            </HelpDialog>
            <HowToUseButton
              role={user.role}
              adminScope={user.adminScope}
              inviteTarget={inviteTarget}
            />
            <form action={signOut}>
              <button
                type="submit"
                className="ht-label w-full border-2 border-white/25 px-3 py-2.5 text-white/70 transition-colors hover:border-white hover:text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}

function groupNav(items: NavItem[]): { section?: string; items: NavItem[] }[] {
  const groups: { section?: string; items: NavItem[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.section === item.section) last.items.push(item);
    else groups.push({ section: item.section, items: [item] });
  }
  return groups;
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
