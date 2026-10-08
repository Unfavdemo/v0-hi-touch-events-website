import type { HTMLAttributes } from "react";
import { label } from "@/lib/network/labels";
import { cn } from "@/lib/network/utils";

type BadgeVariant = "gold" | "blue" | "muted" | "danger" | "cream";

const variantClasses: Record<BadgeVariant, string> = {
  gold: "border-ht-gold/60 text-ht-gold",
  blue: "border-ht-blue-bright/60 text-ht-blue-bright",
  muted: "border-ht-line-strong text-ht-muted",
  danger: "border-ht-danger/60 text-ht-danger",
  cream: "border-ht-cream/40 text-ht-cream",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "muted", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "ht-label inline-flex items-center border px-2 py-0.5",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export function applicationStatusLabel(status: "SUBMITTED" | "ACCEPTED" | "DECLINED"): string {
  switch (status) {
    case "SUBMITTED":
      return "Under review";
    case "ACCEPTED":
      return "Hired";
    case "DECLINED":
      return "Not selected";
  }
}

export function eventStatusLabel(status: string): string {
  return label(status);
}

export function statusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case "ACTIVE":
    case "APPROVED":
      return "gold";
    case "FILLED":
    case "ACCEPTED":
    case "TRIALING":
      return "blue";
    case "COMPLETED":
      return "cream";
    case "REJECTED":
    case "SUSPENDED":
    case "DECLINED":
    case "PAST_DUE":
    case "CANCELED":
      return "danger";
    default:
      return "muted";
  }
}
