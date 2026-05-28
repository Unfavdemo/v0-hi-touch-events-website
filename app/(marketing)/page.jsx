import { Hero } from "@/components/hero"
import { AboutSection } from "@/components/about-section"
import { PartnersStrip } from "@/components/partners-strip"
import { Portfolio } from "@/components/portfolio"
import { LetsTalk } from "@/components/lets-talk"
import { buildPageMetadata } from "@/lib/seo-metadata"
import { getRecentCaseStudies } from "@/lib/case-studies"

export const metadata = {
  ...buildPageMetadata({
    title: "HiTouch Enterprises Inc. | Event Production & Luxury Transportation",
    description:
      "Hi-Quality, Hi-Impact results—event production, luxury charter, and strategic marketing. YouTube: @hitouchinc. Based in Philadelphia, PA—serving near and far.",
    path: "/",
  }),
}

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const featured = await getRecentCaseStudies(10)

  return (
    <>
      <Hero />
      <AboutSection />
      <PartnersStrip />
      <Portfolio projects={featured} />
      <LetsTalk />
    </>
  )
}
