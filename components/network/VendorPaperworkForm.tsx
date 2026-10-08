"use client";

import { useActionState } from "react";
import { PaperworkTip } from "@/components/network/help/Tips";
import { Button } from "@/components/network/ui/Button";
import { updateVendorPaperwork } from "@/lib/network/profile-actions";
import {
  VENDOR_AGREEMENT_TITLE,
  VENDOR_AGREEMENT_VERSION,
} from "@/lib/network/vendor-agreement";
import { hasAcceptedCurrentAgreement, hasW9, paperworkLabel } from "@/lib/network/paperwork";
import Link from "next/link";

export function VendorPaperworkForm({
  w9Url,
  agreementAcceptedOn,
  vendorAgreementVersion,
}: {
  w9Url: string | null;
  agreementAcceptedOn: string | null;
  vendorAgreementVersion: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateVendorPaperwork, {});
  const profile = {
    w9Url,
    vendorAgreementAcceptedAt: agreementAcceptedOn ? new Date() : null,
    vendorAgreementVersion,
  };
  const w9OnFile = hasW9(profile);
  const agreementOk = hasAcceptedCurrentAgreement(profile);

  return (
    <section className="max-w-2xl border-2 border-ht-line bg-ht-panel p-6">
      <p className="ht-label text-ht-gold">
        Vendor agreement
        <PaperworkTip />
      </p>
      <h2 className="mt-1 text-xl font-semibold text-ht-cream">Legal paperwork</h2>
      <p className="mt-2 text-sm text-ht-muted">
        {paperworkLabel(profile) === "Complete"
          ? "You're set to apply and be hired."
          : "Finish the agreement here, and keep your W-9 under Documents."}{" "}
        Tax and insurance files live on the{" "}
        <Link href="/network/freelancer/documents" className="text-ht-gold hover:text-ht-gold-bright">
          Documents
        </Link>{" "}
        page.
      </p>
      {!w9OnFile ? (
        <p className="mt-3 border-2 border-ht-gold/50 px-4 py-3 text-sm text-ht-gold">
          No W-9 on file yet.{" "}
          <Link href="/network/freelancer/documents" className="underline">
            Upload it in Documents
          </Link>{" "}
          before you apply.
        </p>
      ) : null}

      <form action={formAction} className="mt-6 space-y-5">
        {agreementOk ? (
          <p className="border-2 border-ht-line bg-ht-panel-2 px-4 py-3 text-sm text-ht-cream">
            You accepted the {VENDOR_AGREEMENT_TITLE} (version {VENDOR_AGREEMENT_VERSION})
            on {agreementAcceptedOn}.
          </p>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-ht-cream">
              <input
                type="checkbox"
                name="acceptAgreement"
                value="1"
                required
                className="mt-1 accent-[#34318f]"
              />
              <span>
                I have read and accept the{" "}
                <a
                  href="/network/legal/vendor-agreement"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ht-gold hover:text-ht-gold-bright"
                >
                  {VENDOR_AGREEMENT_TITLE}
                </a>
                .
              </span>
            </label>
            <Button type="submit" disabled={pending} className="shrink-0 self-start">
              {pending ? "Saving…" : "Save agreement"}
            </Button>
          </div>
        )}

        {state.error ? (
          <p className="border-2 border-ht-danger/60 px-4 py-3 text-sm text-ht-danger">
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p className="border-2 border-ht-gold/60 px-4 py-3 text-sm text-ht-gold">
            Agreement saved.
          </p>
        ) : null}
      </form>
    </section>
  );
}
