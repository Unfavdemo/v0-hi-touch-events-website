import { DocumentError, readStoredDocument, saveUploadedDocument, writeDemoDocument } from "@/lib/network/vendor-docs";

export { DOCUMENT_ACCEPT as W9_ACCEPT, DOCUMENT_MAX_BYTES as W9_MAX_BYTES } from "@/lib/network/vendor-docs";

export class W9Error extends DocumentError {
  constructor(message: string) {
    super(message);
    this.name = "W9Error";
  }
}

export async function saveUploadedW9(
  value: FormDataEntryValue | null,
): Promise<string | undefined> {
  try {
    return await saveUploadedDocument(value, "W-9");
  } catch (err) {
    if (err instanceof DocumentError) throw new W9Error(err.message);
    throw err;
  }
}

export async function resolveW9(
  formData: FormData,
  previous: string | null | undefined,
): Promise<string | null> {
  const uploaded = await saveUploadedW9(formData.get("w9"));
  if (uploaded) return uploaded;
  if (previous) return previous;
  return null;
}

export async function writeDemoW9(): Promise<string> {
  return writeDemoDocument("Form W-9");
}

export async function readStoredW9(
  stored: string,
): Promise<{ bytes: Buffer; mime: string; filename: string } | null> {
  return readStoredDocument(stored, "w9");
}
