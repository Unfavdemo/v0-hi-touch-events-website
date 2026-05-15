/** HiTouch Enterprises — contact and inquiry links (contact per hitouchinc.com). */

export const contact = {
  phone: "(215) 346-6243",
  phoneHref: "tel:+12153466243",
  email: "LetsWork@hitouchinc.com",
  emailHref: "mailto:LetsWork@hitouchinc.com",
  charterPhone: "(215) 650-7216",
  charterPhoneHref: "tel:+12156507216",
  charterEmail: "LuxuryCharter@hitouchinc.com",
  charterEmailHref: "mailto:LuxuryCharter@hitouchinc.com",
  mainWeb: "https://hitouchinc.com",
  charterWeb: "https://hitouchluxurycharter.com",
  youtubeChannelUrl: "https://www.youtube.com/@hitouchinc",
  linkedinUrl: "https://www.linkedin.com/company/hitouch-enterprises/",
  instagramUrl: "https://www.instagram.com/hitouchinc/",
  citiesLine: "Based in Philadelphia, PA — serving the region and beyond",
  addressLines: [],
}

/** Prefilled mailto for event / general inquiries (EVENTS doc). */
export function getInquiryMailtoHref() {
  const subject = encodeURIComponent("HiTouch event inquiry")
  const body = encodeURIComponent(
    "Hi HiTouch team,\n\nI'm reaching out about:\n\n(Event date, location, and a short description of what you need.)\n\nThanks,\n"
  )
  return `${contact.emailHref}?subject=${subject}&body=${body}`
}
