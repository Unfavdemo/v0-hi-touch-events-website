import type { ReactNode } from "react";
import { BrandMark } from "@/components/network/BrandMark";

/** Full-page branded message used for not-found and error states. */
export function StatusScreen({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ht-black px-6 py-16">
      <BrandMark className="items-center justify-center" />
      <div className="mt-10 w-full max-w-lg border-2 border-ht-line bg-ht-panel p-8 text-center">
        <p className="ht-label text-ht-gold">{eyebrow}</p>
        <h1 className="mt-3 text-2xl font-bold text-ht-cream">{title}</h1>
        <div className="mt-3 text-sm leading-relaxed text-ht-muted">{children}</div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>
      </div>
    </div>
  );
}

export const primaryAction =
  "ht-label border-2 border-ht-blue bg-ht-blue px-4 py-2 font-semibold text-white hover:bg-ht-gold-bright";
export const secondaryAction =
  "ht-label border-2 border-ht-line px-4 py-2 text-ht-muted hover:border-ht-blue hover:text-ht-blue";
