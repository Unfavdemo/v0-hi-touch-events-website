import type { Notification } from "@/lib/generated/network-prisma/client";
import { Badge } from "@/components/network/ui/Badge";
import { label } from "@/lib/network/labels";
import { formatDateTime } from "@/lib/network/utils";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/network/notification-actions";

const TYPE_VARIANT: Record<Notification["type"], "gold" | "blue" | "danger" | "muted"> = {
  RATING_WARNING: "danger",
  DISMISSAL_NOTICE: "danger",
  APPLICATION_UPDATE: "gold",
  JOB_ALERT: "blue",
  EVENT_APPROVED: "gold",
  NEW_APPLICANT: "blue",
  VENDOR_WITHDREW: "danger",
  EVENT_REMINDER: "gold",
  REVIEW_NEEDED: "blue",
  ANNOUNCEMENT: "gold",
  MESSAGE: "blue",
  VENDOR_ARRIVED: "gold",
  VENDOR_WRAPPED: "gold",
  TEAM_ADDED: "blue",
  EVENT_OUTREACH: "blue",
  APPLICATION_CLOSE_REMINDER: "gold",
  EVENT_DETAILS: "gold",
};

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <p className="text-sm text-ht-muted">
        You&apos;re all caught up. Updates about your opportunities and applications will show up
        here.
      </p>
    );
  }

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="space-y-3">
      {hasUnread ? (
        <form action={markAllNotificationsRead}>
          <button
            type="submit"
            className="ht-label border-2 border-ht-line px-2 py-1 text-ht-muted hover:border-ht-gold hover:text-ht-gold"
          >
            Mark all read
          </button>
        </form>
      ) : null}

      <ul className="list-none! space-y-2 pl-0!">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`border-2 p-3 ${
              n.isRead ? "border-ht-line bg-ht-panel opacity-70" : "border-ht-line-strong bg-ht-panel-2"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant={TYPE_VARIANT[n.type]}>{label(n.type)}</Badge>
              <span className="text-xs text-ht-muted" suppressHydrationWarning>
                {formatDateTime(n.createdAt)}
              </span>
            </div>
            <p className="mt-2 text-sm text-ht-cream">{n.message}</p>
            {!n.isRead ? (
              <form action={markNotificationRead.bind(null, n.id)} className="mt-2">
                <button
                  type="submit"
                  className="ht-label text-ht-muted hover:text-ht-gold"
                >
                  Mark read
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
