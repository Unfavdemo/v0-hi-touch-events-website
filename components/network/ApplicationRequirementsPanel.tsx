import Link from "next/link";
import type { RequirementCheck } from "@/lib/network/document-requirements";

export function ApplicationRequirementsPanel({
  requirements,
  ready,
}: {
  requirements: RequirementCheck[];
  ready: boolean;
}) {
  const hitouch = requirements.filter((r) => r.scope === "hitouch");
  const eventWide = requirements.filter((r) => r.scope === "client" && r.eventWide);
  const opportunityOnly = requirements.filter((r) => r.scope === "client" && !r.eventWide);

  return (
    <div className="border-2 border-ht-line bg-ht-panel p-5">
      <p className="ht-label text-ht-muted">Documents required to apply</p>
      <p className="mt-1 text-xs text-ht-muted">
        HiTouch requires W-9, agreement, and HiTouch COI on every application. Client items are
        listed separately below.
      </p>
      {!ready ? (
        <p className="mt-2 text-sm text-ht-cream">
          Add everything below before you submit your quote.
        </p>
      ) : (
        <p className="mt-2 text-sm text-ht-gold">You&apos;re set — you can apply now.</p>
      )}

      <div className="mt-4 space-y-4">
        <div>
          <p className="ht-label text-ht-blue-bright">HiTouch (all vendors)</p>
          <ul className="mt-2 space-y-2">
            {hitouch.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className={r.met ? "text-ht-cream" : "text-ht-muted"}>
                  {r.met ? "✓" : "○"} {r.label}
                </span>
                {!r.met ? (
                  <Link href={r.href} className="ht-label text-ht-gold hover:text-ht-gold-bright">
                    Add →
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        {eventWide.length > 0 ? (
          <div>
            <p className="ht-label text-ht-gold">Client — whole event</p>
            <p className="text-xs text-ht-muted">Required for every role on this show.</p>
            <ul className="mt-2 space-y-2">
              {eventWide.map((r) => (
                <li key={r.id} className="text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={r.met ? "text-ht-cream" : "text-ht-muted"}>
                      {r.met ? "✓" : "○"} {r.label}
                    </span>
                    {!r.met ? (
                      <Link
                        href={r.href}
                        className="ht-label text-ht-gold hover:text-ht-gold-bright"
                      >
                        Upload →
                      </Link>
                    ) : null}
                  </div>
                  {r.description ? (
                    <p className="mt-1 text-xs text-ht-muted">{r.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {opportunityOnly.length > 0 ? (
          <div>
            <p className="ht-label text-ht-gold">Client — this opportunity only</p>
            <ul className="mt-2 space-y-2">
              {opportunityOnly.map((r) => (
                <li key={r.id} className="text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={r.met ? "text-ht-cream" : "text-ht-muted"}>
                      {r.met ? "✓" : "○"} {r.label}
                    </span>
                    {!r.met ? (
                      <Link
                        href={r.href}
                        className="ht-label text-ht-gold hover:text-ht-gold-bright"
                      >
                        Upload →
                      </Link>
                    ) : null}
                  </div>
                  {r.description ? (
                    <p className="mt-1 text-xs text-ht-muted">{r.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {(eventWide.length > 0 || opportunityOnly.length > 0) ? (
          <p className="text-xs text-ht-muted">
            Upload client files under Documents → Other documents using the exact name shown
            above.
          </p>
        ) : null}
      </div>
    </div>
  );
}
