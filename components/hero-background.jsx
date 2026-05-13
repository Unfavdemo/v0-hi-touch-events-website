"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const POSTER_SRC = "/images/DSC_0015.jpg"

/**
 * Home hero background video — autoplay muted loop with poster fallback.
 * Mobile Safari needs `defaultMuted` on the media element (set in effect),
 * explicit `playsinline` attrs, and retried `play()` after `canplay`; we still
 * defer `load()` until the hero intersects the viewport so we do not compete with LCP images.
 */
export function HeroBackground() {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const loadStartedRef = useRef(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    const root = containerRef.current
    if (!v || !root) return

    /** iOS / WebKit autoplay policy: muted + playsinline must be set before play(). */
    v.defaultMuted = true
    v.muted = true
    v.volume = 0
    v.playsInline = true
    v.setAttribute("playsinline", "")
    v.setAttribute("webkit-playsinline", "true")

    const play = () => {
      try {
        v.muted = true
        v.volume = 0
        const p = v.play()
        /** `play()` can reject with no message (policy / interrupt); must not surface as unhandledRejection. */
        void Promise.resolve(p).catch(() => {})
      } catch {
        /* sync throw from play() on some browsers */
      }
    }

    const onLoaded = () => {
      setReady(true)
      play()
    }

    /** Mobile often fires `canplay` when `loadeddata` is flaky — retry play. */
    const onCanPlay = () => {
      if (v.readyState >= 2) {
        setReady(true)
        play()
      }
    }

    if (v.readyState >= 2) {
      setReady(true)
      play()
    }

    const onVolumeChange = () => {
      if (!v.muted) v.muted = true
      if (v.volume !== 0) v.volume = 0
    }

    v.addEventListener("loadeddata", onLoaded)
    v.addEventListener("canplay", onCanPlay)
    v.addEventListener("volumechange", onVolumeChange)

    /** Resume after bfcache restore (common on iOS). */
    const onPageShow = (ev) => {
      if (ev.persisted && v.readyState >= 2) play()
    }
    window.addEventListener("pageshow", onPageShow)

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (!videoRef.current) return
        const el = videoRef.current
        /** Any visible intersection starts load — avoids ratio thresholds that miss on mobile. */
        if (e.isIntersecting) {
          if (!loadStartedRef.current) {
            loadStartedRef.current = true
            el.preload = "auto"
            el.load()
          } else if (el.readyState >= 2) {
            play()
          }
        } else if (el.readyState >= 2) {
          el.pause()
        }
      },
      { threshold: [0, 0.01, 0.1, 0.25] },
    )
    io.observe(root)

    return () => {
      v.removeEventListener("loadeddata", onLoaded)
      v.removeEventListener("canplay", onCanPlay)
      v.removeEventListener("volumechange", onVolumeChange)
      window.removeEventListener("pageshow", onPageShow)
      io.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden">
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
        preload="none"
        aria-hidden
        className={cn(
          "absolute inset-0 z-[2] h-full w-full object-cover object-top transition-opacity duration-500 ease-out",
          "sm:object-[center_12%] md:object-[center_22%] lg:object-[center_35%]",
          ready ? "opacity-100" : "opacity-0",
        )}
      >
        <source src="/videos/ht-sizzle.webm" type="video/webm" />
        <source src="/videos/ht-sizzle.mp4" type="video/mp4" />
      </video>
      {/* Tint replaces CSS `filter` on the video element (much cheaper while playing). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3] bg-black/[0.05] dark:bg-black/40"
      />
    </div>
  )
}
