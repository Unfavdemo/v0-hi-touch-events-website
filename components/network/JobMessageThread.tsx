import { JobMessageForm } from "@/components/network/JobMessageForm";
import { formatDateTime } from "@/lib/network/utils";

export function JobMessageThread({
  jobId,
  viewerId,
  messages,
  canPost,
}: {
  jobId: string;
  viewerId: string;
  canPost: boolean;
  messages: {
    id: string;
    body: string;
    createdAt: Date;
    senderId: string;
    sender: { email: string; profile: { name: string | null } | null };
  }[];
}) {
  return (
    <section>
      <h2 className="ht-label text-ht-muted">Messages ({messages.length})</h2>
      <p className="mt-2 text-sm text-ht-muted">
        Day-of logistics with the hired vendor. HiTouch can see this thread too.
      </p>
      {messages.length === 0 ? (
        <p className="mt-3 text-sm text-ht-muted">No messages yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {messages.map((m) => {
            const mine = m.senderId === viewerId;
            return (
              <li
                key={m.id}
                className={`border-2 px-4 py-3 ${
                  mine ? "border-ht-blue bg-ht-panel" : "border-ht-line bg-ht-panel"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-ht-cream">
                    {mine ? "You" : (m.sender.profile?.name ?? m.sender.email)}
                  </p>
                  <p className="text-xs text-ht-muted">{formatDateTime(m.createdAt)}</p>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-ht-cream">{m.body}</p>
              </li>
            );
          })}
        </ul>
      )}
      {canPost ? <JobMessageForm jobId={jobId} /> : null}
    </section>
  );
}
