import { cn } from "@/lib/network/utils";
import { initialsFromName, portraitUrl } from "@/lib/network/social";

interface VendorAvatarProps {
  name: string;
  type: "INDIVIDUAL" | "BUSINESS";
  headshotUrl?: string | null;
  logoUrl?: string | null;
  size?: "md" | "lg";
  className?: string;
}

export function VendorAvatar({
  name,
  type,
  headshotUrl,
  logoUrl,
  size = "lg",
  className,
}: VendorAvatarProps) {
  const src = portraitUrl({ type, headshotUrl, logoUrl });
  const dim = size === "lg" ? "h-32 w-32 text-4xl" : "h-20 w-20 text-2xl";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn(
          "shrink-0 border-2 border-ht-gold object-cover bg-ht-panel",
          dim,
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border-2 border-ht-gold bg-ht-panel font-bold text-ht-gold",
        dim,
        className,
      )}
      aria-hidden
    >
      {initialsFromName(name)}
    </div>
  );
}
