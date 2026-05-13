import { DivisionPage } from "@/components/division-page"
import { buildPageMetadata } from "@/lib/seo-metadata"

export const metadata = {
  ...buildPageMetadata({
    title: "Event Production | HiTouch Enterprises Inc.",
    description: "Memorable, purposeful event production—show management through technical execution.",
    path: "/technical-production",
  }),
}

export default function TechnicalProductionPage() {
  return <DivisionPage slug="technical-production" />
}
