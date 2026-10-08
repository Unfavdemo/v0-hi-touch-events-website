import Link from "next/link";
import { BrandMark } from "@/components/network/BrandMark";
import { prisma } from "@/lib/network/prisma";
import { FreelancerJoinForm } from "./FreelancerJoinForm";

export default async function FreelancerJoinPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const { canceled } = await searchParams;
  const tags = await prisma.categoryTag.findMany({ orderBy: { name: "asc" } });

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
        <p className="ht-label text-ht-gold">Vendor application</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-ht-cream">
          Join the HiTouch Solutions bench
        </h1>
        <p className="mt-3 text-base text-ht-muted">
          Five steps. We&apos;ll ask for a W-9 and the vendor agreement, then membership
          billing starts at checkout — beta testers can enter their promo code there
          for a full waiver.
        </p>

        {canceled ? (
          <p className="mt-6 border-2 border-ht-gold/60 bg-ht-panel px-4 py-3 text-sm text-ht-gold">
            Checkout canceled. Your application is saved — sign in any time to finish
            payment, or resubmit below.
          </p>
        ) : null}

        <div className="mt-10">
          <FreelancerJoinForm tags={tags.map((t) => ({ id: t.id, name: t.name }))} />
        </div>
      </main>
    </div>
  );
}
