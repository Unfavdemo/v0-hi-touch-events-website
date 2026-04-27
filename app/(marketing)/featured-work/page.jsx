import { PageHero } from "@/components/page-hero"
import { FeaturedProjectsCarousel } from "@/components/featured-projects-carousel"
import { contact } from "@/lib/site"

export const metadata = {
  title: "Featured Work | HiTouch Enterprises Inc.",
  description:
    "Signature productions from HiTouch—Juneteenth, Urban Affairs Coalition, convenings, galas, and civic milestones across the region.",
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
        <FeaturedProjectsCarousel
          wrapperClassName="mt-2 sm:mt-4"
          viewportClassName="pl-[max(1rem,env(safe-area-inset-left,0px))] sm:pl-[max(1.5rem,env(safe-area-inset-left,0px))]"
        />
      </section>
    </>
  )
}
