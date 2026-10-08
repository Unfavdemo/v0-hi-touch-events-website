import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const PORTRAIT_MAX_BYTES = 2 * 1024 * 1024;
export const PORTRAIT_ACCEPT = "image/jpeg,image/png,image/webp";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export class PortraitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PortraitError";
  }
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  if (!value || typeof value !== "object") return false;
  const file = value as File;
  return (
    typeof file.arrayBuffer === "function" &&
    typeof file.size === "number" &&
    file.size > 0 &&
    typeof file.type === "string"
  );
}

export function isStoredPortraitSrc(value: string): boolean {
  return (
    /^\/portraits\/[a-z0-9._-]+\.(jpe?g|png|webp)$/i.test(value) ||
    /^\/uploads\/[0-9a-f-]+\.(jpe?g|png|webp)$/i.test(value) ||
    /^data:image\/(jpeg|png|webp);base64,/i.test(value)
  );
}

export async function saveUploadedPortrait(
  value: FormDataEntryValue | null,
): Promise<string | undefined> {
  if (!isUploadedFile(value)) return undefined;

  const ext = EXT_BY_TYPE[value.type];
  if (!ext) {
    throw new PortraitError("Drop a JPEG, PNG, or WebP image.");
  }
  if (value.size > PORTRAIT_MAX_BYTES) {
    throw new PortraitError("Image must be under 2 MB.");
  }

  const bytes = Buffer.from(await value.arrayBuffer());
  const filename = `${randomUUID()}.${ext}`;

  // Serverless hosts (Vercel) cannot persist writes under public/.
  if (process.env.VERCEL) {
    return `data:${value.type};base64,${bytes.toString("base64")}`;
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return `/uploads/${filename}`;
}

export async function resolvePortrait(
  formData: FormData,
  previous: string | null | undefined,
): Promise<string | null> {
  const uploaded = await saveUploadedPortrait(formData.get("portrait"));
  if (uploaded) return uploaded;
  if (formData.get("clearPortrait") === "1") return null;
  const existing = String(formData.get("existingPortraitUrl") ?? "");
  if (isStoredPortraitSrc(existing)) return existing;
  if (previous && isStoredPortraitSrc(previous)) return previous;
  return null;
}
