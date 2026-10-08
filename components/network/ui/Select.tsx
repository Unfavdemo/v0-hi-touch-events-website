import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/network/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, name, children, ...props }, ref) => {
    const inputId = id ?? name ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label ? (
          <label htmlFor={inputId} className="ht-label block text-ht-muted">
            {label}
          </label>
        ) : null}
        <select
          ref={ref}
          id={inputId}
          name={name}
          className={cn(
            "w-full border-2 border-ht-line bg-ht-panel px-3 py-2.5 text-base text-ht-cream",
            "transition-colors focus:border-ht-gold focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-ht-danger",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error ? <p className="text-xs text-ht-danger">{error}</p> : null}
      </div>
    );
  },
);

Select.displayName = "Select";
