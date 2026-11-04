import Link from "next/link";
import { BrandMark } from "@/components/network/BrandMark";
import {
  VENDOR_AGREEMENT_EFFECTIVE,
  VENDOR_AGREEMENT_SECTIONS,
  VENDOR_AGREEMENT_TITLE,
  VENDOR_AGREEMENT_VERSION,
} from "@/lib/network/vendor-agreement";

export default function VendorAgreementPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-ht-line bg-ht-panel/90 backdrop-blur">
        <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-6">
          <BrandMark />
          <Link href="/network/join/freelancer" className="ht-label text-ht-muted hover:text-ht-brand">
            Join as a vendor
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <p className="ht-label text-ht-brand">Legal</p>
        <h1 className="mt-3 font-display text-4xl tracking-[0.08em] text-ht-brand uppercase">
          {VENDOR_AGREEMENT_TITLE}
        </h1>
        <p className="mt-3 text-sm text-ht-muted">
          Version {VENDOR_AGREEMENT_VERSION} · Effective {VENDOR_AGREEMENT_EFFECTIVE}. Vendors
          must accept this before applying to opportunities or being hired.
        </p>

        <div className="mt-10 space-y-8">
          {VENDOR_AGREEMENT_SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold text-ht-cream">{section.heading}</h2>
              <p className="mt-2 text-base leading-relaxed text-ht-muted">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
