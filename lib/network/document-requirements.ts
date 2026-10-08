import type { DocumentRequirementKind, VendorDocument } from "@/lib/generated/network-prisma/client";
import type { PaperworkProfile } from "@/lib/network/paperwork";
import {
  hasAcceptedCurrentAgreement,
  hasW9,
} from "@/lib/network/paperwork";
import { prisma } from "@/lib/network/prisma";

export const HITOUCH_COI_LABEL = "HiTouch COI";

export type CustomRequirementLine = { label: string; description?: string };

export type ClientRequiredDoc = {
  label: string;
  description: string | null;
  source?: "event" | "opportunity";
};

/** One document per line. Optional description after ` | `. */
export function parseCustomRequirementLines(raw: string): CustomRequirementLine[] {
  const out: CustomRequirementLine[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.length < 2) continue;
    const pipe = trimmed.indexOf("|");
    if (pipe >= 0) {
      const label = trimmed.slice(0, pipe).trim();
      const description = trimmed.slice(pipe + 1).trim();
      if (label.length >= 2) {
        out.push({ label, description: description.length > 0 ? description : undefined });
      }
    } else {
      out.push({ label: trimmed });
    }
  }
  return out;
}

export function formatCustomRequirementLines(items: CustomRequirementLine[]): string {
  return items
    .map((i) => (i.description ? `${i.label} | ${i.description}` : i.label))
    .join("\n");
}

export type RequirementCheck = {
  id: string;
  label: string;
  description?: string;
  met: boolean;
  href: string;
  scope: "hitouch" | "client";
  /** When true, required for every opportunity on the parent event. */
  eventWide?: boolean;
};

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function hasHiTouchCoi(
  docs: Pick<VendorDocument, "kind" | "expiresAt">[],
  now = new Date(),
): boolean {
  const coi = docs.find((d) => d.kind === "COI");
  if (!coi) return false;
  if (coi.expiresAt && coi.expiresAt < now) return false;
  return true;
}

function hasCustomDocument(docs: Pick<VendorDocument, "kind" | "label">[], label: string): boolean {
  const want = normalizeLabel(label);
  return docs.some((d) => d.kind === "OTHER" && normalizeLabel(d.label) === want);
}

function networkRequirementRows(
  profile: PaperworkProfile,
  docs: Pick<VendorDocument, "kind" | "expiresAt" | "label">[],
): RequirementCheck[] {
  return [
    {
      id: "network-w9",
      label: "Form W-9",
      met: hasW9(profile),
      href: "/network/freelancer/documents",
      scope: "hitouch",
    },
    {
      id: "network-agreement",
      label: "Vendor agreement",
      met: hasAcceptedCurrentAgreement(profile),
      href: "/network/freelancer/profile",
      scope: "hitouch",
    },
    {
      id: "network-coi",
      label: HITOUCH_COI_LABEL,
      description: "Certificate of insurance on file with HiTouch.",
      met: hasHiTouchCoi(docs),
      href: "/network/freelancer/documents",
      scope: "hitouch",
    },
  ];
}

export async function getJobApplicationRequirements(
  jobId: string,
): Promise<
  {
    kind: DocumentRequirementKind;
    customLabel: string | null;
    partnerRequirementId: string | null;
  }[]
> {
  return prisma.jobDocumentRequirement.findMany({
    where: { jobId },
    select: { kind: true, customLabel: true, partnerRequirementId: true },
  });
}

type RequirementRow = {
  customLabel: string | null;
  customDescription?: string | null;
  kind: DocumentRequirementKind;
  partnerRequirement: { label: string; description: string | null } | null;
};

function requirementRowToDoc(
  row: RequirementRow,
  source: "event" | "opportunity",
): ClientRequiredDoc {
  return {
    label: row.customLabel?.trim() || row.partnerRequirement?.label || "Client document",
    description:
      row.customDescription?.trim() || row.partnerRequirement?.description?.trim() || null,
    source,
  };
}

function dedupeClientDocs(docs: ClientRequiredDoc[]): ClientRequiredDoc[] {
  const byLabel = new Map<string, ClientRequiredDoc>();
  for (const doc of docs) {
    const key = normalizeLabel(doc.label);
    const existing = byLabel.get(key);
    if (!existing) {
      byLabel.set(key, doc);
      continue;
    }
    if (doc.source === "opportunity" && existing.source === "event") {
      byLabel.set(key, doc);
    }
  }
  return [...byLabel.values()];
}

export async function getEventDocumentRequirements(eventId: string): Promise<ClientRequiredDoc[]> {
  const rows = await prisma.eventDocumentRequirement.findMany({
    where: { eventId },
    include: { partnerRequirement: true },
    orderBy: { id: "asc" },
  });
  return rows.map((r) => requirementRowToDoc(r, "event"));
}

export async function mergedClientDocsForJob(jobId: string): Promise<ClientRequiredDoc[]> {
  const job = await prisma.jobOpportunity.findUnique({
    where: { id: jobId },
    select: { partnerEventId: true },
  });
  const jobRows = await prisma.jobDocumentRequirement.findMany({
    where: { jobId },
    include: { partnerRequirement: true },
  });
  const eventDocs = job?.partnerEventId
    ? await getEventDocumentRequirements(job.partnerEventId)
    : [];
  const jobDocs = jobRows.map((r) => requirementRowToDoc(r, "opportunity"));
  return dedupeClientDocs([...eventDocs, ...jobDocs]);
}

export async function clientRequiredDocsByJobIds(
  jobIds: string[],
): Promise<Map<string, ClientRequiredDoc[]>> {
  const map = new Map<string, ClientRequiredDoc[]>();
  if (jobIds.length === 0) return map;
  for (const jobId of jobIds) {
    map.set(jobId, await mergedClientDocsForJob(jobId));
  }
  return map;
}

export async function clientRequiredLabelsByJobIds(
  jobIds: string[],
): Promise<Map<string, string[]>> {
  const rich = await clientRequiredDocsByJobIds(jobIds);
  const map = new Map<string, string[]>();
  for (const [jobId, docs] of rich) {
    map.set(jobId, docs.map((d) => d.label));
  }
  return map;
}

export async function getClientRequiredDocumentLabels(jobId: string): Promise<string[]> {
  const map = await clientRequiredLabelsByJobIds([jobId]);
  return map.get(jobId) ?? [];
}

export async function getClientRequiredDocuments(jobId: string): Promise<ClientRequiredDoc[]> {
  return mergedClientDocsForJob(jobId);
}

export function mapEventRequirementsForDisplay(
  rows: {
    id: string;
    customLabel: string | null;
    customDescription?: string | null;
    partnerRequirement: { label: string; description: string | null } | null;
  }[],
): JobRequirementDisplay[] {
  return rows.map((r) => ({
    id: r.id,
    label: r.customLabel?.trim() || r.partnerRequirement?.label || "Client document",
    description:
      r.customDescription?.trim() || r.partnerRequirement?.description?.trim() || null,
  }));
}

export type JobRequirementDisplay = {
  id: string;
  label: string;
  description: string | null;
};

export function mapJobRequirementsForDisplay(
  rows: {
    id: string;
    customLabel: string | null;
    customDescription?: string | null;
    partnerRequirement: { label: string; description: string | null } | null;
  }[],
): JobRequirementDisplay[] {
  return rows.map((r) => ({
    id: r.id,
    label: r.customLabel?.trim() || r.partnerRequirement?.label || "Client document",
    description:
      r.customDescription?.trim() || r.partnerRequirement?.description?.trim() || null,
  }));
}

export async function evaluateApplicationRequirements(options: {
  vendorId: string;
  profile: PaperworkProfile;
  jobId: string;
}): Promise<{ ready: boolean; requirements: RequirementCheck[] }> {
  const docs = await prisma.vendorDocument.findMany({
    where: { vendorId: options.vendorId },
    select: { kind: true, label: true, expiresAt: true },
  });

  const network = networkRequirementRows(options.profile, docs);
  const job = await prisma.jobOpportunity.findUnique({
    where: { id: options.jobId },
    select: { partnerEventId: true },
  });
  const eventRows = job?.partnerEventId
    ? await prisma.eventDocumentRequirement.findMany({
        where: { eventId: job.partnerEventId },
        include: { partnerRequirement: true },
        orderBy: { id: "asc" },
      })
    : [];
  const jobRows = await prisma.jobDocumentRequirement.findMany({
    where: { jobId: options.jobId },
    include: { partnerRequirement: true },
    orderBy: { kind: "asc" },
  });

  const clientFromRow = (
    row: RequirementRow & { id: string },
    index: number,
    eventWide: boolean,
  ): RequirementCheck => {
    const label =
      row.customLabel?.trim() || row.partnerRequirement?.label || "Client document";
    const description =
      row.customDescription?.trim() || row.partnerRequirement?.description?.trim() || undefined;
    let met = false;
    if (row.kind === "W9") met = hasW9(options.profile);
    else if (row.kind === "VENDOR_AGREEMENT") met = hasAcceptedCurrentAgreement(options.profile);
    else if (row.kind === "HITOUCH_COI") met = hasHiTouchCoi(docs);
    else if (row.kind === "CUSTOM") met = hasCustomDocument(docs, label);

    return {
      id: `${eventWide ? "event" : "job"}-${row.id}-${index}`,
      label,
      description,
      met,
      href: "/network/freelancer/documents",
      scope: "client" as const,
      eventWide,
    };
  };

  const jobByLabel = new Map<string, RequirementCheck>();
  for (const [index, row] of jobRows.entries()) {
    const check = clientFromRow(row, index, false);
    jobByLabel.set(normalizeLabel(check.label), check);
  }

  const client: RequirementCheck[] = [];
  for (const [index, row] of eventRows.entries()) {
    const check = clientFromRow(row, index, true);
    const jobOverride = jobByLabel.get(normalizeLabel(check.label));
    client.push(
      jobOverride?.description
        ? { ...check, description: jobOverride.description }
        : check,
    );
    jobByLabel.delete(normalizeLabel(check.label));
  }
  client.push(...jobByLabel.values());

  const requirements = [...network, ...client];
  return {
    ready: requirements.every((r) => r.met),
    requirements,
  };
}

export async function copyJobDocumentRequirements(
  fromJobId: string,
  toJobId: string,
): Promise<void> {
  const rows = await prisma.jobDocumentRequirement.findMany({ where: { jobId: fromJobId } });
  if (rows.length === 0) return;
  await prisma.jobDocumentRequirement.createMany({
    data: rows.map((r) => ({
      jobId: toJobId,
      kind: r.kind,
      customLabel: r.customLabel,
      customDescription: r.customDescription,
      partnerRequirementId: r.partnerRequirementId,
    })),
  });
}

export async function persistJobDocumentRequirements(
  jobId: string,
  partnerRequirementIds: string[],
  customRequirements: CustomRequirementLine[],
): Promise<void> {
  const templates =
    partnerRequirementIds.length > 0
      ? await prisma.partnerDocumentRequirement.findMany({
          where: { id: { in: partnerRequirementIds } },
        })
      : [];

  const data: {
    jobId: string;
    kind: DocumentRequirementKind;
    customLabel?: string;
    customDescription?: string;
    partnerRequirementId?: string;
  }[] = [];

  for (const t of templates) {
    data.push({
      jobId,
      kind: "CUSTOM",
      customLabel: t.label,
      customDescription: t.description?.trim() || undefined,
      partnerRequirementId: t.id,
    });
  }

  for (const item of customRequirements) {
    const label = item.label.trim();
    if (label.length < 2) continue;
    data.push({
      jobId,
      kind: "CUSTOM",
      customLabel: label,
      customDescription: item.description?.trim() || undefined,
    });
  }

  if (data.length > 0) {
    await prisma.jobDocumentRequirement.createMany({ data });
  }
}
