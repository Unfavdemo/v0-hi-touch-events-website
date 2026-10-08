import Link from "next/link";
import { BrandMark } from "@/components/network/BrandMark";
import { PartnerJoinForm } from "./PartnerJoinForm";

export default function PartnerJoinPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-ht-blue">
        <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-6">
          <BrandMark variant="reversed" />
          <Link href="/network/join" className="ht-label text-white/70 hover:text-white">
            ← Back
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <p className="ht-label text-ht-blue-bright">Partner application</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-ht-cream">
          Tell us about your organization
        </h1>
        <p className="mt-3 text-sm text-ht-muted">
          No payment required. Your application goes straight to the HiTouch Solutions team for
          manual approval.
        </p>
        <div className="mt-10">
          <PartnerJoinForm />
        </div>
      </main>
    </div>
  );
}
