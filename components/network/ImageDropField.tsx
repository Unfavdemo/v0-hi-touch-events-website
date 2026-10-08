"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/network/utils";

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;
const OUTPUT_SIZE = 800;

interface ImageDropFieldProps {
  label: string;
  hint?: string;
  name?: string;
  existingSrc?: string | null;
  previewAlt: string;
  onFileChange?: (file: File | null) => void;
}

async function cropToSquareJpeg(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read image.");
  const scale = Math.max(OUTPUT_SIZE / bitmap.width, OUTPUT_SIZE / bitmap.height);
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  ctx.drawImage(bitmap, (OUTPUT_SIZE - w) / 2, (OUTPUT_SIZE - h) / 2, w, h);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not process image."))),
      "image/jpeg",
      0.86,
    );
  });
  return new File([blob], "portrait.jpg", { type: "image/jpeg" });
}

export function ImageDropField({
  label,
  hint = "Drop a JPEG, PNG, or WebP. It is cropped square for your public profile.",
  name = "portrait",
  existingSrc,
  previewAlt,
  onFileChange,
}: ImageDropFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(existingSrc ?? null);
  const [cleared, setCleared] = useState(false);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const objectUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, []);

  function setInputFile(file: File | null) {
    const input = inputRef.current;
    if (!input) return;
    if (!file) {
      input.value = "";
      return;
    }
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
  }

  async function applyFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!ACCEPT.includes(file.type)) {
      setError("Use a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be under 8 MB.");
      return;
    }
    try {
      const prepared = await cropToSquareJpeg(file);
      setInputFile(prepared);
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      const url = URL.createObjectURL(prepared);
      objectUrl.current = url;
      setPreview(url);
      setCleared(false);
      onFileChange?.(prepared);
    } catch {
      setError("Could not read that image. Try another file.");
    }
  }

  function clear() {
    setInputFile(null);
    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    }
    setPreview(null);
    setCleared(true);
    setError(null);
    onFileChange?.(null);
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="ht-label block text-ht-muted">
        {label}
      </label>
      <input type="hidden" name="existingPortraitUrl" value={existingSrc ?? ""} />
      <input type="hidden" name="clearPortrait" value={cleared ? "1" : "0"} />
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={ACCEPT.join(",")}
        className="sr-only"
        onChange={(e) => void applyFile(e.target.files?.[0])}
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
          void applyFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          "flex cursor-pointer items-center gap-4 border-2 bg-ht-panel p-4 transition-colors",
          drag ? "border-ht-gold bg-ht-panel-2" : "border-ht-line hover:border-ht-line-strong",
          error && "border-ht-danger",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={previewAlt}
            className="h-20 w-20 shrink-0 border-2 border-ht-gold object-cover bg-ht-panel-2"
          />
        ) : (
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center border-2 border-dashed border-ht-line-strong text-ht-muted"
            aria-hidden
          >
            <span className="text-2xl leading-none">+</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-base font-medium text-ht-cream">
            {preview ? "Drop a new image to replace" : "Drop an image here, or click to browse"}
          </p>
          <p className="mt-1 text-xs text-ht-muted">{hint}</p>
        </div>
      </div>
      {preview ? (
        <button
          type="button"
          onClick={clear}
          className="ht-label text-ht-muted hover:text-ht-danger"
        >
          Remove image
        </button>
      ) : null}
      {error ? <p className="text-xs text-ht-danger">{error}</p> : null}
    </div>
  );
}
