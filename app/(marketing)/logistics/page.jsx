import { DivisionPage } from "@/components/division-page"
import { buildPageMetadata } from "@/lib/seo-metadata"

export const metadata = {
  ...buildPageMetadata({
    title: "Luxury Charter & Logistics | HiTouch Enterprises Inc.",
    description: "Luxury charter and transportation—personalized service across the region.",
    path: "/logistics",
  }),
}

export default function LogisticsPage() {
  return <DivisionPage slug="logistics" />
}
