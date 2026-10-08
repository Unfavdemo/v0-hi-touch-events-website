import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/network/utils";

const LOGO_SRC = "/brand/hitouch-logo.png";

interface BrandMarkProps {
  className?: string;
  size?: "md" | "lg";
  sublabel?: string;
  /** On dark surfaces (nav, hero), show the logo on a white tile. */
  variant?: "reversed" | "primary";
}

export function BrandMark({
  className,
  size = "md",
  sublabel = "Member Network",
  variant = "primary",
}: BrandMarkProps) {
  const showRoleLine = Boolean(sublabel) && sublabel !== "Member Network";
  const onDark = variant === "reversed";

  return (
    <Link
      href="/network/login"
      aria-label="HiTouch Solutions home"
      className={cn("group inline-flex flex-col gap-1.5", className)}
    >
      <span
        className={cn(
          "inline-flex w-fit",
          onDark && "rounded-sm bg-white p-1.5 shadow-sm",
        )}
      >
        <Image
          src={LOGO_SRC}
          alt="HiTouch"
          width={192}
          height={192}
          priority
          className={cn(
            "h-auto w-auto object-contain",
            size === "lg" ? "max-h-[7.5rem] max-w-[7.5rem]" : "max-h-14 max-w-14",
          )}
        />
      </span>
      {showRoleLine ? (
        <span className={cn("ht-label", onDark ? "text-white/70" : "text-ht-muted")}>
          {sublabel}
        </span>
      ) : null}
    </Link>
  );
}
