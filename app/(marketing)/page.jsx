import { Hero } from "@/components/hero"
import { AboutSection } from "@/components/about-section"
import { PartnersStrip } from "@/components/partners-strip"
import { Portfolio } from "@/components/portfolio"
import { LetsTalk } from "@/components/lets-talk"

export const metadata = {
  title: "HiTouch Enterprises Inc. | Event Production & Luxury Transportation",
  description:
    "Hi-Quality, Hi-Impact results—event production, luxury charter, and strategic marketing. YouTube: @hitouchinc. Based in Philadelphia, PA—serving near and far.",
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <PartnersStrip />
      <Portfolio />
      <LetsTalk />
    </>
  )
}
