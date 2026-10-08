import type { ReactNode } from "react";

export function AdminHeader({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <header>
      <p className="ht-label text-ht-gold">Admin</p>
      <h1 className="mt-1 text-3xl font-bold text-ht-cream">{title}</h1>
      {children ? <div className="mt-2 max-w-2xl text-sm text-ht-muted">{children}</div> : null}
    </header>
  );
}
