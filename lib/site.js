/** HiTouch Enterprises — site copy and routing (contact per hitouchinc.com). */

import { PUBLIC_ASSET_VERSION } from "./public-asset-version.js"

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

export const aboutDropdown = [
  { label: "About us", href: "/about-us", description: "Who we are and how we work." },
  { label: "Founders' story", href: "/founders-story", description: "How HiTouch came to be." },
]

export const whatsNewLinks = [
  { label: "Featured work", href: "/featured-work", description: "Selected productions and premieres." },
]

export const divisions = [
  {
    slug: "event-strategy",
    path: "/event-strategy",
    heroImage: "/images/project-1.jpg",
    title: "Strategic marketing",
    shortTitle: "Marketing",
    tagline: "Brand purpose, audience, integrated strategy",
    heroLine: "Communications and campaigns that connect your story to the right people.",
    body: [
      "We help organizations sharpen brand purpose, understand their audience, and build integrated strategies—from digital and media to stakeholder engagement.",
      "Whether you are launching a initiative or sustaining momentum, we align message, channels, and measurement so every touchpoint supports your goals.",
    ],
    bullets: [
      "Brand & communications planning",
      "Campaign strategy & messaging",
      "Stakeholder & media alignment",
      "Metrics & optimization",
    ],
  },
  {
    slug: "technical-production",
    path: "/technical-production",
    heroImage: "/images/project-2.jpg",
    title: "Event production",
    shortTitle: "Production",
    tagline: "Memorable, purposeful experiences",
    heroLine: "Expert production for conferences, galas, festivals, and public programs.",
    body: [
      "HiTouch produces events that make a lasting impression—thoughtful run-of-show, reliable technical execution, and teams that stay calm when the clock is counting down.",
      "From citywide celebrations to executive forums, we coordinate production details so your guests experience the moment—not the machinery behind it.",
    ],
    bullets: [
      "Program & show management",
      "Audio, video & lighting",
      "Staging & scenic coordination",
      "Vendor & crew leadership",
    ],
  },
  {
    slug: "stage-design",
    path: "/stage-design",
    heroImage: "/images/project-3.jpg",
    title: "Experience & scenic design",
    shortTitle: "Experience",
    tagline: "Environments that support your story",
    heroLine: "Scenic, signage, and spatial design that elevates live and hybrid programs.",
    body: [
      "We design environments that support your narrative—sightlines, flow, and branded touchpoints that read on camera and in the room.",
      "Our partners fabricate and install scenic elements with safety and schedule in mind, from intimate galas to large-scale public events.",
    ],
    bullets: [
      "Concept & spatial planning",
      "Branded environments",
      "Signage & wayfinding",
      "Fabrication partners & install",
    ],
  },
  {
    slug: "logistics",
    path: "/logistics",
    heroImage: "/images/project-4.jpg",
    title: "Luxury charter & logistics",
    shortTitle: "Charter",
    tagline: "Premier black car service in the region",
    heroLine: "Personalized luxury transportation—comfort, discretion, and reliability.",
    body: [
      "HiTouch Luxury Charter delivers personalized service for executives, talent, and VIPs—clean, comfortable vehicles and professional chauffeurs.",
      "Request a quote for airport transfers, road shows, and special events. For dedicated charter inquiries, reach our team directly at LuxuryCharter@hitouchinc.com.",
    ],
    bullets: [
      "Executive & VIP transport",
      "Airport & road show support",
      "Discreet, professional chauffeurs",
      "Custom itineraries",
    ],
  },
]

const projectImages = ["/images/project-1.jpg", "/images/project-2.jpg", "/images/project-3.jpg", "/images/project-4.jpg"]

function projectImage(i) {
  return projectImages[i % projectImages.length]
}

/** Hero/carousel image under `public/Hitouch Pictures/`. Encodes path for spaces, `&`, etc. */
function featuredHitouchFile(filename) {
  const base = `/${["Hitouch Pictures", filename].map(encodeURIComponent).join("/")}`
  return `${base}?v=${PUBLIC_ASSET_VERSION}`
}

export const featuredProjects = [
  {
    slug: "juneteenth-parade-festival-2025",
    category: "Festival",
    title: "Juneteenth Parade & Festival",
    listDescription:
      "HiTouch partnered with Pennsylvania Juneteenth Initiative on the 2025 Philadelphia Juneteenth Parade and Festival—the nation’s largest annual Juneteenth celebration—with 25,000+ attendees, theme “Freedom Fought – Freedom Won,” and more than $400,000 in sponsorship support.",
    image: featuredHitouchFile("Juneteenth Parade & Festival.JPG"),
    body: [
      "HiTouch Enterprises proudly partnered with Pennsylvania Juneteenth Initiative to support the production of the 2025 Philadelphia Juneteenth Parade and Festival, the nation’s largest annual Juneteenth celebration, held throughout Malcolm X Park and along Philadelphia’s historic 52nd Street corridor. Centered around the theme “Freedom Fought – Freedom Won,” the event welcomed more than 25,000 attendees for a vibrant day of culture, history, music, and community featuring a 1.5-mile parade with over 2,000 participants and floats, a marketplace with more than 250 vendors, youth programming, arts activations, and a large-scale music festival.",
      "HiTouch provided event production support, logistics coordination, vendor management, sponsorship support, and on-site execution, helping deliver a seamless and impactful celebration that raised more than $400,000 in sponsorship support while honoring the spirit of freedom, self-determination, and Black culture.",
    ],
  },
  {
    slug: "urban-affairs-coalition-56th-anniversary",
    category: "Gala & fundraising",
    title: "Urban Affairs Coalition Anniversary Breakfast",
    listDescription:
      "HiTouch partnered with the Urban Affairs Coalition on the 56th Anniversary Breakfast at the Pennsylvania Convention Center—nearly 1,000 civic, corporate, philanthropic, and community leaders, with more than $690,000 raised for UAC’s initiatives and programs.",
    image: featuredHitouchFile("Anniversary Breakfast.jpg"),
    body: [
      "HiTouch Enterprises proudly partnered with the Urban Affairs Coalition to produce the 56th Anniversary Breakfast at Pennsylvania Convention Center, a milestone celebration that brought together nearly 1,000 civic, corporate, philanthropic, and community leaders for an inspiring morning focused on impact, collaboration, and the future of equity-driven change. The event featured a VIP pre-breakfast reception, powerful storytelling, recognition of key UAC partners and leaders, and the special Coalition Builders Recognition honoring individuals who have advanced the Coalition’s mission of driving change from the ground up.",
      "HiTouch provided comprehensive event production, logistics coordination, guest experience management, fundraising support, vendor oversight, and on-site execution, helping deliver a seamless and impactful experience that successfully raised more than $690,000 to support UAC’s ongoing initiatives and community programs.",
    ],
  },
  {
    slug: "wadsworth-day",
    category: "Street festival",
    title: "Wadsworth Day",
    listDescription:
      "HiTouch partnered with Anthony Phillips and OARC on the 2025 Wadsworth Day Festival on Wadsworth Avenue—2,000+ attendees, three stages of live performances, a car show, Sip and Play Lane, senior activities, and a college send-off for local graduates.",
    image: featuredHitouchFile("Wadsworth Day.jpg"),
    body: [
      "HiTouch Enterprises proudly partnered with Anthony Phillips in partnership with OARC to produce the 2025 Wadsworth Day Festival on Wadsworth Avenue, a vibrant community celebration that welcomed more than 2,000 attendees for a day filled with culture, entertainment, and neighborhood pride. The family-friendly festival featured live performances across three stages, a classic and custom car show, local food vendors, community resources, the interactive Sip and Play Lane, senior activities, and a special college send-off ceremony honoring local graduating students.",
      "HiTouch provided comprehensive event production, logistics coordination, vendor and entertainment management, community engagement support, and on-site execution to help create an energetic and impactful experience that celebrated the spirit, opportunity, and resilience of Uptown Philadelphia.",
    ],
  },
  {
    slug: "vow-renewal-hughes-ralph",
    category: "Premiere celebration",
    title:
      "20th Anniversary Vow Renewal — Senator Vincent Hughes & Emmy Award–winning actress Sheryl Lee Ralph",
    listDescription:
      "HiTouch produced the 20th anniversary vow renewal for Vincent Hughes and Sheryl Lee Ralph at the Philadelphia Museum of Art—full event management and marketing, entertainment and catering, and luxury transportation through HiTouch Luxury Charter Services.",
    image: featuredHitouchFile("Sheryl Lee Ralph & Senator Vincent Hughes 20th Anniversary Vow Renewal.jpg"),
    body: [
      "HiTouch Enterprises proudly produced the 20th Anniversary Vow Renewal celebration for Vincent Hughes and Sheryl Lee Ralph at Philadelphia Museum of Art, creating an elegant and unforgettable evening honoring two decades of love, partnership, and legacy.",
      "HiTouch provided comprehensive event management and marketing support, including venue coordination, guest registration, entertainment and catering management, seating design, event communications, social media promotion, and on-site production. The celebration featured a special performance by dancers and luxury transportation services provided through HiTouch Luxury Charter Services, delivering a sophisticated and seamless guest experience from start to finish.",
    ],
  },
  {
    slug: "odaat-community-events",
    category: "Community impact",
    title: "One Day at a Time Community Events",
    listDescription:
      "Community events with One Day at a Time (ODAAT) Philadelphia—Thanksgiving giveaways and holiday outreach with meals, toys, clothing, and essentials for families. HiTouch coordinates logistics, community engagement, and on-site operations.",
    image: featuredHitouchFile("ODAAT A Season of Grattitude chrismas.jpg"),
    body: [
      "HiTouch Enterprises proudly partnered with One Day at a Time (ODAAT) Philadelphia on community events that uplift families throughout Philadelphia during Thanksgiving and Christmas—including the Annual Thanksgiving Food Giveaway and holiday celebration programming. ODAAT provided meals, toys, winter clothing, household essentials, and festive experiences to families facing hardship, ensuring they felt supported, valued, and cared for during the holiday season.",
      "Contributions—including a $5,000 gift card for holiday gift shopping—helped create joyful and memorable experiences for children and families across the community. HiTouch provided event coordination, logistics support, community engagement assistance, and operational management to help deliver a meaningful and impactful season of giving.",
    ],
  },
  {
    slug: "vestedin-symposium-breakfast",
    category: "Convening",
    title: "VestedIn Small Business Symposium & Annual Opportunities Breakfast",
    listDescription:
      "Lead event production and fundraising support partner for VestedIn’s 2026 Annual Opportunities Breakfast and Symposium at Live! Casino & Hotel Philadelphia—250+ stakeholders, investors, partners, and community leaders.",
    image: featuredHitouchFile("vestedin Opportunities Breakfast & Symposium.JPG"),
    body: [
      "HiTouch Enterprises proudly served as the lead event production and fundraising support partner for VestedIn’s 2026 Annual Opportunities Breakfast and Symposium at Live! Casino & Hotel Philadelphia, welcoming more than 250 stakeholders, investors, partners, and community leaders for an impactful morning focused on connection, collaboration, and community investment.",
      "Our team provided end-to-end event production services, including strategic planning, project management, venue and vendor coordination, sponsor engagement, marketing and communications, fundraising support, and on-site execution, delivering a seamless and polished experience that reflected VestedIn’s mission while strengthening relationships with key supporters and partners.",
    ],
  },
  {
    slug: "national-convening-black-mayors",
    category: "Conference",
    title: "National Convening of Black Mayors",
    listDescription:
      "HiTouch partnered with the African American Chamber of Commerce on the 4th Annual National Convening of Black Mayors and the 2nd Annual National Black Business Month Expo (2024)—two days of economic empowerment, collaboration, and growth, including remarks from Austin Davis at the Black Business Expo.",
    image: featuredHitouchFile("African American Chamber of Commerce.jpg"),
    body: [
      "HiTouch Enterprises proudly partnered with the African American Chamber of Commerce to support the 4th Annual National Convening of Black Mayors and the 2nd Annual National Black Business Month Expo in 2024, bringing together entrepreneurs, investors, elected officials, and community leaders for two impactful days focused on economic empowerment, collaboration, and business growth. The event celebrated the achievements and contributions of Black-owned businesses throughout the region and featured remarks from Austin Davis during the Black Business Expo.",
      "HiTouch provided event production and coordination support to help deliver a dynamic experience that elevated networking opportunities, strengthened community partnerships, and highlighted the importance of investing in Black business excellence.",
    ],
  },
  {
    slug: "black-brain-green-tie-gala",
    category: "Gala",
    title: "Annual Green Tie Gala",
    listDescription:
      "HiTouch partnered with the Black Brain Campaign on the 2025 Annual Green Tie Gala at Rivers Casino Philadelphia—a masquerade-inspired evening dedicated to mental health awareness, community engagement, and fundraising for culturally competent mental health resources.",
    image: featuredHitouchFile("Black Brain Campaign Green Tie Gala.jpg"),
    body: [
      "HiTouch Enterprises proudly partnered with the Black Brain Campaign to produce the 2025 Annual Green Tie Gala at Rivers Casino Philadelphia, an elegant masquerade-inspired evening dedicated to advancing mental health awareness, community engagement, and fundraising within the Black community. The event brought together supporters, advocates, and leaders for a memorable night featuring a formal seated dinner, entertainment, and recognition of individuals making an impact in the mental health field.",
      "HiTouch provided strategic event production, logistics management, vendor coordination, sponsorship support, and on-site execution, helping deliver a sophisticated yet budget-conscious experience that reflected BBC’s mission of increasing access to culturally competent mental health resources and supporting the growth of Black licensed therapists.",
    ],
  },
  {
    slug: "uplift-hardship-to-hope-gala-2025",
    category: "Gala & fundraising",
    title: "Uplift Solutions — Hardship to Hope Gala",
    listDescription:
      "HiTouch produced Uplift Solutions’ 2025 Hardship to Hope Gala at Cescaphe Ballroom—an evening honoring resilience and second chances, with cocktail reception, plated dinner, live music, and award presentations supporting returning citizens and justice-impacted individuals.",
    image: featuredHitouchFile("uplift Hardship to Hope Gala.jpg"),
    body: [
      "HiTouch Enterprises proudly partnered with Uplift Solutions to produce the 2025 Hardship to Hope Gala at Cescaphe Ballroom, an inspiring evening that brought together community leaders, changemakers, and supporters to celebrate resilience, transformation, and the power of second chances. The elegant event featured a cocktail reception, plated dinner, live music, and heartfelt award presentations honoring individuals who have turned adversity into action while supporting Uplift Solutions’ mission of empowering returning citizens and justice-impacted individuals through workforce development, entrepreneurship, and employment opportunities.",
      "HiTouch provided strategic event production, logistics coordination, vendor management, sponsorship support, and on-site execution to deliver a seamless and impactful experience that elevated the organization’s mission and fundraising efforts.",
    ],
  },
  {
    slug: "transforming-justice-2025",
    category: "Conference",
    title: "Transforming Justice Conference",
    listDescription:
      "HiTouch supported the 2025 Transforming Justice Conference at Community College of Philadelphia—a national convening on safety, equity, and healing in criminal and educational justice systems, with plenaries and breakouts for cross-sector collaboration.",
    image: featuredHitouchFile("uplift Transforming Justice.jpg"),
    body: [
      "HiTouch Enterprises proudly partnered with organizers to produce the 2025 Transforming Justice Conference at Community College of Philadelphia, a dynamic one-day convening focused on reimagining safety, equity, and healing within criminal and educational justice systems. Bringing together elected officials, advocates, practitioners, justice-impacted individuals, and community leaders from across the nation, the conference featured plenary discussions and breakout sessions designed to foster honest dialogue, amplify community-driven solutions, and strengthen cross-sector collaboration.",
      "HiTouch provided strategic event production, logistics coordination, stakeholder management, vendor oversight, and on-site execution to help deliver an engaging and impactful experience that elevated grassroots voices, encouraged policy-informed conversations, and inspired actionable change across communities.",
    ],
  },
  {
    slug: "community-heros-brunch-2025",
    category: "Community celebration",
    title: "Frankford CDC Community Heroes Breakfast",
    listDescription:
      "HiTouch partnered with Frankford CDC on the Community Heroes Breakfast at The Felt Factory—recognizing individuals and organizations making a lasting impact in Frankford, with community members, elected officials, sponsors, and local leaders.",
    image: featuredHitouchFile("Community Heros Brunch.jpg"),
    body: [
      "HiTouch Enterprises proudly partnered with Frankford CDC to produce the Community Heroes Breakfast at The Felt Factory, an inspiring morning dedicated to recognizing individuals and organizations making a lasting impact throughout the Frankford community. The event brought together community members, elected officials, sponsors, and local leaders for a meaningful celebration of service, leadership, and neighborhood empowerment.",
      "HiTouch provided comprehensive event production, logistics coordination, guest management, vendor oversight, and on-site execution to deliver a polished and engaging experience that honored the spirit of community and civic excellence in Philadelphia.",
    ],
  },
  {
    slug: "fathers-day-rally-fatherhood-ceremony-2025",
    category: "Community celebration",
    title: "Father’s Day Rally — Annual Fatherhood Ceremony",
    listDescription:
      "HiTouch produced the Father’s Day Rally Committee’s 2025 Annual Fatherhood Ceremony at the Philadelphia Museum of Art—honoring active fathers and positive narratives around Black fatherhood, with awards and a dinner reception.",
    image: featuredHitouchFile("Father's Day Rally.jpg"),
    body: [
      "HiTouch Enterprises proudly partnered with the Father’s Day Rally Committee to produce the 2025 Annual Fatherhood Ceremony at Philadelphia Museum of Art, an inspiring evening dedicated to honoring fathers who play an active role in the lives of their children and strengthening positive narratives around Black fatherhood. Building on the momentum of the organization’s Fatherhood Summit, the ceremony brought together families, community leaders, and supporters for an uplifting celebration featuring an awards presentation and dinner reception.",
      "HiTouch provided comprehensive event production, logistics coordination, vendor management, and on-site execution to help create a meaningful experience that reinforced the committee’s mission of promoting strong, stable, and empowered families throughout the community.",
    ],
  },
  {
    slug: "welcome-america-grove-mayors-vip",
    category: "2025 Welcome America",
    title: "The Grove: Mayor’s July 4th VIP Experience",
    listDescription:
      "HiTouch supported production of The Grove Experience at Eakins Oval—an elevated Mayor’s VIP evening with curated décor, luxury lounges, specialty food and beverage, live performances, awards, and branded moments with NBC10 Philadelphia coverage.",
    image: featuredHitouchFile("The Grove (Mayor's VIP).jpg"),
    body: [
      "HiTouch Enterprises proudly supported the production of The Grove Experience at Eakins Oval, an elevated Mayor’s VIP experience designed to bring together community leaders, sponsors, and special guests for an evening of celebration, entertainment, and connection. The event featured curated décor and floral installations, luxury lounge elements, specialty food and beverage experiences, live performances, award presentations, and engaging branded moments designed to enhance guest interaction and social media visibility.",
      "HiTouch provided event production support, inventory and logistics management, vendor coordination, décor oversight, and on-site execution to help create a polished and memorable experience alongside partners and media coverage from NBC10 Philadelphia.",
    ],
  },
  {
    slug: "celebration-of-freedom-2025",
    category: "2025 Welcome America",
    title: "July 4th City of Philadelphia Celebration of Freedom Ceremony",
    listDescription:
      "HiTouch supported the Celebration of Freedom Ceremony—a high-profile public event on NBC10 Philadelphia honoring civic impact, with award presentations, guest speakers, live performances, the One Philly Award, and Wawa Hero Awards finalists.",
    image: featuredHitouchFile("Celebtation of freedom.jpg"),
    body: [
      "HiTouch Enterprises proudly supported the production of the Celebration of Freedom Ceremony, a high-profile public event broadcast on NBC10 Philadelphia that honored individuals making a meaningful impact across Philadelphia and beyond. The event brought together community leaders, residents, political figures, and special guests for an inspiring evening featuring award presentations, guest speakers, and live performances.",
      "Highlights included the One Philly Award honoring John Middleton and recognition of finalists for the Wawa Hero Awards. HiTouch provided event production, logistics coordination, guest management, and on-site execution to help deliver a seamless and impactful celebration of leadership, service, and community empowerment.",
    ],
  },
  {
    slug: "tree-lighting-mayors-vip",
    category: "VIP experience",
    title: "Philadelphia Tree Lighting — Mayor’s VIP Holiday Experience",
    listDescription:
      "HiTouch produced the VIP Holiday Experience during the Philadelphia Tree Lighting Ceremony at City Hall—a heated VIP tent, lounge seating, holiday activations, themed photo ops, hot cocoa and mulled cider bar, and a family-friendly candy cane scavenger hunt for 300–400 guests.",
    image: featuredHitouchFile("The Tree Lighting Ceremony ( Mayor's VIP).jpg"),
    body: [
      "HiTouch Enterprises proudly partnered to produce the VIP Holiday Experience during the Philadelphia Tree Lighting Ceremony at Philadelphia City Hall, creating a festive and elevated outdoor celebration for 300–400 invited guests in the heart of the city. Designed to complement the annual tree lighting ceremony, the experience featured a heated VIP tent, warming stations, lounge seating, interactive holiday activations, themed photo opportunities, a festive hot cocoa and mulled cider bar, and a family-friendly candy cane scavenger hunt.",
      "HiTouch provided comprehensive project management, event logistics, vendor coordination, staffing, production oversight, and on-site execution, delivering a seamless and memorable holiday experience that reflected the spirit of community, joy, and celebration throughout Philadelphia.",
    ],
  },
  {
    slug: "philadelphia-award-103",
    category: "Awards",
    title: "The Philadelphia Award",
    listDescription:
      "Philadelphia Award 2025 Reception at Liberty View at Independence Visitor Center—honoring Drs. Alexis A. Thompson and Stephan A. Grupp for pediatric medicine, sickle cell treatment, and gene therapy. HiTouch produced the reception end-to-end.",
    image: featuredHitouchFile("Philadelphia Awards.jpg"),
    body: [
      "HiTouch Enterprises proudly partnered to produce the Philadelphia Award 2025 Reception at Liberty View at Independence Visitor Center, honoring Alexis A. Thompson and Stephan A. Grupp for their groundbreaking contributions to pediatric medicine, sickle cell treatment, and gene therapy. The elegant reception welcomed civic leaders, healthcare professionals, and community stakeholders for an evening of recognition, connection, and celebration centered on innovation and public impact.",
      "HiTouch provided event production, logistics coordination, guest management, vendor oversight, and on-site execution to deliver a polished and meaningful experience that reflected the prestige and legacy of The Philadelphia Award.",
    ],
  },
]

export function getProjectBySlug(slug) {
  return featuredProjects.find((p) => p.slug === slug) ?? null
}

/**
 * Headshots: `public/images/team/` — prefer short ASCII names for cache-friendly URLs
 * (e.g. `tori-henry.jpg`). Still missing: Kayla Frazer, Cherrell Woodley.
 */
export const teamMembers = [
  {
    name: "Felicia D. Williams",
    role: "CEO & Lead Event Producer",
    image: "/images/team/Felicia D Williams_CEO Lead Event Producer.jpg",
    bio: "Felicia D. Williams is an innovative marketing and event strategist with over 15 years of experience advancing nonprofit and community impact through event production, brand strategy, and fundraising. A graduate of Howard University, she has lived and worked across New York City, Washington, D.C., and Philadelphia, partnering with nonprofit organizations to strengthen their reach, visibility, and sustainability.",
  },
  {
    name: "Chris Harris",
    role: "Chief of Staff",
    image: "/images/team/Chris Harris_Chief of Staff.jpg",
    bio: "Works alongside leadership to align priorities, internal operations, and cross-functional initiatives so the organization runs smoothly.",
  },
  {
    name: "Marlika Harris",
    role: "Director of Administration",
    image: "/images/team/marlika-harris.jpg",
    bio: "Leads administrative operations—systems, scheduling, and client coordination—that keep complex programs moving without friction.",
  },
  {
    name: "Mianna Smith",
    role: "Administration",
    image: "/images/team/Mianna Smith_Administration.jpg",
    bio: "Supports day-to-day operations and client touchpoints so teams stay organized and responsive from planning through show day.",
  },
  {
    name: "Lily Duong",
    role: "Marketing Specialist",
    image: "/images/team/lily-duong.jpg",
    bio: "Drives integrated marketing and communications that connect client stories to the right audiences—campaign execution, content, and field support for high-stakes programs.",
  },
  {
    name: "Kayla Frazer",
    role: "Marketing Specialist",
    bio: "Shapes campaigns, content, and brand touchpoints that amplify client stories and drive engagement across channels.",
  },
  {
    name: "Joy Young",
    role: "Project Manager",
    image: "/images/team/Joy Young_Project Manager.jpg",
    bio: "Leads project timelines, vendor coordination, and client communication so every program stays aligned from planning through execution.",
  },
  {
    name: "Cherrell Woodley",
    role: "Project Manager",
    bio: "Owns production milestones and cross-functional details—keeping teams clear on scope, schedule, and deliverables.",
  },
  {
    name: "Kaylan Julien",
    role: "Assistant Project Manager",
    image: "/images/team/kaylan-julien.jpg",
    imageAlt:
      "Professional headshot of Kaylan Julien wearing a black blazer, glasses, and gold jewelry against a blurred office background.",
    bio: "Supports run-of-show preparation, documentation, and on-site logistics alongside the project leadership team.",
  },
  {
    name: "Chanell Vick",
    role: "Assistant Project Manager",
    image: "/images/team/Chanell Vick_Assistant Project Manager.jpg",
    bio: "Coordinates day-to-day project tasks, stakeholder updates, and field operations so nothing falls through the cracks.",
  },
  {
    name: "Tori Henry",
    role: "Assistant Project Manager",
    image: "/images/team/tori-henry.jpg",
    bio: "Supports project leads with scheduling, documentation, and on-site coordination so programs stay on track from prep through strike.",
  },
]

export const teamPageExtras = {
  demographics:
    "We are proudly a Black woman-owned company with a diverse team—85% African American, 15% Asian and Hispanic, and majority women—committed to excellence through inclusion and equity.",
  staffingSectionTitle: "Day of Event Staffing & Coordination",
  staffingBullets: [
    "Professional Event Staff Management: Full coordination of registration, event facilitators, and on-site support.",
    "Expert On-Site Coordination: Dedicated team leads to oversee logistics, troubleshoot issues, and ensure a smooth guest experience.",
    "Pre-Event Staff Training: Event-specific briefings to align all team members with your goals, brand, and expectations.",
  ],
}
