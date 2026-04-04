import { Hero } from "@/components/hero"
import { AboutSection } from "@/components/about-section"
import { Services } from "@/components/services"
import { PartnersStrip } from "@/components/partners-strip"
import { Portfolio } from "@/components/portfolio"
import { GlobalReach } from "@/components/global-reach"
import { LetsTalk } from "@/components/lets-talk"

export const metadata = {
  title: "HiTouch Enterprises Inc. | Event Production & Luxury Transportation",
  description:
    "Hi-Quality, Hi-Impact results—expert event production, luxury transportation, and strategic marketing.",
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <Services />
      <PartnersStrip />
      <Portfolio />
      <GlobalReach />
      <LetsTalk />
    </>
  )
}
