import Link from "next/link";
import { BrandMark } from "@/components/network/BrandMark";

export default function UnavailablePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <BrandMark className="items-center justify-center" size="lg" />
        <div className="mt-8 border border-ht-line bg-ht-panel p-6 shadow-sm">
          <h1 className="font-display text-2xl tracking-[0.12em] text-ht-brand uppercase">
            Not available here
          </h1>
          <p className="mt-3 text-base text-ht-muted">
            HiTouch Events — Staffing is for HiTouch staff and vendors only. Partner
            organization accounts are not used on this site.
          </p>
          <Link
            href="/network/login"
            className="ht-label mt-6 inline-block text-ht-brand hover:text-ht-gold-bright"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
