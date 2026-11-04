import type { Metadata } from "next"
import "./network.css"

export const metadata: Metadata = {
  title: "HiTouch Events — Staffing",
  description:
    "HiTouch Events staffing for internal admins and vendors: opportunities, schedules, ratings, and payouts.",
  robots: { index: false, follow: false },
}

export default function NetworkLayout({ children }: { children: React.ReactNode }) {
  return <div className="network-app">{children}</div>
}
