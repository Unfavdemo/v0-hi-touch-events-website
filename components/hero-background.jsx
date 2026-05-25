"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const POSTER_SRC = "/images/DSC_0015.jpg"
const VIDEO_MP4 = "/videos/ht-sizzle.mp4"
const VIDEO_WEBM = "/videos/ht-sizzle.webm"

/**
 * Home hero background video — autoplay muted loop with poster fallback.
 * MP4 first for iOS Safari (WebM alone often shows a paused poster + play affordance).
 * Mobile: muted/playsinline on the element before load(); eager load when hero mounts.
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

    v.defaultMuted = true
    v.muted = true
    v.volume = 0
    v.playsInline = true
    v.setAttribute("playsinline", "")
    v.setAttribute("webkit-playsinline", "true")
    v.setAttribute("x-webkit-airplay", "deny")

    const play = () => {
      const el = videoRef.current
      if (!el) return
      try {
        el.muted = true
        el.volume = 0
        const p = el.play()
        void Promise.resolve(p).catch(() => {})
      } catch {
        /* sync throw from play() on some browsers */
      }
    }

    const markReadyAndPlay = () => {
      setReady(true)
      play()
    }

    const beginLoadOrPlay = () => {
      const el = videoRef.current
      if (!el) return
      if (!loadStartedRef.current) {
        loadStartedRef.current = true
        el.preload = "auto"
        el.load()
      } else if (el.readyState >= 2) {
        markReadyAndPlay()
      }
    }

    const onLoaded = () => markReadyAndPlay()

    const onCanPlay = () => {
      if (v.readyState >= 2) markReadyAndPlay()
    }

    const onPlaying = () => setReady(true)

    if (v.readyState >= 2) markReadyAndPlay()

    const onVolumeChange = () => {
      if (!v.muted) v.muted = true
      if (v.volume !== 0) v.volume = 0
    }

    v.addEventListener("loadeddata", onLoaded)
    v.addEventListener("canplay", onCanPlay)
    v.addEventListener("canplaythrough", onCanPlay)
    v.addEventListener("playing", onPlaying)
    v.addEventListener("volumechange", onVolumeChange)

    const onPageShow = (ev) => {
      if (ev.persisted && v.readyState >= 2) play()
    }
    window.addEventListener("pageshow", onPageShow)

    /** Hero is full-viewport on load — start immediately; IO only pauses when scrolled away. */
    beginLoadOrPlay()

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (!videoRef.current) return
        const el = videoRef.current
        if (e.isIntersecting) {
          beginLoadOrPlay()
          if (el.readyState >= 2) play()
        } else if (el.readyState >= 2) {
          el.pause()
        }
      },
      { threshold: [0, 0.01, 0.1, 0.25], rootMargin: "80px 0px 80px 0px" },
    )
    io.observe(root)

    /** iOS often needs a delayed retry after first paint / Low Power Mode edge cases. */
    const retryDelays = [0, 150, 400, 900, 1800]
    const retryTimers = retryDelays.map((ms) =>
      window.setTimeout(() => {
        const el = videoRef.current
        if (!el || el.paused === false) return
        if (el.readyState >= 2) markReadyAndPlay()
        else beginLoadOrPlay()
      }, ms),
    )

    return () => {
      v.removeEventListener("loadeddata", onLoaded)
      v.removeEventListener("canplay", onCanPlay)
      v.removeEventListener("canplaythrough", onCanPlay)
      v.removeEventListener("playing", onPlaying)
      v.removeEventListener("volumechange", onVolumeChange)
      window.removeEventListener("pageshow", onPageShow)
      io.disconnect()
      retryTimers.forEach((id) => window.clearTimeout(id))
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
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        controls={false}
        aria-hidden
        className={cn(
          "absolute inset-0 z-[2] h-full w-full object-cover object-top transition-opacity duration-500 ease-out",
          "sm:object-[center_12%] md:object-[center_22%] lg:object-[center_35%]",
          ready ? "opacity-100" : "opacity-0",
        )}
      >
        <source src={VIDEO_MP4} type="video/mp4" />
        <source src={VIDEO_WEBM} type="video/webm" />
      </video>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3] bg-black/[0.05] dark:bg-black/40"
      />
    </div>
  )
}
