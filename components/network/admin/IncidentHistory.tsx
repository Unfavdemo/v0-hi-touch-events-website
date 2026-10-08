"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/network/ui/Badge";
import { Button } from "@/components/network/ui/Button";
import { Input } from "@/components/network/ui/Input";
import { Select } from "@/components/network/ui/Select";
import { Textarea } from "@/components/network/ui/Textarea";
import { restoreIncident, updateIncident, voidIncident } from "@/lib/network/incident-actions";
import { label } from "@/lib/network/labels";
import { cn } from "@/lib/network/utils";

export type IncidentHistoryRow = {
  id: string;
  kind: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  voidedAt: string | null;
  vendorId: string;
  vendorName: string;
  reporterName: string;
  voidedByName: string | null;
  jobId: string | null;
  jobTitle: string | null;
  canManage: boolean;
};

function matchesQuery(row: IncidentHistoryRow, q: string): boolean {
  if (!q) return true;
  const hay = [
    row.vendorName,
    row.reporterName,
    row.notes,
    row.jobTitle ?? "",
    label(row.kind),
    row.voidedByName ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function IncidentEditForm({
  row,
  jobs,
  onDone,
}: {
  row: IncidentHistoryRow;
  jobs: { id: string; title: string }[];
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateIncident, {});
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      onDone();
      router.refresh();
    }
  }, [state.ok, onDone, router]);

  return (
    <form action={formAction} className="mt-4 space-y-3 border-t border-ht-line pt-4">
      <input type="hidden" name="incidentId" value={row.id} />
      <Select name="jobId" label="Opportunity (optional)" defaultValue={row.jobId ?? ""}>
        <option value="">Not tied to an opportunity</option>
        {jobs.map((j) => (
          <option key={j.id} value={j.id}>
            {j.title}
          </option>
        ))}
      </Select>
      <Select name="kind" label="Kind" required defaultValue={row.kind}>
        <option value="NO_SHOW">No-show</option>
        <option value="COMPLAINT">Complaint</option>
        <option value="DAMAGE">Damage</option>
        <option value="OTHER">Other</option>
      </Select>
      <Textarea name="notes" label="Notes" required minLength={3} defaultValue={row.notes} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
      {state.error ? <p className="text-sm text-ht-danger">{state.error}</p> : null}
    </form>
  );
}

function IncidentHistoryItem({
  row,
  jobs,
}: {
  row: IncidentHistoryRow;
  jobs: { id: string; title: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const router = useRouter();
  const voided = Boolean(row.voidedAt);

  function runVoid(restore: boolean) {
    setActionError(null);
    startTransition(async () => {
      const result = restore ? await restoreIncident(row.id) : await voidIncident(row.id);
      if (result.error) setActionError(result.error);
      else router.refresh();
    });
  }

  return (
    <li
      className={cn(
        "border-2 border-ht-line bg-ht-panel p-5",
        voided && "opacity-70",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={voided ? "muted" : "danger"}>{label(row.kind)}</Badge>
        {voided ? <Badge variant="muted">Undone</Badge> : null}
        <Link
          href={`/network/admin/members/${row.vendorId}`}
          className="font-semibold text-ht-cream hover:text-ht-gold"
        >
          {row.vendorName}
        </Link>
      </div>
      {!editing ? (
        <p className={cn("mt-2 text-sm text-ht-cream", voided && "line-through")}>{row.notes}</p>
      ) : null}
      <p className="mt-2 text-xs text-ht-muted">
        Logged {formatWhen(row.createdAt)}
        {row.jobTitle ? ` · ${row.jobTitle}` : ""}
        {" · logged by "}
        {row.reporterName}
        {row.updatedAt !== row.createdAt ? ` · edited ${formatWhen(row.updatedAt)}` : ""}
        {voided && row.voidedAt
          ? ` · undone ${formatWhen(row.voidedAt)}${row.voidedByName ? ` by ${row.voidedByName}` : ""}`
          : ""}
      </p>
      {row.canManage && !voided && !editing ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => runVoid(false)}
          >
            {pending ? "Working…" : "Undo"}
          </Button>
        </div>
      ) : null}
      {row.canManage && voided ? (
        <div className="mt-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => runVoid(true)}
          >
            {pending ? "Working…" : "Restore"}
          </Button>
        </div>
      ) : null}
      {actionError ? <p className="mt-2 text-sm text-ht-danger">{actionError}</p> : null}
      {editing && !voided ? (
        <IncidentEditForm row={row} jobs={jobs} onDone={() => setEditing(false)} />
      ) : null}
    </li>
  );
}

export function IncidentHistory({
  rows,
  jobs,
}: {
  rows: IncidentHistoryRow[];
  jobs: { id: string; title: string }[];
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => rows.filter((r) => matchesQuery(r, q)), [rows, q]);

  return (
    <div className="space-y-4">
      <Input
        label="Search history"
        name="incidentSearch"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Vendor, notes, opportunity, kind, reporter…"
        autoComplete="off"
      />
      {filtered.length === 0 ? (
        <p className="border-2 border-dashed border-ht-line px-5 py-8 text-center text-sm text-ht-muted">
          {rows.length === 0 ? "No incidents logged yet." : "No incidents match your search."}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((row) => (
            <IncidentHistoryItem key={row.id} row={row} jobs={jobs} />
          ))}
        </ul>
      )}
    </div>
  );
}
