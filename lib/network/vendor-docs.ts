import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { W9_MAX_BYTES } from "@/lib/network/w9-constants";

export { W9_ACCEPT as DOCUMENT_ACCEPT, W9_MAX_BYTES as DOCUMENT_MAX_BYTES } from "@/lib/network/w9-constants";

const EXT_BY_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

export class DocumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentError";
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

const FILE_KEY = /^(w9|doc):[0-9a-f-]+\.(pdf|jpe?g|png)$/i;
const DATA_URI = /^data:(application\/pdf|image\/(jpeg|png));base64,/i;

export function isStoredDocument(value: string): boolean {
  return FILE_KEY.test(value) || DATA_URI.test(value);
}

function storageDir(prefix: "w9" | "doc") {
  return path.join(process.cwd(), "private", "network", prefix === "w9" ? "w9" : "docs");
}

export async function saveUploadedDocument(
  value: FormDataEntryValue | null,
  kindLabel = "document",
): Promise<string | undefined> {
  if (!isUploadedFile(value)) return undefined;

  const ext = EXT_BY_TYPE[value.type];
  if (!ext) {
    throw new DocumentError(`Upload a PDF, JPEG, or PNG for this ${kindLabel}.`);
  }
  if (value.size > W9_MAX_BYTES) {
    throw new DocumentError("File must be under 8 MB.");
  }

  const bytes = Buffer.from(await value.arrayBuffer());
  const filename = `${randomUUID()}.${ext}`;

  if (process.env.VERCEL) {
    return `data:${value.type};base64,${bytes.toString("base64")}`;
  }

  const dir = storageDir("doc");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return `doc:${filename}`;
}

export async function writeDemoDocument(title: string): Promise<string> {
  const filename = `${randomUUID()}.pdf`;
  const bytes = Buffer.from(demoPdf(title), "utf8");
  const dir = storageDir("doc");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return `doc:${filename}`;
}

export async function readStoredDocument(
  stored: string,
  downloadName = "document",
): Promise<{ bytes: Buffer; mime: string; filename: string } | null> {
  if (!isStoredDocument(stored)) return null;

  if (stored.startsWith("data:")) {
    const comma = stored.indexOf(",");
    const meta = stored.slice(5, comma);
    const mime = meta.split(";")[0] ?? "application/pdf";
    const bytes = Buffer.from(stored.slice(comma + 1), "base64");
    const ext = EXT_BY_TYPE[mime] ?? "pdf";
    return { bytes, mime, filename: `${downloadName}.${ext}` };
  }

  const prefix = stored.startsWith("w9:") ? "w9" : "doc";
  const filename = stored.slice(prefix.length + 1);
  const ext = filename.split(".").pop()?.toLowerCase() ?? "pdf";
  const mime = MIME_BY_EXT[ext] ?? "application/pdf";
  try {
    const bytes = await readFile(path.join(storageDir(prefix), filename));
    return { bytes, mime, filename: `${downloadName}.${ext}` };
  } catch {
    if (prefix === "doc") {
      try {
        const bytes = await readFile(path.join(storageDir("w9"), filename));
        return { bytes, mime, filename: `${downloadName}.${ext}` };
      } catch {
        return null;
      }
    }
    return null;
  }
}

function demoPdf(title: string) {
  return `%PDF-1.1
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length 80 >> stream
BT /F1 16 Tf 72 720 Td (HiTouch demo — ${title.slice(0, 40)}) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
trailer << /Size 5 /Root 1 0 R >>
startxref
332
%%EOF
`;
}
