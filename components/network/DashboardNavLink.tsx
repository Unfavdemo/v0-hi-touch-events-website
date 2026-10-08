"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active =
    href === "/admin" || href === "/partner" || href === "/freelancer"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`ht-label block border-2 px-3 py-2.5 transition-colors ${
        active
          ? "border-white/40 text-white"
          : "border-transparent text-white/70 hover:border-white/25 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}
