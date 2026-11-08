import Image from "next/image"

export function MbeCertificationBadge({ className = "" }) {
  return (
    <figure
      className={`flex flex-col items-center text-center ${className}`.trim()}
      aria-label="Minority certified business"
    >
      <Image
        src="/certifications/mbe-certified.png"
        alt="Minority business enterprise certified"
        width={128}
        height={128}
        unoptimized
        className="h-28 w-28 object-contain sm:h-32 sm:w-32"
      />
      <figcaption className="mt-3 max-w-[18rem] text-sm font-medium leading-snug text-foreground sm:text-base dark:text-white">
        Minority certified business
      </figcaption>
    </figure>
  )
}
