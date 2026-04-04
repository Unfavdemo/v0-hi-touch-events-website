import { PageHero } from "@/components/page-hero"
import { TeamGrid } from "@/components/team-grid"

export const metadata = {
  title: "Meet the Team | HiTouch Enterprises Inc.",
  description: "The people behind HiTouch Enterprises—production, operations, and client success.",
}

export default function MeetTheTeamPage() {
  return (
    <>
      <PageHero
        eyebrow="People"
        title="Meet the team"
        subtitle="Leadership and discipline leads who own outcomes—not just scopes."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Meet the team", href: "/meet-the-team" },
        ]}
        variant="cinematic"
      />
      <section className="pb-24 page-px">
        <div className="container mx-auto w-full min-w-0 max-w-full">
          <TeamGrid />
        </div>
      </section>
    </>
  )
}
