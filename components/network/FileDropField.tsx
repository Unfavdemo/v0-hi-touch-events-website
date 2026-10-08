"use client";

import { useId, useRef, useState } from "react";
import { W9_ACCEPT, W9_MAX_BYTES } from "@/lib/network/w9-constants";
import { cn } from "@/lib/network/utils";

interface FileDropFieldProps {
  label: string;
  hint?: string;
  name?: string;
  stamp?: string;
  emptyPrompt?: string;
  existingLabel?: string;
  hasExisting?: boolean;
  onFileChange?: (file: File | null) => void;
}

export function FileDropField({
  label,
  hint = "PDF, JPEG, or PNG, under 8 MB.",
  name = "file",
  stamp = "FILE",
  emptyPrompt = "Drop a file here, or click to browse",
  existingLabel = "File on file",
  hasExisting = false,
  onFileChange,
}: FileDropFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(hasExisting ? existingLabel : null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const allowed = W9_ACCEPT.split(",");
    if (!allowed.includes(file.type)) {
      setError("Upload a PDF, JPEG, or PNG.");
      return;
    }
    if (file.size > W9_MAX_BYTES) {
      setError("File must be under 8 MB.");
      return;
    }
    const input = inputRef.current;
    if (input) {
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
    }
    setFileName(file.name);
    onFileChange?.(file);
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="ht-label block text-ht-muted">
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={W9_ACCEPT}
        className="sr-only"
        onChange={(e) => applyFile(e.target.files?.[0])}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          applyFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          "flex cursor-pointer items-center gap-4 border-2 bg-ht-panel p-4 transition-colors",
          drag ? "border-ht-gold bg-ht-panel-2" : "border-ht-line hover:border-ht-line-strong",
          error && "border-ht-danger",
        )}
      >
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center border-2 border-dashed border-ht-line-strong text-ht-muted"
          aria-hidden
        >
          <span className="ht-label">{stamp}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-medium text-ht-cream">
            {fileName ?? emptyPrompt}
          </p>
          <p className="mt-1 text-xs text-ht-muted">{hint}</p>
        </div>
      </div>
      {error ? <p className="text-xs text-ht-danger">{error}</p> : null}
    </div>
  );
}
