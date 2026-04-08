import Image from "next/image"
import { HeroInner } from "@/components/hero-inner"

export function Hero() {
  return (
    <section className="relative min-h-svh w-full min-w-0 overflow-hidden pt-32 sm:pt-36 md:pt-44 lg:pt-48">
      <div className="absolute inset-0 bg-background dark:bg-black" />
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/images/DSC_0015.jpg"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-[center_35%]"
        />
      </div>
      <HeroInner />
    </section>
  )
}
