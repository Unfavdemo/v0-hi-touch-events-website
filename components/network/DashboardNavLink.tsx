"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const roots = new Set([
    "/network/admin",
    "/network/freelancer",
    "/network/partner",
    "/admin",
    "/freelancer",
    "/partner",
  ]);
  const active = roots.has(href)
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`ht-label block rounded-md px-3 py-2.5 transition-colors ${
        active
          ? "bg-ht-brand/15 text-ht-brand"
          : "text-ht-muted hover:bg-ht-panel-2 hover:text-ht-cream"
      }`}
    >
      {label}
    </Link>
  );
}
