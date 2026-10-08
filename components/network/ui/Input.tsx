import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/network/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, name, ...props }, ref) => {
    const inputId = id ?? name ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label ? (
          <label htmlFor={inputId} className="ht-label block text-ht-muted">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          name={name}
          className={cn(
            "w-full border-2 border-ht-line bg-ht-panel px-3 py-2.5 text-base text-ht-cream",
            "placeholder:text-ht-muted/60 transition-colors",
            "focus:border-ht-gold focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-ht-danger",
            className,
          )}
          {...props}
        />
        {hint && !error ? <p className="text-xs text-ht-muted">{hint}</p> : null}
        {error ? <p className="text-xs text-ht-danger">{error}</p> : null}
      </div>
    );
  },
);

Input.displayName = "Input";
