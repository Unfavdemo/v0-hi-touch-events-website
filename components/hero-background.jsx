"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const POSTER_SRC = "/images/DSC_0015.jpg"

/** Home hero background video — autoplay muted loop with image poster fallback. */
export function HeroBackground() {
  const videoRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.volume = 0
    const play = () => {
      const p = v.play()
      if (p && typeof p.catch === "function") p.catch(() => {})
    }
    if (v.readyState >= 2) {
      setReady(true)
      play()
    }
    const onLoaded = () => {
      setReady(true)
      play()
    }
    const onVolumeChange = () => {
      if (!v.muted) v.muted = true
      if (v.volume !== 0) v.volume = 0
    }
    v.addEventListener("loadeddata", onLoaded)
    v.addEventListener("volumechange", onVolumeChange)
    return () => {
      v.removeEventListener("loadeddata", onLoaded)
      v.removeEventListener("volumechange", onVolumeChange)
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-[1] transition-opacity duration-500 ease-out",
          ready ? "opacity-0" : "opacity-100",
        )}
      >
        <div className="team-photo-shimmer absolute inset-0" />
      </div>
      <video
        ref={videoRef}
        poster={POSTER_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        className={cn(
          "absolute inset-0 z-[2] h-full w-full object-cover object-top transition-opacity duration-500 ease-out",
          "sm:object-[center_12%] md:object-[center_22%] lg:object-[center_35%]",
          "[filter:brightness(1.05)_saturate(0.94)_contrast(0.97)] dark:[filter:brightness(0.78)_saturate(1.08)_contrast(1.05)]",
          ready ? "opacity-100" : "opacity-0",
        )}
      >
        <source src="/videos/ht-sizzle.webm" type="video/webm" />
        <source src="/videos/ht-sizzle.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
