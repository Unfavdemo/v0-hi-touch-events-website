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
      <header className="bg-ht-blue">
        <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-6">
          <BrandMark variant="reversed" />
          <Link href="/network/join/freelancer" className="ht-label text-white/70 hover:text-white">
            Join as a vendor
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <p className="ht-label text-ht-gold">Legal</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-ht-cream">
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
