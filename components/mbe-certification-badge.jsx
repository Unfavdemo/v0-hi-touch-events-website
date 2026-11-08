import Image from "next/image"

export function MbeCertificationBadge({ className = "" }) {
  return (
    <figure
      className={`flex flex-col items-center text-center ${className}`.trim()}
      aria-label="Minority certified business"
    >
      {/* Light plate so the existing dark-fill badge stays visible on black footers */}
      <div className="rounded-md bg-white px-5 py-4 shadow-sm">
        <Image
          src="/certifications/mbe-certified.png"
          alt="Minority business enterprise certified"
          width={160}
          height={160}
          unoptimized
          className="h-32 w-32 object-contain sm:h-36 sm:w-36"
        />
      </div>
      <figcaption className="mt-3 max-w-[18rem] text-sm font-medium leading-snug text-foreground sm:text-base dark:text-white">
        Minority certified business
      </figcaption>
    </figure>
  )
}
