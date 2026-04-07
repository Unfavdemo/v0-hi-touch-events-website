import Link from "next/link"
import { PageHero, Prose } from "@/components/page-hero"
import { getInquiryMailtoHref } from "@/lib/site"

export const metadata = {
  title: "About Us | HiTouch Enterprises Inc.",
  description:
    "HiTouch Events—over a decade building experiences that move communities and elevate brands. Founded 2016. Based—serving the region. 300+ events, $11M+ raised, Juneteenth, Urban Affairs Coalition, charter, impact-driven production.",
}

export default function AboutUsPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Who we are"
        subtitle="Event production and impact strategy—based, built for measurable results."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About us", href: "/about-us" },
        ]}
        variant="cinematic"
      />
      <Prose>
        <p>
          HiTouch Events has spent over a decade building experiences that move communities, elevate brands, and
          deliver measurable results.
        </p>
        <p>
          Founded in 2016 by marketing and event strategist Felicia D. Williams, HiTouch Enterprises has grown into a
          full-service Event Production and Impact Strategy firm—based, and built to serve clients near and far. What
          began as a bold entrepreneurial vision has evolved into a team known for precision, professionalism, and
          purpose-driven growth.
        </p>
        <p>
          HiTouch has produced more than 300 events for audiences ranging from 100 to over 25,000 attendees. The firm
          has helped nonprofit partners raise more than $11 million, strengthening missions centered on education
          equity, small business, violence reduction, economic access, and community advancement. From high-profile
          corporate engagements and VIP experiences to large-scale festivals and civic celebrations, HiTouch has
          built a reputation for delivering hi-quality, hi-impact hospitality and seamless execution.
        </p>
        <p>
          HiTouch is known for some of the region&apos;s most recognized gatherings. The firm produces the largest
          Juneteenth Parade and Festival of its kind in the nation, delivers signature programs such as the Urban
          Affairs Coalition&apos;s Anniversary Breakfast — widely regarded as a premier networking event — and leads
          major community celebrations including Wadsworth Day. Clients include the Free Library of Philadelphia
          Foundation, One Day At A Time (ODAAT) Philadelphia, UpLift Solutions, VestedIn, The Philadelphia Award, and
          the Black Brain Campaign, among others.
        </p>
        <p>
          As demand for comprehensive guest experiences expanded, in 2024 HiTouch introduced HiTouch Luxury Charter
          Services, led by President Craig E. Williams II. The premium black car service provides executive
          transportation, VIP transfers, and curated hospitality experiences that extend the HiTouch standard beyond
          the venue. Together, Felicia and Craig have cultivated a complementary leadership partnership grounded in
          operational excellence and people-first leadership.
        </p>
        <p>
          HiTouch&apos;s competitive advantage lies in its ability to merge creativity with disciplined execution.
          Through strong partnerships with local and state agencies, chambers of commerce, and community-based
          organizations, HiTouch has produced and provided luxury transportation for public events and conferences that
          have engaged hundreds of thousands across the region. Leveraging advanced project management platforms and
          technology systems, the firm ensures precision and accountability at every level.
        </p>
        <p>
          Ten years in, HiTouch Enterprises is not simply executing events — it is designing infrastructure for impact
          and shaping what the next chapter of Philadelphia&apos;s story can look like.
        </p>
        <p className="!mt-10 flex flex-wrap gap-4">
          <Link
            href="/meet-the-team"
            className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-ink underline-offset-4 hover:underline"
          >
            Meet the team
          </Link>
          <Link
            href="/founders-story"
            className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-ink underline-offset-4 hover:underline"
          >
            Founders&apos; story
          </Link>
          <a
            href={getInquiryMailtoHref()}
            className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-ink underline-offset-4 hover:underline"
          >
            Email us
          </a>
        </p>
      </Prose>
    </>
  )
}
