import { teamMembers } from "@/lib/site"

/** Preload first row headshots; encode once for valid URL (avoid double-encoding in `/_next/image`). */
const FIRST_ROW_IMAGE_HREFS = teamMembers
  .slice(0, 3)
  .filter((m) => m.image)
  .map((m) => encodeURI(m.image))

export default function MeetTheTeamLayout({ children }) {
  return (
    <>
      {FIRST_ROW_IMAGE_HREFS.map((href) => (
        <link key={href} rel="preload" href={href} as="image" />
      ))}
      {children}
    </>
  )
}
