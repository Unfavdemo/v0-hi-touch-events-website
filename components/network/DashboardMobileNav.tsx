"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/network/BrandMark";

export function DashboardMobileNav({
  roleLabel,
  sidebar,
}: {
  roleLabel: string;
  sidebar: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-ht-line bg-ht-blue px-3 py-3 md:hidden">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center border-2 border-white/35 text-white"
          aria-expanded={open}
          aria-controls="network-mobile-nav"
          onClick={() => setOpen(true)}
        >
          <span className="sr-only">Open menu</span>
          <MenuIcon />
        </button>
        <div className="min-w-0 flex-1">
          <BrandMark variant="reversed" sublabel={roleLabel} className="scale-90 origin-left" />
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside
            id="network-mobile-nav"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-ht-blue shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-white/15 p-4">
              <BrandMark variant="reversed" sublabel={roleLabel} />
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center border-2 border-white/35 text-white"
                onClick={() => setOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <CloseIcon />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{sidebar}</div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
