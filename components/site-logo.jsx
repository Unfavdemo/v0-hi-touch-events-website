"use client"

import Image from "next/image"
import Link from "next/link"

/**
 * Brand mark from HiTouch_final.png (1188×1906). Uses object-contain + width caps
 * so the portrait asset is never squashed in the header or footer.
 */
export function SiteLogoLink({ onClick, variant = "header" }) {
  const imgClass =
    variant === "footer"
      ? "h-10 w-auto max-w-[200px] object-contain object-left sm:h-11 sm:max-w-[260px]"
      : "h-9 w-auto max-w-[min(200px,42vw)] object-contain object-left sm:h-10 md:max-w-[240px]"

  return (
    <Link
      href="/"
      onClick={onClick}
      className="inline-flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Image
        src="/HiTouch_final.png"
        alt="HiTouch Enterprises"
        width={1188}
        height={1906}
        className={`${imgClass} shrink-0`}
        sizes={variant === "footer" ? "260px" : "(max-width: 768px) 42vw, 240px"}
        priority={variant === "header"}
      />
    </Link>
  )
}
