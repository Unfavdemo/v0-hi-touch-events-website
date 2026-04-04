import Link from "next/link"
import { PageHero } from "@/components/page-hero"
import { SocialFeedGrid } from "@/components/social-feed-grid"

export const metadata = {
  title: "Social Feed | HiTouch Enterprises Inc.",
  description: "Highlights from the field—builds, shows, and behind-the-scenes moments.",
}

export default function SocialFeedPage() {
  return (
    <>
      <PageHero
        eyebrow="What's new"
        title="Social feed"
        subtitle="A living scrapbook of load-ins, show days, and strike wins."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Social feed", href: "/social-feed" },
        ]}
        variant="cinematic"
      />
      <section className="bg-background pb-24 dark:bg-black page-px">
        <div className="container mx-auto w-full min-w-0 max-w-5xl">
          <SocialFeedGrid />
          <p className="mx-auto mt-14 max-w-2xl text-center text-muted-foreground">
            We are wiring this page to your live social channels. Until then, follow HiTouch on your preferred platform
            for real-time updates from venues and stages worldwide.
          </p>
          <p className="mt-6 text-center">
            <Link
              href="/contact"
              className="font-display inline-flex rounded-full border-2 border-gold px-8 py-3.5 text-[10px] font-normal uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-gold/15"
            >
              Contact us
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
