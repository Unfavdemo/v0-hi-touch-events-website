import { VENDOR_AGREEMENT_VERSION } from "@/lib/network/vendor-agreement";

export type PaperworkProfile = {
  w9Url?: string | null;
  vendorAgreementAcceptedAt?: Date | null;
  vendorAgreementVersion?: string | null;
} | null | undefined;

export const PAPERWORK_APPLY_MESSAGE =
  "Upload your W-9 and HiTouch COI in Documents, accept the vendor agreement on your profile, and add any client-required files before you apply.";

export const PAPERWORK_HIRE_MESSAGE =
  "This vendor still needs required HiTouch and client documents before they can be hired.";

export function hasW9(profile: PaperworkProfile): boolean {
  return Boolean(profile?.w9Url);
}

export function hasAcceptedCurrentAgreement(profile: PaperworkProfile): boolean {
  return (
    Boolean(profile?.vendorAgreementAcceptedAt) &&
    profile?.vendorAgreementVersion === VENDOR_AGREEMENT_VERSION
  );
}

export function vendorPaperworkComplete(profile: PaperworkProfile): boolean {
  return hasW9(profile) && hasAcceptedCurrentAgreement(profile);
}

export function paperworkLabel(profile: PaperworkProfile): string {
  const w9 = hasW9(profile);
  const agreement = hasAcceptedCurrentAgreement(profile);
  if (w9 && agreement) return "Complete";
  if (!w9 && !agreement) return "Needs W-9 and agreement";
  if (!w9) return "Needs W-9";
  return "Needs to accept agreement";
}
