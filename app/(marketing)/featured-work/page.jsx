import { PageHero } from "@/components/page-hero"
import { FeaturedProjectsCarousel } from "@/components/featured-projects-carousel"
import { featuredWorkListingIntro } from "@/lib/site"

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
      <section className="bg-background pb-24 dark:bg-black">
        <div className="container mx-auto page-px">
          <p className="mx-auto max-w-3xl pb-10 text-lg leading-relaxed text-muted-foreground md:pb-14 md:text-xl">
            {featuredWorkListingIntro}
          </p>
        </div>
        <FeaturedProjectsCarousel
          wrapperClassName="mt-2 sm:mt-4"
          viewportClassName="pl-[max(1rem,env(safe-area-inset-left,0px))] sm:pl-[max(1.5rem,env(safe-area-inset-left,0px))]"
        />
      </section>
    </>
  )
}
