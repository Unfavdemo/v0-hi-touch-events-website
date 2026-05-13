import Image from "next/image"
import Link from "next/link"

/** No full-bleed gradient — photos stay clear; text uses shadow only (same for every slide). */
const titleShadow =
  "[text-shadow:0_0_2px_rgba(0,0,0,1),0_1px_4px_rgba(0,0,0,0.95),0_4px_20px_rgba(0,0,0,0.85),0_12px_40px_rgba(0,0,0,0.65)]"
const categoryShadow =
  "[text-shadow:0_0_1px_rgba(0,0,0,1),0_1px_3px_rgba(0,0,0,0.95),0_4px_16px_rgba(0,0,0,0.8)]"

/**
 * One featured-work card for the carousel (home + /featured-work).
 * Full photo visible (object-contain); no hover zoom so edges don’t flash dark.
 */
export function FeaturedProjectCarouselSlide({ project, index }) {
  return (
    <div className="min-w-0 shrink-0 grow-0 basis-[min(100%,calc(100vw-2.5rem))] sm:basis-[min(100%,88vw)] md:basis-[min(100%,55%)] lg:basis-[min(100%,48%)]">
      <Link
        href={`/featured-work/${project.slug}`}
        className="relative block overflow-hidden rounded-sm bg-background ring-1 ring-black/10 dark:bg-black dark:ring-white/10"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[#1a0a0a]">
          <Image
            src={project.image}
            alt={project.title}
            fill
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            className="object-contain object-center"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 88vw, 55vw"
          />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <h3
              className={`font-display text-xl font-normal tracking-tight text-balance text-white sm:text-2xl md:text-4xl ${titleShadow}`}
            >
              {project.title}
            </h3>
            <p
              className={`mt-3 font-display text-[10px] font-normal tracking-[0.08em] text-white ${categoryShadow}`}
            >
              {project.category}
            </p>
          </div>
        </div>
      </Link>
    </div>
  )
}
