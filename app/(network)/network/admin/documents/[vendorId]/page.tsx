import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/network/ui/Button";
import { requireSuperAdmin } from "@/lib/network/admin-rbac";
import { setDocumentExpiry } from "@/lib/network/compliance-actions";
import { documentKindLabel } from "@/lib/network/document-access";
import { prisma } from "@/lib/network/prisma";
import { formatDate } from "@/lib/network/utils";

export default async function AdminVendorDocumentsPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  await requireSuperAdmin();
  const { vendorId } = await params;

  const vendor = await prisma.user.findUnique({
    where: { id: vendorId, role: "FREELANCER" },
    include: {
      profile: true,
      vendorDocuments: { orderBy: [{ kind: "asc" }, { createdAt: "desc" }] },
    },
  });
  if (!vendor) notFound();

  return (
    <div className="space-y-8">
      <Link href="/network/admin/documents" className="ht-label text-ht-muted hover:text-ht-gold">
        ← All vendor documents
      </Link>
      <header>
        <p className="ht-label text-ht-gold">Admin</p>
        <h1 className="mt-1 text-3xl font-bold text-ht-cream">
          {vendor.profile?.name ?? vendor.email}
        </h1>
        <p className="mt-2 text-sm text-ht-muted">
          {vendor.email}
          {vendor.profile?.companyName ? ` · ${vendor.profile.companyName}` : ""}
        </p>
      </header>

      {vendor.vendorDocuments.length === 0 ? (
        <p className="border-2 border-ht-line bg-ht-panel px-5 py-6 text-sm text-ht-muted">
          This vendor hasn&apos;t uploaded any documents yet.
        </p>
      ) : (
        <ul className="divide-y-2 divide-ht-line border-2 border-ht-line bg-ht-panel">
          {vendor.vendorDocuments.map((doc) => (
            <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="ht-label text-ht-muted">{documentKindLabel(doc.kind)}</p>
                <p className="font-medium text-ht-cream">{doc.label}</p>
                <p className="text-xs text-ht-muted">Updated {formatDate(doc.updatedAt)}</p>
                {doc.expiresAt ? (
                  <p className="text-xs text-ht-muted">Expires {formatDate(doc.expiresAt)}</p>
                ) : null}
                {doc.kind === "COI" ? (
                  <form
                    action={setDocumentExpiry.bind(null, doc.id)}
                    className="mt-2 flex flex-wrap items-end gap-2"
                  >
                    <label className="text-xs text-ht-muted">
                      Expiry
                      <input
                        type="date"
                        name="expiresAt"
                        defaultValue={doc.expiresAt ? doc.expiresAt.toISOString().slice(0, 10) : ""}
                        className="ml-2 border-2 border-ht-line bg-ht-black px-2 py-1 text-ht-cream"
                      />
                    </label>
                    <Button type="submit" size="sm" variant="outline">
                      Save
                    </Button>
                  </form>
                ) : null}
              </div>
              <a
                href={`/api/vendor-documents/${doc.id}`}
                className="ht-label border-2 border-ht-gold px-3 py-1.5 text-ht-gold hover:bg-ht-gold hover:text-white"
                target="_blank"
                rel="noreferrer"
              >
                View
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
