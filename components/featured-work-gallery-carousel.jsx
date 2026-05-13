"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ImageWithShimmer } from "@/components/image-with-shimmer"
import { cn } from "@/lib/utils"

const AUTOPLAY_MS = 5200

/**
 * Single-frame embla carousel showing the cover plus every gallery photo at
 * full hero width. Gentle autoplay; arrows and dot pagination; pauses on hover.
 */
export function FeaturedWorkGalleryCarousel({ coverImage, coverAlt, galleryImages }) {
  const slides = [coverImage, ...(galleryImages ?? [])]
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true, skipSnaps: false })
  const pausedRef = useRef(false)
  const [selected, setSelected] = useState(0)
  const [snaps, setSnaps] = useState([])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index) => emblaApi?.scrollTo(index), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    setSnaps(emblaApi.scrollSnapList())
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap())
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    onSelect()
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi || typeof window === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(() => {
      if (!pausedRef.current) emblaApi.scrollNext()
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [emblaApi])

  return (
    <section
      className="relative border-b border-border bg-[oklch(0.14_0.04_278)]"
      aria-label={`${coverAlt} gallery carousel`}
      onPointerEnter={() => {
        pausedRef.current = true
      }}
      onPointerLeave={() => {
        pausedRef.current = false
      }}
      onFocusCapture={() => {
        pausedRef.current = true
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) pausedRef.current = false
      }}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((src, i) => (
            <div key={src} className="relative min-w-0 shrink-0 grow-0 basis-full">
              <div className="relative mx-auto h-[clamp(280px,min(58vw,560px),640px)] w-full max-w-[1400px]">
                <ImageWithShimmer
                  src={src}
                  alt={`${coverAlt} — photo ${i + 1} of ${slides.length}`}
                  sizes="(max-width: 1400px) 100vw, 1400px"
                  priority={i === 0}
                  className="object-contain object-center"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-3 sm:px-6">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous photo"
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next photo"
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2 sm:bottom-5">
        {snaps.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={`Go to photo ${i + 1}`}
            aria-pressed={selected === i}
            className={cn(
              "h-1.5 rounded-full bg-white/45 transition-all hover:bg-white/80",
              selected === i ? "w-6 bg-white" : "w-2.5",
            )}
          />
        ))}
      </div>
    </section>
  )
}
