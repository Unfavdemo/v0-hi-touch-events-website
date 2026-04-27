import { PageHero, Prose } from "@/components/page-hero"

export const metadata = {
  title: "Founders' Story | HiTouch Enterprises Inc.",
  description:
    "Felicia D. Williams and the story of HiTouch Enterprises—nonprofit impact, event production, and leadership. Based in Philadelphia, PA, serving near and far.",
}

export default function FoundersStoryPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Founders' story"
        subtitle="Built on event production, charter, and marketing—with a Hi-Quality, Hi-Impact mindset."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About us", href: "/about-us" },
          { label: "Founders' story", href: "/founders-story" },
        ]}
        variant="cinematic"
      />
      <Prose>
        <p>
          Felicia D. Williams is an innovative marketing and event strategist with over 15 years of experience
          advancing nonprofit and community impact through event production, brand strategy, and fundraising. A
          graduate of Howard University, Felicia has lived and worked across New York City, Washington, D.C., and
          Philadelphia, partnering with nonprofit organizations to strengthen their reach, visibility, and
          sustainability.
        </p>
        <p>
          In 2016, Felicia founded HiTouch Enterprises—today spanning event production, HiTouch Luxury Charter
          Services, and HiTouch Solutions. Under her leadership, the firm has raised more than $11 million for nonprofit
          organizations, produced over 300 events, programs, festivals, and strategic campaigns, and supported
          organizations through innovative marketing, branding, and experiential engagement strategies.
        </p>
        <p>
          Beyond her professional work, Felicia is a dedicated community advocate committed to education equity,
          violence reduction, women&apos;s equality, and economic access for marginalized communities. She is the
          Founder of the Influencing Action Movement, a past Chair of the Philadelphia Commission on Women, where
          she served for eight years, and currently serves on the Boards of Directors for iChoose to Win and SCH
          Creative and Performing Arts.
        </p>
        <p>
          Felicia&apos;s leadership and service have been widely recognized. She is an Entrepreneur of the Year Award
          recipient from the African-American Chamber of Commerce and VestedIn, and has been named one of
          Philadelphia&apos;s Most Influential African-Americans: 10 Under 40 to Watch by The Philadelphia Tribune.
          She was also selected as a Connector and Keeper by Leadership Philadelphia, honored by Billy Penn as a
          Community Leader Award Recipient, and has received numerous accolades including the Black Women in
          Leadership Community Service Award and Woman of Essence by the Metropolitan Philadelphia Chapter of
          Continental Societies, Inc. Felicia also serves as a Deacon at Salem Baptist Church, where she is committed
          to faith-driven leadership and community service.
        </p>
        <p>
          Felicia holds a Bachelor of Business Administration in Marketing from Howard University, a Certification in
          Content Strategy from Northwestern University, and a Master&apos;s degree in Adult and Organizational
          Development from Temple University.
        </p>
      </Prose>
    </>
  )
}
