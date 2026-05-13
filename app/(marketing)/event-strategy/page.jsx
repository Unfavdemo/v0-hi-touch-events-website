import { DivisionPage } from "@/components/division-page"
import { buildPageMetadata } from "@/lib/seo-metadata"

export const metadata = {
  ...buildPageMetadata({
    title: "Strategic Marketing | HiTouch Enterprises Inc.",
    description: "Brand purpose, audience insights, and integrated communications strategy.",
    path: "/event-strategy",
  }),
}

export default function EventStrategyPage() {
  return <DivisionPage slug="event-strategy" />
}
