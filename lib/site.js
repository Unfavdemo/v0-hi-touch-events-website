/** HiTouch Enterprises — site copy and routing (contact per hitouchinc.com). */

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
  citiesLine: "Based — serving the region and beyond",
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
  { label: "Social feed", href: "/social-feed", description: "Highlights from the field." },
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

export const featuredProjects = [
  {
    slug: "juneteenth-parade-festival-2025",
    category: "Festival",
    title: "2025 Juneteenth Parade & Festival",
    listDescription:
      "Largest Juneteenth celebration of its kind in the nation with over 25,000 in attendance—a vibrant showcase of Black culture, history, and excellence with 200+ diverse retail and community vendors; over $3M in local economic impact in a single day.",
    image: projectImage(0),
    body: [
      "This event is a vibrant showcase of Black culture, history and excellence with 200+ diverse retail and community vendors, generating over $3M in local economic impact in a single day.",
      "A HiTouch production since 2019.",
    ],
  },
  {
    slug: "urban-affairs-coalition-56th-anniversary",
    category: "Gala & fundraising",
    title: "Urban Affairs Coalition’s 56th Anniversary Breakfast",
    listDescription:
      "Hailed as Philadelphia’s premier networking event, nearly 1,000 leaders in business, government and community convened at the Pennsylvania Convention Center to celebrate regional change makers—the 12th year HiTouch produced the event and assisted the Coalition in raising $650,000.",
    image: projectImage(1),
    body: [
      "Regional leaders across business, government, and community gather to celebrate changemakers and the Coalition’s impact.",
      "A Felicia D. Williams & HiTouch production since 2012.",
    ],
  },
  {
    slug: "wadsworth-day",
    category: "Street festival",
    title: "Wadsworth Day",
    listDescription:
      "After a 7-year hiatus, HiTouch partnered with the Office of Councilman Anthony Phillips and the Ogontz Avenue Revitalization Corporation to bring back Wadsworth Day—a 3-block street festival in Northwest Philadelphia with 200 local vendors, food trucks, celebrity entertainment, kids carnival, car show, and more. Over 10,000 area residents participated in 2024 and 2025.",
    image: projectImage(2),
    body: [
      "Wadsworth Day fills three blocks with local vendors, food trucks, celebrity entertainment, a kids carnival, a car show, and more.",
      "The partnership with Councilman Phillips and Ogontz Avenue Revitalization Corporation brought this Northwest Philadelphia tradition back after seven years.",
    ],
  },
  {
    slug: "vow-renewal-hughes-ralph",
    category: "Premiere celebration",
    title:
      "20th Anniversary Vow Renewal — Senator Vincent Hughes & Emmy Award–winning actress Sheryl Lee Ralph",
    listDescription:
      "An intimate yet star-studded celebration of love, legacy, and public service—featured in Vogue Magazine and bringing together distinguished guests from across the globe, including nationally recognized celebrities, civic leaders, and local elected officials from throughout the region.",
    image: projectImage(3),
    body: [
      "HiTouch led the full creative direction and production execution.",
      "The evening honored a legacy of love and public service before a remarkable guest list drawn from across the country and around the world.",
    ],
  },
  {
    slug: "odaat-hope-for-the-holidays",
    category: "Community impact",
    title: "One Day at a Time’s Annual Hope for the Holidays",
    listDescription:
      "Hosted at Temple University’s Athletic Center, ODAAT’s annual community giveback provided gifts and resources to 500 families in need, plus an indoor holiday carnival with free food and sports activities for youth. A HiTouch production since 2017.",
    image: projectImage(0),
    body: [
      "Families receive gifts and resources during the holidays while young people enjoy carnival programming, meals, and sports activities—all under one roof.",
      "A HiTouch production since 2017.",
    ],
  },
  {
    slug: "vestedin-symposium-breakfast",
    category: "Convening",
    title: "VestedIn Small Business Symposium & Annual Opportunities Breakfast",
    listDescription:
      "Since 2018, HiTouch has worked with VestedIn on its annual Opportunities Breakfast, which now includes a Small Business Expo—an influential convening of 300+ entrepreneurs, corporate leaders, lenders, policymakers, and community partners.",
    image: projectImage(1),
    body: [
      "The Expo curates a high-quality marketplace of B2B vendors offering essential services and solutions to organizations seeking diverse, mission-aligned partners.",
      "Programming connects entrepreneurs with lenders, policymakers, and corporate partners in one signature morning.",
    ],
  },
  {
    slug: "national-convening-black-mayors",
    category: "Conference",
    title: "National Convening of Black Mayors",
    listDescription:
      "In its 4th consecutive year, the African-American Chamber of Commerce partnered with HiTouch to bring over 20 mayors from across the country for a 2-day conference focused on shared best practices and solutions to address disparities faced by Black business owners. The convening was attended by over 1,000 regional business owners, executives, and elected officials.",
    image: projectImage(2),
    body: [
      "Mayors and regional leaders joined business owners and executives for dialogue on practical solutions—not rhetoric alone.",
      "The Chamber and HiTouch continued a multi-year partnership elevating equity and opportunity for Black business owners.",
    ],
  },
  {
    slug: "black-brain-green-tie-gala",
    category: "Gala",
    title: "Black Brain Campaign 5th Annual Green Tie Gala",
    listDescription:
      "Held at Rivers Casino, the 2024 Black Brain Campaign Gala featured a Casino Night hosting nearly 400 guests, all committed to supporting access to mental health resources in BIPOC communities.",
    image: projectImage(3),
    body: [
      "The casino-night format created an energetic backdrop for fundraising focused on mental health access in BIPOC communities.",
      "Nearly 400 guests turned out for the fifth annual Green Tie Gala.",
    ],
  },
  {
    slug: "philadelphia-award-103",
    category: "Awards",
    title: "The 103rd Philadelphia Award",
    listDescription:
      "The Philadelphia Award is the most cherished, meaningful, and prestigious honor conferred in, by, and for the Philadelphia community. HiTouch Enterprises works with the award’s Board of Trustees to produce the annual awards reception and provide creative direction for the annual honoree video production.",
    image: projectImage(0),
    body: [
      "The evening reflects decades of tradition: honoring distinguished service to Philadelphia through a reception crafted with care and precision.",
      "HiTouch partners with the Board of Trustees on the live program and on creative direction for the honoree video each year.",
    ],
  },
]

export function getProjectBySlug(slug) {
  return featuredProjects.find((p) => p.slug === slug) ?? null
}

/** Intro for featured-work listing (HiTouch Events Web Copy Info PDF — 2025 signature projects). */
export const featuredWorkListingIntro =
  "In 2025, HiTouch Events & Marketing planned and executed 42 events and supported nonprofits in raising $3.7M. Here are just a few of our most impactful productions in 2025."

/**
 * Headshots: `public/images/team/{Full Name}_{Title}.png` (same pattern as Felicia).
 * Pending photos (add PNG to /public/images/team/): Kayla Frazer, Joy Young, Cherrell Woodley,
 * Kaylan Julien, Chanell Vick — use filenames e.g. `Kayla Frazer_Marketing Specialist.png`.
 */
export const teamMembers = [
  {
    name: "Felicia D. Williams",
    role: "CEO & Lead Event Producer",
    image: "/images/team/Felicia D. Williams_Founder & CEO.png",
    bio: "Felicia D. Williams is an innovative marketing and event strategist with over 15 years of experience advancing nonprofit and community impact through event production, brand strategy, and fundraising. A graduate of Howard University, she has lived and worked across New York City, Washington, D.C., and Philadelphia, partnering with nonprofit organizations to strengthen their reach, visibility, and sustainability.",
  },
  {
    name: "Chris Harris",
    role: "Chief of Staff",
    image: "/images/team/Chris Harris_Chief of Staff.png",
    bio: "Works alongside leadership to align priorities, internal operations, and cross-functional initiatives so the organization runs smoothly.",
  },
  {
    name: "Marlika Harris",
    role: "Director of Administration",
    image: "/images/team/Marlika Harris_Director of Administration.png",
    bio: "Leads administrative operations—systems, scheduling, and client coordination—that keep complex programs moving without friction.",
  },
  {
    name: "Mianna Smith",
    role: "Administration",
    image: "/images/team/Mianna Smith_Administration.png",
    bio: "Supports day-to-day operations and client touchpoints so teams stay organized and responsive from planning through show day.",
  },
  {
    name: "Lily Duong",
    role: "Marketing Specialist",
    image: "/images/team/Lily Duong_Marketing Specialist.png",
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
    bio: "Supports run-of-show preparation, documentation, and on-site logistics alongside the project leadership team.",
  },
  {
    name: "Chanell Vick",
    role: "Assistant Project Manager",
    bio: "Coordinates day-to-day project tasks, stakeholder updates, and field operations so nothing falls through the cracks.",
  },
  {
    name: "Tori Henry",
    role: "Assistant Project Manager",
    image: "/images/team/Tori Henry_Assistant Project Manager.png",
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
