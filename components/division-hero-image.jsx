"use client"

import { ImageWithShimmer } from "@/components/image-with-shimmer"

export function DivisionHeroImage({ src }) {
  return (
    <div className="absolute inset-0 bg-[#1a0a0a]">
      <ImageWithShimmer
        src={src}
        alt=""
        sizes="100vw"
        className="object-cover object-center"
        priority={false}
      />
    </div>
  )
}
