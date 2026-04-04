import Link from "next/link"
import { PageHero, Prose } from "@/components/page-hero"

export const metadata = {
  title: "About Us | HiTouch Enterprises Inc.",
  description:
    "HiTouch Enterprises—event production, luxury transportation, and strategic marketing with high-quality, high-impact results.",
}

export default function AboutUsPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Who we are"
        subtitle="Event production, luxury charter, and strategic marketing for clients who expect excellence."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About us", href: "/about-us" },
        ]}
        variant="cinematic"
      />
      <Prose>
        <p>
          HiTouch Enterprises delivers memorable events, brand awareness, and communications plans that move
          organizations forward. We combine hands-on production experience with strategic marketing discipline—so
          your programs feel cohesive on stage, on screen, and in the market.
        </p>
        <p>
          Our team supports festivals, galas, conferences, and public programs, alongside premier black car service
          through HiTouch Luxury Charter. Whether you need full production, transportation, or integrated marketing,
          we listen first and design solutions around your goals.
        </p>
        <p>
          Based in Philadelphia, we serve the region and beyond with partners and vendors we trust—consistent
          standards, clear communication, and crews who show up ready to deliver.
        </p>
        <p className="!mt-10 flex flex-wrap gap-4">
          <Link
            href="/meet-the-team"
            className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-gold underline-offset-4 hover:underline"
          >
            Meet the team
          </Link>
          <Link
            href="/founders-story"
            className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-gold underline-offset-4 hover:underline"
          >
            Founders&apos; story
          </Link>
          <Link
            href="/contact"
            className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-gold underline-offset-4 hover:underline"
          >
            Contact
          </Link>
        </p>
      </Prose>
    </>
  )
}
