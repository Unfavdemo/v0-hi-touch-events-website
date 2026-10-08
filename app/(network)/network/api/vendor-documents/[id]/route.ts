import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/network/auth";
import { canViewVendorDocument, documentKindLabel } from "@/lib/network/document-access";
import { prisma } from "@/lib/network/prisma";
import { readStoredDocument } from "@/lib/network/vendor-docs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const viewer = await getCurrentUser();
  const { id } = await params;

  const doc = await prisma.vendorDocument.findUnique({ where: { id } });
  if (!doc) {
    return NextResponse.json({ error: "That file isn't on file." }, { status: 404 });
  }

  const allowed = await canViewVendorDocument({
    viewer,
    vendorId: doc.vendorId,
    kind: doc.kind,
  });
  if (!allowed) {
    return NextResponse.json({ error: "You can't view that file." }, { status: 403 });
  }

  const file = await readStoredDocument(doc.storedKey, slug(doc.label));
  if (!file) {
    return NextResponse.json({ error: "That file could not be opened." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `inline; filename="${file.filename}"`,
      "Cache-Control": "private, no-store",
      "X-Document-Kind": documentKindLabel(doc.kind),
    },
  });
}

function slug(label: string): string {
  const s = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return s || "document";
}
