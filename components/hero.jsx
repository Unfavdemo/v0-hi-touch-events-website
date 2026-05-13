import { HeroBackground } from "@/components/hero-background"
import { HeroInner } from "@/components/hero-inner"

export function Hero() {
  return (
    <section className="relative min-h-svh w-full min-w-0 overflow-hidden pt-32 sm:pt-36 md:pt-44 lg:pt-48">
      <div className="absolute inset-0 bg-background dark:bg-black" />
      <HeroBackground />
      <HeroInner />
    </section>
  )
}
