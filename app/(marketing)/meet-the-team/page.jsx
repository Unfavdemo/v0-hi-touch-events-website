import { PageHero } from "@/components/page-hero"
import { TeamGrid } from "@/components/team-grid"
import { teamPageExtras } from "@/lib/site"

export const metadata = {
  title: "Meet the Team | HiTouch Enterprises Inc.",
  description:
    "The HiTouch team—leadership, marketing, operations, and day-of staffing for Hi-Quality, Hi-Impact, inclusive events. Based in Philadelphia, PA—serving near and far.",
}

export default function MeetTheTeamPage() {
  return (
    <>
      <PageHero
        eyebrow="People"
        title="Meet the team"
        subtitle="People behind Hi-Quality, Hi-Impact events—leadership and specialists who own outcomes."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Meet the team", href: "/meet-the-team" },
        ]}
        variant="cinematic"
      />
      <section className="bg-background page-section-y page-px dark:bg-black">
        <div className="container mx-auto w-full min-w-0 max-w-full space-y-16 md:space-y-20">
          <TeamGrid />
          <div className="mx-auto max-w-3xl border-t border-border pt-12 md:pt-16">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-brand-ink">Our team</p>
            <p className="mt-3 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Demographics (full-time team)
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{teamPageExtras.demographics}</p>
          </div>
          <div className="mx-auto max-w-3xl border-t border-border pt-12 md:pt-16">
            <h2 className="font-display text-2xl font-normal uppercase tracking-tight text-foreground md:text-3xl">
              {teamPageExtras.staffingSectionTitle}
            </h2>
            <ul className="mt-8 list-disc space-y-4 ps-5 text-muted-foreground">
              {teamPageExtras.staffingBullets.map((line) => (
                <li key={line} className="leading-relaxed">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
