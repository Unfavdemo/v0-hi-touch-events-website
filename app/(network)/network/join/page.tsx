import Link from "next/link";
import { BrandMark } from "@/components/network/BrandMark";

export default function JoinChooserPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-ht-blue">
        <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-6">
          <BrandMark variant="reversed" />
          <Link href="/network/login" className="ht-label text-white/70 hover:text-white">
            Already a member? Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <p className="ht-label text-ht-blue-bright">Request to join</p>
        <h1 className="mt-3 font-serif text-5xl tracking-tight text-ht-cream">
          Which side of the network are you on?
        </h1>
        <p className="mt-4 max-w-2xl text-ht-muted">
          Every application is reviewed by the HiTouch Solutions team before access is granted.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Link
            href="/network/join/freelancer"
            className="group border-2 border-ht-line bg-ht-panel p-8 transition-colors hover:border-ht-gold"
          >
            <p className="ht-label text-ht-gold">Freelancer / Small Business</p>
            <h2 className="mt-3 text-2xl font-semibold text-ht-cream">
              I want work from partner organizations
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ht-muted">
              DJs, caterers, photographers, AV techs, security, waste management, and
              more. Pick your skills, subscribe, and get invited to verified opportunities that fit.
            </p>
            <span className="ht-label mt-6 inline-block text-ht-gold group-hover:text-ht-gold-bright">
              Apply as a vendor →
            </span>
          </Link>

          <Link
            href="/network/join/partner"
            className="group border-2 border-ht-line bg-ht-panel p-8 transition-colors hover:border-ht-blue-bright"
          >
            <p className="ht-label text-ht-blue-bright">Partner Organization</p>
            <h2 className="mt-3 text-2xl font-semibold text-ht-cream">
              I need vetted HiTouch Solutions talent
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ht-muted">
              Drop in your opportunities and we invite the best available vetted vendors, then rank
              who applies so you can pick with confidence. No membership fee.
            </p>
            <span className="ht-label mt-6 inline-block text-ht-blue-bright group-hover:text-ht-cream">
              Apply as a partner →
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
