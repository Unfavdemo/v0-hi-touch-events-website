import Link from "next/link";
import { BrandMark } from "@/components/network/BrandMark";

export default async function JoinSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ offline?: string; session_id?: string }>;
}) {
  const { offline } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <BrandMark className="items-center justify-center" />
      <div className="mt-10 max-w-lg border-2 border-ht-gold bg-ht-panel p-8">
        <p className="ht-label text-ht-gold">Application received</p>
        <h1 className="mt-3 text-2xl font-bold text-ht-cream">
          You&apos;re in the review queue
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ht-muted">
          {offline
            ? "Your membership tier is active (offline dev mode — no payment collected)."
            : "Your membership payment is set up."}{" "}
          The HiTouch Solutions team manually reviews every application. You&apos;ll get a
          notification as soon as a decision is made.
        </p>
        <Link
          href="/network/pending"
          className="ht-label mt-8 inline-block border-2 border-ht-gold bg-ht-gold px-6 py-3 font-semibold text-white hover:bg-ht-gold-bright"
        >
          Check application status
        </Link>
      </div>
    </div>
  );
}
