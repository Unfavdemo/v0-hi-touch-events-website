import type { ReactNode } from "react";

export function VendorHeader({
  title,
  tip,
  children,
}: {
  title: string;
  tip?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header>
      <p className="ht-label text-ht-gold">Vendor</p>
      <h1 className="mt-1 inline-flex flex-wrap items-center gap-2 text-3xl font-bold text-ht-cream">
        {title}
        {tip}
      </h1>
      {children ? <div className="mt-2 max-w-2xl text-sm leading-relaxed text-ht-muted">{children}</div> : null}
    </header>
  );
}
