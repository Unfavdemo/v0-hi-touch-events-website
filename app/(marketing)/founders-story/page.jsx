import { PageHero, Prose } from "@/components/page-hero"

export const metadata = {
  title: "Founders' Story | HiTouch Enterprises Inc.",
  description: "How HiTouch Enterprises began—and how we lead with high-impact results.",
}

export default function FoundersStoryPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Founders' story"
        subtitle="Built in Philadelphia—event production, charter, and marketing with a high-impact mindset."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About us", href: "/about-us" },
          { label: "Founders' story", href: "/founders-story" },
        ]}
        variant="cinematic"
      />
      <Prose>
        <p>
          HiTouch Enterprises grew from real work on the ground—late-night load-ins, fast-turn
          programs, and clients who needed one accountable team for events, communications, and
          executive transportation—not a patchwork of vendors.
        </p>
        <p>
          We built the company to listen first: understanding what you are trying to accomplish, then
          designing production, marketing, and charter solutions that fit—whether that is a citywide
          festival, a fundraising gala, or a road show with black car service you can trust.
        </p>
        <p>
          Today that same ethos runs through every engagement. You get leadership that has led shows,
          shaped campaigns, and earned trust across Philadelphia and the region—with the standards you
          expect when the lights go up and the cameras roll.
        </p>
      </Prose>
    </>
  )
}
