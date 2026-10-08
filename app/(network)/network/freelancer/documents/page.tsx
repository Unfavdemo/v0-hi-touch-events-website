import {
  OtherDocumentForm,
  RemoveOtherDocumentButton,
  SingletonDocumentForm,
} from "@/components/network/VendorDocumentForms";
import { PaperworkTip } from "@/components/network/help/Tips";
import { requireUser } from "@/lib/network/auth";
import { prisma } from "@/lib/network/prisma";
import { formatDate } from "@/lib/network/utils";

export default async function VendorDocumentsPage() {
  const user = await requireUser("FREELANCER");
  const docs = await prisma.vendorDocument.findMany({
    where: { vendorId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const w9 = docs.find((d) => d.kind === "W9");
  const coi = docs.find((d) => d.kind === "COI");
  const others = docs.filter((d) => d.kind === "OTHER");
  const soon = new Date();
  soon.setDate(soon.getDate() + 30);
  const coiExpiringSoon =
    coi?.expiresAt && coi.expiresAt <= soon && coi.expiresAt >= new Date();

  return (
    <div className="space-y-8">
      <header>
        <p className="ht-label text-ht-gold">Vendor</p>
        <h1 className="mt-1 inline-flex flex-wrap items-center gap-2 text-3xl font-bold text-ht-cream">
          Documents
          <PaperworkTip />
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ht-muted">
          Keep your W-9, HiTouch COI, and anything else HiTouch or clients may ask for.
          You and HiTouch can always open these. Other vendors cannot. Partners can open
          your W-9 and HiTouch COI after they hire you — not your other files.
        </p>
      </header>

      {coiExpiringSoon ? (
        <p className="border-2 border-ht-gold bg-ht-panel px-5 py-4 text-sm text-ht-gold">
          Your HiTouch COI expires{" "}
          {coi?.expiresAt ? formatDate(coi.expiresAt) : "soon"}. Upload a renewal so
          partners stay covered.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border-2 border-ht-line bg-ht-panel p-6">
          <h2 className="text-lg font-semibold text-ht-cream">Form W-9</h2>
          <p className="mt-1 text-sm text-ht-muted">
            Required before you can apply or be hired.
            {w9 ? ` Last updated ${formatDate(w9.updatedAt)}.` : ""}
          </p>
          <div className="mt-5">
            <SingletonDocumentForm
              kind="W9"
              label="Form W-9"
              stamp="W-9"
              hasExisting={Boolean(w9)}
              viewHref={w9 ? `/api/vendor-documents/${w9.id}` : null}
            />
          </div>
        </section>

        <section className="border-2 border-ht-line bg-ht-panel p-6">
          <h2 className="text-lg font-semibold text-ht-cream">HiTouch COI</h2>
          <p className="mt-1 text-sm text-ht-muted">
            Required before you apply to opportunities. Upload your current certificate.
            {coi?.expiresAt ? ` Expires ${formatDate(coi.expiresAt)}.` : ""}
            {coi ? ` Last updated ${formatDate(coi.updatedAt)}.` : ""}
          </p>
          <div className="mt-5">
            <SingletonDocumentForm
              kind="COI"
              label="HiTouch COI"
              stamp="HiTouch COI"
              hasExisting={Boolean(coi)}
              viewHref={coi ? `/api/vendor-documents/${coi.id}` : null}
            />
          </div>
        </section>
      </div>

      <section className="max-w-2xl border-2 border-ht-line bg-ht-panel p-6">
        <h2 className="text-lg font-semibold text-ht-cream">Other documents</h2>
        <p className="mt-1 text-sm text-ht-muted">
          Licenses, riders, permits, or anything else we ask you to keep on file.
        </p>
        {others.length > 0 ? (
          <ul className="mt-4 divide-y-2 divide-ht-line border-2 border-ht-line">
            {others.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <a
                    href={`/api/vendor-documents/${doc.id}`}
                    className="font-medium text-ht-cream hover:text-ht-gold"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {doc.label}
                  </a>
                  <p className="text-xs text-ht-muted">Added {formatDate(doc.createdAt)}</p>
                </div>
                <RemoveOtherDocumentButton id={doc.id} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-ht-muted">No extra files yet.</p>
        )}
        <div className="mt-6">
          <OtherDocumentForm />
        </div>
      </section>
    </div>
  );
}
