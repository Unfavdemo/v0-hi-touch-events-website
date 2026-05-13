"use client"

import { ImageWithShimmer } from "@/components/image-with-shimmer"

export function FeaturedCaseStudyHeroImage({ src, alt, priority = true }) {
  return (
    <div className="relative mx-auto w-full max-w-[1400px] bg-[oklch(0.14_0.04_278)]">
      <div className="relative mx-auto h-[clamp(260px,min(52vw,520px),600px)] w-full">
        <ImageWithShimmer
          src={src}
          alt={alt}
          sizes="(max-width: 1400px) 100vw, 1400px"
          className="object-contain object-center"
          priority={priority}
        />
      </div>
    </div>
  )
}
