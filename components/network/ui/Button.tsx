import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/network/utils";

type ButtonVariant = "gold" | "blue" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  gold: "bg-ht-blue text-white border-2 border-ht-blue hover:bg-ht-gold-bright hover:border-ht-gold-bright font-semibold",
  blue: "bg-ht-blue text-white border-2 border-ht-blue hover:bg-ht-gold-bright hover:border-ht-gold-bright font-semibold",
  outline:
    "border-2 border-ht-blue bg-transparent text-ht-blue hover:bg-ht-blue hover:text-white",
  ghost: "border-2 border-transparent text-ht-muted hover:text-ht-blue",
  danger:
    "border-2 border-ht-danger/60 bg-transparent text-ht-danger hover:bg-ht-danger hover:text-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-6 py-3.5 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "gold", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap uppercase tracking-wider transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ht-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ht-black",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
