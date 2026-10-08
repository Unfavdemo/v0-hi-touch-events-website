import type { Metadata } from "next"
import "./network.css"

export const metadata: Metadata = {
  title: "HiTouch Solutions — Member Network (Test)",
  description:
    "Test environment for HiTouch Solutions admin and vendor portals: managed staffing, ratings, and payouts.",
  robots: { index: false, follow: false },
}

export default function NetworkLayout({ children }: { children: React.ReactNode }) {
  return <div className="network-app">{children}</div>
}
