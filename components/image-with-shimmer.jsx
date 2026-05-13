"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * Same loading pattern as team headshots: neutral shimmer, then fade-in when ready.
 * Default: lazy, low fetch priority (use `priority` only for true LCP heroes).
 * Pass `unoptimized` for local headshots so the browser uses pixels as stored (no `/_next/image` EXIF quirks).
 */
export function ImageWithShimmer({
  src,
  alt = "",
  sizes,
  className,
  priority = false,
  fetchPriority: fetchPriorityProp,
  unoptimized = false,
}) {
  const [loaded, setLoaded] = useState(false)
  const resolvedSrc = src
  const fetchPriority = fetchPriorityProp ?? (priority ? "high" : "low")

  return (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-[1] transition-opacity duration-500 ease-out",
          loaded ? "opacity-0" : "opacity-100",
        )}
      >
        <div className="team-photo-shimmer absolute inset-0" />
      </div>
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={fetchPriority}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "z-[2] transition-opacity duration-500 ease-out [image-orientation:none]",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        sizes={sizes}
        unoptimized={unoptimized}
      />
    </>
  )
}
