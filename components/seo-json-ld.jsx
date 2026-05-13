import { contact } from "@/lib/site"
import { absoluteUrl } from "@/lib/seo-metadata"

/** Organization + WebSite structured data for rich results. */
export function SeoJsonLd() {
  const url = absoluteUrl("/")
  const logo = absoluteUrl("/HiTouch_final.png")

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HiTouch Enterprises Inc.",
    url,
    logo,
    sameAs: [contact.linkedinUrl, contact.instagramUrl, contact.youtubeChannelUrl].filter(Boolean),
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: contact.phoneHref.replace(/^tel:/, ""),
        email: contact.email,
        contactType: "sales",
        areaServed: "US",
        availableLanguage: "English",
      },
    ],
  }

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HiTouch Enterprises Inc.",
    url,
    publisher: { "@type": "Organization", name: "HiTouch Enterprises Inc.", url, logo },
  }

  const payload = [organization, website]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}
