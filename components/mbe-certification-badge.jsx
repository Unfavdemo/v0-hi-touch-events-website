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
        width={96}
        height={96}
        unoptimized
        className="h-20 w-20 object-contain sm:h-24 sm:w-24"
      />
      <figcaption className="mt-2 max-w-[14rem] text-xs leading-snug text-muted-foreground">
        Minority certified business
      </figcaption>
    </figure>
  )
}
