import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/network/utils";

const LOGO_SRC = "/Logos/HiTouch_final.png";

interface BrandMarkProps {
  className?: string;
  size?: "md" | "lg";
  /** Role line under the product name, e.g. Overhead Admin */
  sublabel?: string;
  /** On dark surfaces (rare), show the logo on a white tile. */
  variant?: "reversed" | "primary";
}

export function BrandMark({
  className,
  size = "md",
  sublabel,
  variant = "primary",
}: BrandMarkProps) {
  const onDark = variant === "reversed";

  return (
    <Link
      href="/network/login"
      aria-label="HiTouch Events — Staffing home"
      className={cn("group inline-flex flex-col gap-1", className)}
    >
      <span
        className={cn(
          "inline-flex w-fit items-center",
          onDark && "rounded-sm bg-white px-2 py-1.5 shadow-sm",
        )}
      >
        <Image
          src={LOGO_SRC}
          alt="HiTouch Events"
          width={280}
          height={80}
          priority
          className={cn(
            "h-auto w-auto object-contain object-left",
            size === "lg" ? "max-h-16 max-w-[16rem]" : "max-h-12 max-w-[13rem]",
          )}
        />
      </span>
      <span className={cn("ht-label", onDark ? "text-white/75" : "text-ht-brand")}>
        Staffing
      </span>
      {sublabel ? (
        <span className={cn("text-sm tracking-wide", onDark ? "text-white/55" : "text-ht-muted")}>
          {sublabel}
        </span>
      ) : null}
    </Link>
  );
}
