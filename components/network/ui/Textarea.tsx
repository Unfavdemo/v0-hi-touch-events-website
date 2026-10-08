import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/network/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, name, ...props }, ref) => {
    const inputId = id ?? name ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label ? (
          <label htmlFor={inputId} className="ht-label block text-ht-muted">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={inputId}
          name={name}
          className={cn(
            "w-full min-h-[120px] border-2 border-ht-line bg-ht-panel px-3 py-2.5 text-base text-ht-cream",
            "placeholder:text-ht-muted/60 transition-colors resize-y",
            "focus:border-ht-gold focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-ht-danger",
            className,
          )}
          {...props}
        />
        {error ? <p className="text-xs text-ht-danger">{error}</p> : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
