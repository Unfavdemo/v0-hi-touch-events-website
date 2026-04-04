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
  citiesLine: "Philadelphia, PA — serving the region and beyond",
  addressLines: ["Philadelphia, PA"],
}

export const aboutDropdown = [
  { label: "About us", href: "/about-us", description: "Who we are and how we work." },
  { label: "Founders' story", href: "/founders-story", description: "How HiTouch came to be." },
]

export const whatsNewLinks = [
  { label: "Featured work", href: "/featured-work", description: "Selected productions and premieres." },
  { label: "Social feed", href: "/social-feed", description: "Highlights from the field." },
  { label: "Blog", href: "/blog", description: "Notes on production and experience design." },
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

export const featuredProjects = [
  {
    slug: "summit-conference-23",
    category: "Conference",
    title: "The Summit Conference '23",
    listDescription: "Full-scale production, 1,500 attendees, hybrid execution",
    image: "/images/project-1.jpg",
    body: [
      "A multi-track executive conference with general sessions, breakouts, and a broadcast layer for remote leadership. We unified audio, lighting, and content playback across two main stages and six overflow rooms.",
      "Hybrid production included low-latency program feeds, on-site encoding, and a dedicated support path for VIP remote participants. Rehearsal blocks were treated like show days—complete comms, cues, and failover tests.",
      "The result: a single cohesive experience for attendees in the room and online, with a strike that cleared the venue on time for the next tenant.",
    ],
  },
  {
    slug: "velocity-music-festival",
    category: "Festival",
    title: "Velocity Music Festival",
    listDescription: "Main stage design, 25,000 capacity, 3-day festival",
    image: "/images/project-2.jpg",
    body: [
      "Three days, multiple stages, and a main stage designed for both live energy and broadcast capture. We coordinated power, audio, lighting, and video with touring artists and local crews.",
      "Staging and scenic were engineered for wind loads and quick changeovers. Front-of-house and delay systems were modeled for the bowl geometry so coverage stayed even as crowds shifted.",
      "Safety and crowd-flow planning were integrated with production—from barrier lines to comms channels between stage management, medical, and security.",
    ],
  },
  {
    slug: "techforward-global-launch",
    category: "Product launch",
    title: "TechForward Global Launch",
    listDescription: "Product unveiling, immersive AV experience, 800 guests",
    image: "/images/project-3.jpg",
    body: [
      "An immersive reveal combining LED surfaces, spatial audio, and timed lighting cues. Content and product demos were choreographed into a single narrative arc.",
      "We built rehearsal protocols for executive presenters and demo hardware, including backup paths for live device handoffs. The show file was version-controlled and locked only after sign-off from creative and IT.",
      "Press and VIP zones received tailored sightlines and capture lighting so earned media and social output matched the in-room experience.",
    ],
  },
  {
    slug: "aurora-gala-night",
    category: "Gala",
    title: "Aurora Gala Night",
    listDescription: "Luxury corporate gala, bespoke staging, 500 executives",
    image: "/images/project-4.jpg",
    body: [
      "A seated gala with awards, live performance, and fundraising moments. Scenic and lighting were tuned for both the live room and documentary-style capture.",
      "We managed a tight load-in window in a historic venue, coordinating rigging limits, cable paths, and aesthetic goals with preservation requirements.",
      "The evening ran on a single master timeline with embedded contingency slots—so live donations and speeches could breathe without sacrificing the broadcast-out package.",
    ],
  },
]

export function getProjectBySlug(slug) {
  return featuredProjects.find((p) => p.slug === slug) ?? null
}

export const teamMembers = [
  {
    name: "Felicia D. Williams",
    role: "Principal",
    bio: "Founder and president of Influencing Action Movement; past chair of the Philadelphia Commission on Women; recognized for leadership across business and community initiatives.",
  },
  {
    name: "Chris Harris",
    role: "Development Manager",
    bio: "Builds partnerships and growth opportunities that expand HiTouch’s reach in events, marketing, and client success.",
  },
  {
    name: "Marlika Harris",
    role: "Administration Manager",
    bio: "Keeps operations organized—scheduling, client coordination, and the details that keep programs running smoothly.",
  },
  {
    name: "Jordan Ellis",
    role: "Executive Producer",
    bio: "Leads production planning and on-site execution for flagship conferences, galas, and public programs.",
  },
  {
    name: "Sam Rivera",
    role: "Technical Director",
    bio: "Audio, video, and lighting systems design for hybrid and in-person events.",
  },
  {
    name: "Taylor Morgan",
    role: "Experience Lead",
    bio: "Scenic, staging, and spatial design aligned with brand and show flow.",
  },
]
