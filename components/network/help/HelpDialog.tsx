"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/network/utils";

const noopSubscribe = () => () => {};

interface HelpDialogProps {
  title: string;
  children: ReactNode;
  /** Visible trigger content. Omit for a compact "?" icon trigger. */
  label?: ReactNode;
  /** Icon shown before `label`. */
  icon?: ReactNode;
  triggerClassName?: string;
  /** Opens once automatically per browser, keyed by this id. */
  autoOpenKey?: string;
}

export function HelpDialog({
  title,
  children,
  label,
  icon = "?",
  triggerClassName,
  autoOpenKey,
}: HelpDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!mounted || !autoOpenKey) return;
    const key = `ht-help-seen:${autoOpenKey}`;
    if (window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, "1");
    ref.current?.showModal();
  }, [mounted, autoOpenKey]);

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        aria-label={label ? undefined : `What is “${title}”?`}
        className={cn(
          label
            ? "ht-label flex w-full items-center gap-2 border-2 px-3 py-2.5 transition-colors"
            : "ml-1.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-ht-blue/50 align-middle text-[0.7rem] font-bold leading-none normal-case tracking-normal text-ht-blue transition-colors hover:border-ht-blue hover:bg-ht-blue hover:text-white",
          triggerClassName,
        )}
      >
        {label ? (
          <>
            <span aria-hidden className="text-sm font-bold">
              {icon}
            </span>
            {label}
          </>
        ) : (
          "?"
        )}
      </button>
      {mounted
        ? createPortal(
            <dialog
              ref={ref}
              aria-label={title}
              onClick={(e) => {
                if (e.target === e.currentTarget) e.currentTarget.close();
              }}
              className="m-auto w-[min(40rem,calc(100vw-2rem))] border-2 border-ht-blue bg-ht-panel p-0 text-left text-ht-cream shadow-2xl backdrop:bg-[#16162a]/50"
            >
              <div className="flex items-center justify-between gap-4 bg-ht-blue px-6 py-4">
                <p className="text-lg font-semibold text-white">{title}</p>
                <button
                  type="button"
                  onClick={() => ref.current?.close()}
                  className="ht-label border-2 border-white/40 px-2.5 py-1 text-white hover:border-white"
                >
                  Close
                </button>
              </div>
              <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5 text-base leading-relaxed text-ht-cream [&_li]:mt-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5">
                {children}
              </div>
            </dialog>,
            document.body,
          )
        : null}
    </>
  );
}

/** Small "?" trigger that explains a single concept in place. */
export function InfoTip({ title, children }: { title: string; children: ReactNode }) {
  return <HelpDialog title={title}>{children}</HelpDialog>;
}
