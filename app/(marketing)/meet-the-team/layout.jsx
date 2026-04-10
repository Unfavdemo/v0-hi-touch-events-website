import { teamMembers } from "@/lib/site"

/** First grid row (lg: 3 columns): preload headshots for faster LCP on this route. */
const FIRST_ROW_IMAGE_HREFS = teamMembers
  .slice(0, 3)
  .filter((m) => m.image)
  .map((m) => encodeURI(m.image))

export default function MeetTheTeamLayout({ children }) {
  return (
    <>
      {FIRST_ROW_IMAGE_HREFS.map((href) => (
        <link key={href} rel="preload" href={href} as="image" type="image/webp" />
      ))}
      {children}
    </>
  )
}
