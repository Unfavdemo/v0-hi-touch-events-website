import { DivisionPage } from "@/components/division-page"
import { buildPageMetadata } from "@/lib/seo-metadata"

export const metadata = {
  ...buildPageMetadata({
    title: "Experience & Scenic Design | HiTouch Enterprises Inc.",
    description: "Experience and scenic design—environments that elevate live and hybrid programs.",
    path: "/stage-design",
  }),
}

export default function StageDesignPage() {
  return <DivisionPage slug="stage-design" />
}
