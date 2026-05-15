import { PageHero } from "@/components/page-hero"
import { FeaturedProjectsCarousel } from "@/components/featured-projects-carousel"
import { contact } from "@/lib/site"
import { buildPageMetadata } from "@/lib/seo-metadata"

export const metadata = {
  ...buildPageMetadata({
    title: "Featured Work | HiTouch Enterprises Inc.",
    description:
      "Signature productions from HiTouch—Juneteenth, Urban Affairs Coalition, convenings, galas, and civic milestones across the region.",
    path: "/featured-work",
  }),
}

export default function FeaturedWorkPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Featured work"
        subtitle="From concept to execution—signature productions where creative ambition met operational rigor."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Featured work", href: "/featured-work" },
        ]}
        variant="cinematic"
      />
      <section className="bg-background page-section-y dark:bg-black">
        <div className="container mx-auto flex flex-col items-center gap-8 page-px">
          <a
            href={contact.youtubeChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display inline-flex rounded-full border-2 border-brand px-10 py-3.5 text-[10px] font-normal uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-brand/15"
          >
            See our work on YouTube
          </a>
        </div>
        <FeaturedProjectsCarousel layout="grid" wrapperClassName="mt-2 sm:mt-4" />
      </section>
    </>
  )
}
