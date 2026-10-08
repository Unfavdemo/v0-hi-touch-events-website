import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/network/auth";
import { canViewVendorDocument } from "@/lib/network/document-access";
import { prisma } from "@/lib/network/prisma";
import { readStoredDocument } from "@/lib/network/vendor-docs";

/** Latest W-9 for a vendor. Same visibility rules as Documents. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const viewer = await getCurrentUser();
  if (!viewer) {
    return NextResponse.json({ error: "Sign in to view this form." }, { status: 401 });
  }

  const { userId } = await params;
  const allowed = await canViewVendorDocument({
    viewer,
    vendorId: userId,
    kind: "W9",
  });
  if (!allowed) {
    return NextResponse.json({ error: "You can't view that form." }, { status: 403 });
  }

  const doc = await prisma.vendorDocument.findFirst({
    where: { vendorId: userId, kind: "W9" },
    orderBy: { updatedAt: "desc" },
  });
  const stored = doc?.storedKey;
  if (!stored) {
    return NextResponse.json({ error: "No W-9 on file." }, { status: 404 });
  }

  const file = await readStoredDocument(stored, "w9");
  if (!file) {
    return NextResponse.json({ error: "That W-9 could not be opened." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `inline; filename="${file.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
