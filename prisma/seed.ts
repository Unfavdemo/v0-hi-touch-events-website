/**
 * Demo / sample data for local admin + portal exploration.
 * Safe to re-run: records use @seed.hitouch.local emails and "[Seed]" prefixes.
 *
 * Run: npm run db:migrate && npm run db:seed
 */
import "dotenv/config"
import {
  ActivityKind,
  AdminRole,
  ClientKind,
  DealStage,
  EmailDirection,
  EmailEventType,
  IntakeCategory,
  PendingStatus,
  PortalKind,
  TaskPriority,
  TaskStatus,
  VendorEngagementStatus,
} from "../lib/generated/prisma/client"
import { prisma } from "../lib/prisma"
import { featuredProjects } from "../lib/site/featured-projects.js"

const SEED_DOMAIN = "@seed.hitouch.local"
const SEED_TAG = { seed: true }

function seedEmail(local: string) {
  return `${local}${SEED_DOMAIN}`
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
}

async function wipeSeedData() {
  const seedContacts = await prisma.contact.findMany({
    where: { email: { endsWith: SEED_DOMAIN } },
    select: { id: true },
  })
  const seedContactIds = seedContacts.map((c) => c.id)

  const seedUsers = await prisma.user.findMany({
    where: { email: { endsWith: SEED_DOMAIN } },
    select: { id: true },
  })
  const seedAdminIds = (
    await prisma.adminUser.findMany({
      where: { userId: { in: seedUsers.map((u) => u.id) } },
      select: { id: true },
    })
  ).map((a) => a.id)

  await prisma.pendingSubmission.deleteMany({
    where: { email: { endsWith: SEED_DOMAIN } },
  })

  await prisma.eventProject.deleteMany({
    where: { name: { startsWith: "[Seed]" } },
  })

  await prisma.deal.deleteMany({ where: { name: { startsWith: "[Seed]" } } })
  await prisma.crmTask.deleteMany({ where: { title: { startsWith: "[Seed]" } } })
  await prisma.contactList.deleteMany({ where: { name: { startsWith: "[Seed]" } } })

  if (seedContactIds.length > 0) {
    await prisma.contact.deleteMany({ where: { id: { in: seedContactIds } } })
  }

  await prisma.company.deleteMany({
    where: { name: { startsWith: "[Seed]" } },
  })

  if (seedAdminIds.length > 0) {
    await prisma.auditLog.deleteMany({
      where: {
        OR: [{ actorId: { in: seedAdminIds } }, { payload: { path: ["seed"], equals: true } }],
      },
    })
  }

  await prisma.user.deleteMany({
    where: { email: { endsWith: SEED_DOMAIN } },
  })
}

async function seedVendorSkills() {
  const skills = [
    { key: "PHOTOGRAPHER", label: "Photographer" },
    { key: "AV", label: "Audio / visual" },
    { key: "CATERING", label: "Catering" },
    { key: "STAGING", label: "Staging & décor" },
    { key: "SECURITY", label: "Security" },
  ]
  for (const s of skills) {
    await prisma.vendorSkillCategory.upsert({
      where: { key: s.key },
      create: s,
      update: { label: s.label },
    })
  }
  return prisma.vendorSkillCategory.findMany()
}

async function seedHiTouchClients() {
  const clients = [
    { slug: "uac", name: "Urban Affairs Coalition", kind: ClientKind.NONPROFIT },
    { slug: "vestedin", name: "VestedIn", kind: ClientKind.NONPROFIT },
    { slug: "frankford-cdc", name: "Frankford CDC", kind: ClientKind.NONPROFIT },
    { slug: "free-library", name: "Free Library of Philadelphia Foundation", kind: ClientKind.NONPROFIT },
    { slug: "juneteenth-penn", name: "Juneteenth on the Parkway", kind: ClientKind.OTHER },
  ]
  for (const c of clients) {
    await prisma.hiTouchClient.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name, kind: c.kind },
    })
  }
  return prisma.hiTouchClient.findMany()
}

async function seedStaffUsers() {
  const coordinatorUser = await prisma.user.upsert({
    where: { email: seedEmail("coordinator") },
    create: { email: seedEmail("coordinator"), name: "Seed Event Coordinator" },
    update: {},
  })
  const coordinator = await prisma.adminUser.upsert({
    where: { userId: coordinatorUser.id },
    create: { userId: coordinatorUser.id, role: AdminRole.COORDINATOR },
    update: { role: AdminRole.COORDINATOR },
  })

  const superUser = await prisma.user.upsert({
    where: { email: seedEmail("superadmin") },
    create: { email: seedEmail("superadmin"), name: "Seed Master Admin" },
    update: {},
  })
  const superadmin = await prisma.adminUser.upsert({
    where: { userId: superUser.id },
    create: { userId: superUser.id, role: AdminRole.SUPERADMIN },
    update: { role: AdminRole.SUPERADMIN },
  })

  return { coordinator, superadmin }
}

type SeedContacts = {
  photographer: { id: string; email: string }
  photographerAlt: { id: string; email: string }
  avVendor: { id: string; email: string }
  catering: { id: string; email: string }
  clientLead: { id: string; email: string }
  clientUac: { id: string; email: string }
  clientVested: { id: string; email: string }
}

async function seedCompaniesAndContacts(
  clients: { id: string; slug: string }[],
  adminId: string
): Promise<{ contacts: SeedContacts; companyA: { id: string }; juneteenthProjectId?: string }> {
  const uac = clients.find((c) => c.slug === "uac")!
  const vested = clients.find((c) => c.slug === "vestedin")!
  const frankford = clients.find((c) => c.slug === "frankford-cdc")!

  const companyA = await prisma.company.create({
    data: {
      name: "[Seed] Bright Lens Media LLC",
      website: "https://example.com/bright-lens",
      notes: "[Internal] Vendor — photography & BTS video. Preferred for outdoor stages.",
    },
  })
  await prisma.company.create({
    data: {
      name: "[Seed] River City AV",
      website: "https://example.com/river-city-av",
      notes: "[Internal] Vendor — sound, lighting, LED walls.",
    },
  })
  const companyC = await prisma.company.create({
    data: {
      name: "[Seed] Neighborhood Arts Collective",
      notes: "[Internal] Potential client — community festival partner.",
    },
  })
  const companyPeco = await prisma.company.create({
    data: {
      name: "[Seed] PECO Community Programs",
      website: "https://example.com/peco-community",
      notes: "[Internal] Corporate partner — contacts tagged per program (UAC vs VestedIn).",
    },
  })

  await prisma.companyHiTouchClient.createMany({
    data: [
      { companyId: companyC.id, hiTouchClientId: frankford.id, notes: "Exploring 2026 fall fest support." },
      { companyId: companyPeco.id, hiTouchClientId: uac.id },
      { companyId: companyPeco.id, hiTouchClientId: vested.id },
    ],
    skipDuplicates: true,
  })

  const photo = await prisma.vendorSkillCategory.findUniqueOrThrow({ where: { key: "PHOTOGRAPHER" } })
  const av = await prisma.vendorSkillCategory.findUniqueOrThrow({ where: { key: "AV" } })
  const catering = await prisma.vendorSkillCategory.findUniqueOrThrow({ where: { key: "CATERING" } })
  const staging = await prisma.vendorSkillCategory.findUniqueOrThrow({ where: { key: "STAGING" } })

  const vendors = [
    {
      email: seedEmail("vendor.photographer"),
      firstName: "Aisha",
      lastName: "Brooks",
      title: "Lead photographer",
      companyId: companyA.id,
      skills: [photo.id],
    },
    {
      email: seedEmail("vendor.photographer.alt"),
      firstName: "Marcus",
      lastName: "Chen",
      title: "Second shooter",
      companyId: companyA.id,
      skills: [photo.id],
    },
    {
      email: seedEmail("vendor.av"),
      firstName: "Devon",
      lastName: "Reed",
      title: "Production manager",
      companyId: (
        await prisma.company.findFirstOrThrow({ where: { name: "[Seed] River City AV" } })
      ).id,
      skills: [av.id, staging.id],
    },
    {
      email: seedEmail("vendor.catering"),
      firstName: "Sofia",
      lastName: "Nunez",
      title: "Catering director",
      skills: [catering.id],
    },
  ]

  for (const v of vendors) {
    const { skills, ...contactData } = v
    const contact = await prisma.contact.create({ data: contactData })
    for (const categoryId of skills) {
      await prisma.contactVendorSkill.create({ data: { contactId: contact.id, categoryId } })
    }
  }

  const clientLead = await prisma.contact.create({
    data: {
      email: seedEmail("client.lead"),
      firstName: "Jordan",
      lastName: "Williams",
      title: "Program director",
      companyId: companyC.id,
      notes: "[Internal] Approved from intake — interested in turnkey community week.",
    },
  })
  await prisma.contactHiTouchClient.create({
    data: { contactId: clientLead.id, hiTouchClientId: uac.id, isPrimary: true },
  })

  const clientUac = await prisma.contact.create({
    data: {
      email: seedEmail("client.peco.uac"),
      firstName: "Riley",
      lastName: "Nguyen",
      title: "UAC program liaison",
      companyId: companyPeco.id,
      phone: "+1 215-555-0201",
    },
  })
  await prisma.contactHiTouchClient.create({
    data: { contactId: clientUac.id, hiTouchClientId: uac.id, isPrimary: true },
  })

  const clientVested = await prisma.contact.create({
    data: {
      email: seedEmail("client.peco.vested"),
      firstName: "Morgan",
      lastName: "Ellis",
      title: "VestedIn partnership lead",
      companyId: companyPeco.id,
      phone: "+1 215-555-0202",
    },
  })
  await prisma.contactHiTouchClient.create({
    data: { contactId: clientVested.id, hiTouchClientId: vested.id, isPrimary: true },
  })

  const photographer = await prisma.contact.findUniqueOrThrow({
    where: { email: seedEmail("vendor.photographer") },
  })
  const photographerAlt = await prisma.contact.findUniqueOrThrow({
    where: { email: seedEmail("vendor.photographer.alt") },
  })
  const avVendor = await prisma.contact.findUniqueOrThrow({ where: { email: seedEmail("vendor.av") } })
  const cateringContact = await prisma.contact.findUniqueOrThrow({ where: { email: seedEmail("vendor.catering") } })

  await prisma.contactActivity.createMany({
    data: [
      {
        contactId: photographer.id,
        companyId: companyA.id,
        kind: ActivityKind.NOTE,
        body: "[Internal] Strong communication on Juneteenth load-in; delivered gallery within 48h.",
        occurredAt: daysAgo(10),
        createdById: adminId,
      },
      {
        contactId: photographer.id,
        companyId: companyA.id,
        kind: ActivityKind.CALL,
        body: "[Internal] Confirmed shot list with stage manager — no BTS on main keynote.",
        occurredAt: daysAgo(8),
        createdById: adminId,
      },
      {
        contactId: photographerAlt.id,
        kind: ActivityKind.EMAIL,
        body: "[Internal] Sent rate card; waiting on W-9 for 2026 roster.",
        occurredAt: daysAgo(3),
        createdById: adminId,
      },
      {
        contactId: clientLead.id,
        companyId: companyC.id,
        kind: ActivityKind.MEETING,
        body: "[Internal] Discovery call — interested in fall festival package.",
        occurredAt: daysAgo(5),
        createdById: adminId,
      },
      {
        contactId: clientUac.id,
        companyId: companyPeco.id,
        kind: ActivityKind.NOTE,
        body: "[Internal] UAC-only contact — do not share VestedIn program details.",
        occurredAt: daysAgo(2),
        createdById: adminId,
      },
    ],
  })

  const juneteenth = clients.find((c) => c.slug === "juneteenth-penn")!
  const juneteenthProject = await prisma.eventProject.create({
    data: {
      name: "[Seed] Juneteenth 2025 — main stage",
      hiTouchClientId: juneteenth.id,
      startsAt: new Date("2025-06-19T14:00:00Z"),
      endsAt: new Date("2025-06-19T22:00:00Z"),
      notes: "[Internal] Sample project with mixed vendor engagement states.",
    },
  })

  await prisma.vendorReview.createMany({
    data: [
      {
        contactId: photographer.id,
        hiTouchClientId: uac.id,
        projectId: juneteenthProject.id,
        rating: 5,
        headline: "Excellent stage coverage",
        body: "Captured keynote and crowd energy; files were organized by segment and delivered on time.",
        reviewerName: "HiTouch Production",
        internalNotes: "[Internal] Would book again for UAC flagship events.",
        eventDate: new Date("2025-06-19"),
        createdById: adminId,
      },
      {
        contactId: photographer.id,
        hiTouchClientId: juneteenth.id,
        rating: 4,
        headline: "Great energy, minor delivery delay",
        body: "Beautiful gallery overall. Final selects arrived a day later than promised but quality was worth the wait.",
        reviewerName: "Juneteenth Program Team",
        internalNotes: "[Internal] Remind about 48h SLA on future RFPs.",
        eventDate: new Date("2024-06-19"),
        createdById: adminId,
      },
      {
        contactId: photographerAlt.id,
        rating: 3,
        headline: "Solid B-roll, communication gaps",
        body: "Second shooter footage was usable. Needed two follow-ups on shot list during load-in.",
        reviewerName: "HiTouch Events",
        internalNotes: "[Internal] Backup only unless lead is unavailable.",
        createdById: adminId,
      },
      {
        contactId: avVendor.id,
        hiTouchClientId: juneteenth.id,
        rating: 5,
        headline: "Flawless A/V execution",
        body: "Line arrays and delay towers were tuned perfectly. Show caller had zero comms issues.",
        reviewerName: "HiTouch Production",
        internalNotes: "[Internal] Preferred AV partner for outdoor stages.",
        createdById: adminId,
      },
    ],
  })

  return {
    companyA,
    contacts: {
      photographer: { id: photographer.id, email: photographer.email },
      photographerAlt: { id: photographerAlt.id, email: photographerAlt.email },
      avVendor: { id: avVendor.id, email: avVendor.email },
      catering: { id: cateringContact.id, email: cateringContact.email },
      clientLead: { id: clientLead.id, email: clientLead.email },
      clientUac: { id: clientUac.id, email: clientUac.email },
      clientVested: { id: clientVested.id, email: clientVested.email },
    },
    juneteenthProjectId: juneteenthProject.id,
  }
}

async function seedPortalAccounts(contacts: SeedContacts) {
  const portalTargets: { contact: { id: string; email: string; firstName?: string | null; lastName?: string | null }; kind: PortalKind }[] = [
    {
      contact: {
        id: contacts.photographer.id,
        email: contacts.photographer.email,
        firstName: "Aisha",
        lastName: "Brooks",
      },
      kind: PortalKind.VENDOR,
    },
    {
      contact: {
        id: contacts.photographerAlt.id,
        email: contacts.photographerAlt.email,
        firstName: "Marcus",
        lastName: "Chen",
      },
      kind: PortalKind.VENDOR,
    },
    {
      contact: {
        id: contacts.clientLead.id,
        email: contacts.clientLead.email,
        firstName: "Jordan",
        lastName: "Williams",
      },
      kind: PortalKind.CLIENT,
    },
    {
      contact: {
        id: contacts.clientUac.id,
        email: contacts.clientUac.email,
        firstName: "Riley",
        lastName: "Nguyen",
      },
      kind: PortalKind.CLIENT,
    },
    {
      contact: {
        id: contacts.clientVested.id,
        email: contacts.clientVested.email,
        firstName: "Morgan",
        lastName: "Ellis",
      },
      kind: PortalKind.CLIENT,
    },
  ]

  for (const { contact, kind } of portalTargets) {
    const name = [contact.firstName, contact.lastName].filter(Boolean).join(" ") || contact.email
    const user = await prisma.user.upsert({
      where: { email: contact.email },
      create: {
        email: contact.email,
        name,
        emailVerified: new Date(),
      },
      update: { name, emailVerified: new Date() },
    })
    await prisma.portalAccount.upsert({
      where: { contactId: contact.id },
      create: {
        userId: user.id,
        contactId: contact.id,
        kind,
        enabled: true,
        invitedAt: daysAgo(14),
        lastLoginAt: daysAgo(1),
      },
      update: {
        userId: user.id,
        kind,
        enabled: true,
        invitedAt: daysAgo(14),
        lastLoginAt: daysAgo(1),
      },
    })
  }
}

async function seedPendingIntake(adminId: string) {
  const pendingRows = [
    {
      fullName: "Taylor Morgan",
      email: seedEmail("intake.pending.client"),
      phone: "+1 215-555-0101",
      organization: "West Philly Youth Network",
      message: "We run an annual block party (~800 guests) and need staging, sound, and day-of coordination.",
      categories: [IntakeCategory.POTENTIAL_CLIENT],
    },
    {
      fullName: "Chris Okonkwo",
      email: seedEmail("intake.pending.vendor"),
      phone: "+1 267-555-0102",
      organization: "Okonkwo Event Lighting",
      message: "Available for nonprofit galas and outdoor festivals. Portfolio link in meta.",
      categories: [IntakeCategory.POTENTIAL_VENDOR],
      meta: { portfolioUrl: "https://example.com/portfolio" },
    },
    {
      fullName: "Pat Rivera",
      email: seedEmail("intake.pending.sponsor"),
      organization: "Rivera Family Foundation",
      message: "Interested in sponsoring the Juneteenth stage experience.",
      categories: [IntakeCategory.SPONSOR, IntakeCategory.PARTNER_OR_FUTURE_EMPLOYEE],
    },
    {
      fullName: "Sam Lee",
      email: seedEmail("intake.pending.spam"),
      message: "Buy followers cheap!!!",
      categories: [IntakeCategory.ATTENDEE_GUEST],
    },
  ]

  for (const row of pendingRows) {
    await prisma.pendingSubmission.create({
      data: { status: PendingStatus.PENDING, ...row },
    })
  }

  await prisma.pendingSubmission.create({
    data: {
      status: PendingStatus.APPROVED,
      fullName: "Jordan Williams",
      email: seedEmail("client.lead"),
      organization: "[Seed] Neighborhood Arts Collective",
      message: "Already approved — see Contacts.",
      categories: [IntakeCategory.POTENTIAL_CLIENT],
      reviewedAt: daysAgo(7),
      reviewedById: adminId,
    },
  })

  await prisma.pendingSubmission.create({
    data: {
      status: PendingStatus.DECLINED,
      fullName: "Unknown Vendor",
      email: seedEmail("intake.declined"),
      message: "Not a fit for our vendor network.",
      categories: [IntakeCategory.POTENTIAL_VENDOR],
      reviewedAt: daysAgo(14),
      reviewedById: adminId,
    },
  })

  await prisma.pendingSubmission.create({
    data: {
      status: PendingStatus.SPAM,
      fullName: "SEO Bot",
      email: seedEmail("intake.spam.archived"),
      message: "Guaranteed page one rankings!!!",
      categories: [IntakeCategory.ATTENDEE_GUEST],
      reviewedAt: daysAgo(3),
      reviewedById: adminId,
    },
  })
}

async function seedProjectsAndVendorWorkflow(
  adminId: string,
  clients: { id: string; slug: string }[],
  contacts: SeedContacts,
  juneteenthProjectId: string
) {
  const uac = clients.find((c) => c.slug === "uac")!
  const photo = await prisma.vendorSkillCategory.findUniqueOrThrow({ where: { key: "PHOTOGRAPHER" } })
  const av = await prisma.vendorSkillCategory.findUniqueOrThrow({ where: { key: "AV" } })

  const staleHours = 72
  const staleCutoff = new Date(Date.now() - (staleHours + 2) * 60 * 60 * 1000)

  const project = await prisma.eventProject.findUniqueOrThrow({ where: { id: juneteenthProjectId } })

  const broadcast = await prisma.vendorBroadcast.create({
    data: {
      projectId: project.id,
      categoryId: photo.id,
      subject: "[Seed] RFP — Juneteenth main stage photography",
      bodyHtml:
        "<p>Hi — HiTouch is sourcing a lead photographer for Juneteenth on the Parkway. Reply with rate card and availability.</p>",
      createdById: adminId,
      dispatchedAt: staleCutoff,
      staleAfterHours: staleHours,
      winnerContactId: contacts.photographer.id,
    },
  })

  const engagementWinner = await prisma.vendorEngagement.create({
    data: {
      broadcastId: broadcast.id,
      contactId: contacts.photographer.id,
      status: VendorEngagementStatus.SELECTED_WINNER,
      selectedAt: daysAgo(2),
      lastReplyAt: daysAgo(2),
      lastOpenedAt: daysAgo(2),
    },
  })

  const engagementStale = await prisma.vendorEngagement.create({
    data: {
      broadcastId: broadcast.id,
      contactId: contacts.photographerAlt.id,
      status: VendorEngagementStatus.REPLIED,
      lastReplyAt: staleCutoff,
      lastOpenedAt: staleCutoff,
    },
  })

  const engagementOpened = await prisma.vendorEngagement.create({
    data: {
      broadcastId: broadcast.id,
      contactId: contacts.catering.id,
      status: VendorEngagementStatus.OPENED,
      lastOpenedAt: daysAgo(1),
    },
  })

  await prisma.vendorEngagement.create({
    data: {
      broadcastId: broadcast.id,
      contactId: contacts.avVendor.id,
      status: VendorEngagementStatus.NOT_SELECTED,
    },
  })

  const outbound = await prisma.emailMessage.create({
    data: {
      engagementId: engagementStale.id,
      direction: EmailDirection.OUTBOUND,
      provider: "resend",
      subject: broadcast.subject,
      bodyHtml: broadcast.bodyHtml,
      sentAt: staleCutoff,
      toEmail: contacts.photographerAlt.email,
    },
  })

  await prisma.emailMessage.create({
    data: {
      engagementId: engagementWinner.id,
      direction: EmailDirection.INBOUND,
      provider: "resend",
      subject: `Re: ${broadcast.subject}`,
      bodyHtml: "<p>Available — $4,200 all-in including second shooter. W-9 attached.</p>",
      sentAt: daysAgo(2),
      toEmail: seedEmail("coordinator"),
    },
  })

  await prisma.emailEvent.createMany({
    data: [
      { messageId: outbound.id, type: EmailEventType.SENT, occurredAt: staleCutoff },
      { messageId: outbound.id, type: EmailEventType.DELIVERED, occurredAt: staleCutoff },
      {
        messageId: outbound.id,
        type: EmailEventType.OPENED,
        occurredAt: new Date(staleCutoff.getTime() + 3600000),
      },
    ],
  })

  await prisma.adminNotification.createMany({
    data: [
      {
        type: "vendor.stale_reply",
        title: "Stale vendor reply — Marcus Chen",
        body: "Reply received more than 72h ago on “[Seed] RFP — Juneteenth main stage photography”. Review before the window closes.",
        engagementId: engagementStale.id,
        meta: { ...SEED_TAG, broadcastId: broadcast.id, projectId: project.id },
      },
      {
        type: "vendor.winner_selected",
        title: "Winner selected — Aisha Brooks",
        body: "Photographer selected for [Seed] Juneteenth 2025 — main stage.",
        engagementId: engagementWinner.id,
        readAt: new Date(),
        meta: { ...SEED_TAG, broadcastId: broadcast.id },
      },
      {
        type: "intake.new",
        title: "New intake submission",
        body: "Taylor Morgan — West Philly Youth Network (pending approval).",
        readAt: null,
        meta: SEED_TAG,
      },
    ],
  })

  const uacProject = await prisma.eventProject.create({
    data: {
      name: "[Seed] UAC anniversary breakfast",
      hiTouchClientId: uac.id,
      startsAt: new Date("2025-11-12T13:00:00Z"),
      notes: "[Internal] Empty project — create a broadcast from project detail to test Resend.",
    },
  })

  const avBroadcast = await prisma.vendorBroadcast.create({
    data: {
      projectId: uacProject.id,
      categoryId: av.id,
      subject: "[Seed] RFP — UAC breakfast A/V",
      bodyHtml: "<p>Seeking A/V for 200-person breakfast program. Load-in 6am.</p>",
      createdById: adminId,
      dispatchedAt: daysAgo(1),
      staleAfterHours: 48,
    },
  })

  await prisma.vendorEngagement.createMany({
    data: [
      {
        broadcastId: avBroadcast.id,
        contactId: contacts.avVendor.id,
        status: VendorEngagementStatus.REPLIED,
        lastReplyAt: daysAgo(1),
      },
      {
        broadcastId: avBroadcast.id,
        contactId: contacts.catering.id,
        status: VendorEngagementStatus.SENT,
      },
    ],
  })

  await prisma.eventProject.create({
    data: {
      name: "[Seed] Frankford fall festival (planning)",
      hiTouchClientId: clients.find((c) => c.slug === "frankford-cdc")!.id,
      startsAt: new Date("2026-09-20T15:00:00Z"),
      notes: "[Internal] No broadcast yet — use for project list UI.",
    },
  })

  void engagementOpened
}

async function seedAuditSamples(adminId: string, contacts: SeedContacts) {
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: adminId,
        action: "portal.invite",
        entityType: "Contact",
        entityId: contacts.photographer.id,
        payload: {
          ...SEED_TAG,
          kind: "VENDOR",
          email: contacts.photographer.email,
          actorRole: "COORDINATOR",
        },
        createdAt: daysAgo(14),
      },
      {
        actorId: adminId,
        action: "portal.invite",
        entityType: "Contact",
        entityId: contacts.clientLead.id,
        payload: {
          ...SEED_TAG,
          kind: "CLIENT",
          email: contacts.clientLead.email,
          actorRole: "COORDINATOR",
        },
        createdAt: daysAgo(12),
      },
      {
        actorId: adminId,
        action: "pending.approve",
        entityType: "PendingSubmission",
        entityId: "seed-pending-approved",
        payload: { ...SEED_TAG, email: contacts.clientLead.email, actorRole: "SUPERADMIN" },
        createdAt: daysAgo(7),
      },
      {
        actorId: adminId,
        action: "vendor_review.create",
        entityType: "Contact",
        entityId: contacts.photographer.id,
        payload: { ...SEED_TAG, rating: 5, actorRole: "COORDINATOR" },
        createdAt: daysAgo(10),
      },
      {
        actorId: adminId,
        action: "projects.winner",
        entityType: "VendorBroadcast",
        entityId: "seed-broadcast-winner",
        payload: {
          ...SEED_TAG,
          winnerContactId: contacts.photographer.id,
          actorRole: "COORDINATOR",
        },
        createdAt: daysAgo(2),
      },
    ],
  })
}

/** Pin newest portfolio entries to the top of the public archive / homepage carousel. */
function caseStudySortDate(slug: string, index: number): Date {
  const pinnedDayOffset: Record<string, number> = {
    "free-library-community-impact-week-2025": 0,
  }
  const dayOffset = pinnedDayOffset[slug] ?? index + 3
  const sortDate = new Date(Date.UTC(2025, 10, 30))
  sortDate.setUTCDate(sortDate.getUTCDate() - dayOffset)
  return sortDate
}

async function seedCaseStudies() {
  let i = 0
  for (const p of featuredProjects) {
    const sortDate = caseStudySortDate(p.slug, i)
    i += 1
    await prisma.caseStudy.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        category: p.category,
        listDescription: p.listDescription,
        body: p.body,
        heroImageUrl: p.image,
        sortDate,
        published: true,
      },
      update: {
        title: p.title,
        category: p.category,
        listDescription: p.listDescription,
        body: p.body,
        heroImageUrl: p.image,
        sortDate,
        published: true,
      },
    })
  }

  // Retire duplicate / superseded Free Library portfolio slugs.
  await prisma.caseStudy.updateMany({
    where: {
      slug: {
        in: [
          "free-library-community-impact-week",
          "free-library-community-impact-awards-2025",
        ],
      },
    },
    data: { published: false },
  })

  await prisma.caseStudy.upsert({
    where: { slug: "seed-draft-case-study" },
    create: {
      slug: "seed-draft-case-study",
      title: "[Seed] Draft case study (unpublished)",
      category: "Internal sample",
      listDescription: "Toggle publish in admin to see it on the public archive.",
      body: ["This entry is only for testing the published toggle."],
      heroImageUrl: "/images/featured-work/placeholder.jpg",
      sortDate: new Date("2024-01-01"),
      published: false,
    },
    update: {
      title: "[Seed] Draft case study (unpublished)",
      published: false,
    },
  })
}

async function seedHubspotCrm(
  adminId: string,
  contacts: SeedContacts,
  clients: { id: string; slug: string }[],
  juneteenthProjectId: string
) {
  const uac = clients.find((c) => c.slug === "uac")!
  const companyC = await prisma.company.findFirstOrThrow({ where: { name: "[Seed] Neighborhood Arts Collective" } })

  const dealWon = await prisma.deal.create({
    data: {
      name: "[Seed] UAC annual gala — full production",
      stage: DealStage.CLOSED_WON,
      amount: 85000,
      contactId: contacts.clientLead.id,
      companyId: companyC.id,
      hiTouchClientId: uac.id,
      projectId: juneteenthProjectId,
      ownerId: adminId,
      closeDate: daysAgo(30),
      notes: "[Internal] Won after RFP — reference for pipeline reporting.",
    },
  })

  await prisma.deal.createMany({
    data: [
      {
        name: "[Seed] West Philly block party proposal",
        stage: DealStage.PROPOSAL,
        amount: 22000,
        contactId: contacts.clientLead.id,
        companyId: companyC.id,
        hiTouchClientId: uac.id,
        ownerId: adminId,
        closeDate: new Date(Date.now() + 21 * 86400000),
      },
      {
        name: "[Seed] PECO × UAC community week",
        stage: DealStage.QUALIFIED,
        amount: 45000,
        contactId: contacts.clientUac.id,
        ownerId: adminId,
        closeDate: new Date(Date.now() + 45 * 86400000),
      },
      {
        name: "[Seed] VestedIn investor breakfast",
        stage: DealStage.NEGOTIATION,
        amount: 12000,
        contactId: contacts.clientVested.id,
        ownerId: adminId,
      },
      {
        name: "[Seed] Lost — competitor AV package",
        stage: DealStage.CLOSED_LOST,
        amount: 18000,
        contactId: contacts.clientLead.id,
        ownerId: adminId,
      },
    ],
  })

  await prisma.crmTask.createMany({
    data: [
      {
        title: "[Seed] Send proposal follow-up — block party",
        status: TaskStatus.NOT_STARTED,
        priority: TaskPriority.HIGH,
        dueAt: daysAgo(-1),
        contactId: contacts.clientLead.id,
        dealId: dealWon.id,
        assignedToId: adminId,
        createdById: adminId,
      },
      {
        title: "[Seed] Schedule discovery call — PECO UAC",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueAt: daysAgo(-3),
        contactId: contacts.clientUac.id,
        assignedToId: adminId,
        createdById: adminId,
      },
      {
        title: "[Seed] Overdue: confirm catering headcount",
        status: TaskStatus.NOT_STARTED,
        priority: TaskPriority.HIGH,
        dueAt: daysAgo(2),
        contactId: contacts.catering.id,
        assignedToId: adminId,
        createdById: adminId,
      },
      {
        title: "[Seed] Completed: Juneteenth vendor winner notify",
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.MEDIUM,
        completedAt: daysAgo(2),
        contactId: contacts.photographer.id,
        assignedToId: adminId,
        createdById: adminId,
      },
    ],
  })

  const vendorList = await prisma.contactList.create({
    data: {
      name: "[Seed] Active photographers",
      description: "Vendors with photography skill — sample static list.",
      createdById: adminId,
    },
  })

  const clientList = await prisma.contactList.create({
    data: {
      name: "[Seed] UAC program contacts",
      description: "Client reps tagged to Urban Affairs Coalition.",
      createdById: adminId,
    },
  })

  await prisma.contactListMember.createMany({
    data: [
      { listId: vendorList.id, contactId: contacts.photographer.id },
      { listId: vendorList.id, contactId: contacts.photographerAlt.id },
      { listId: clientList.id, contactId: contacts.clientLead.id },
      { listId: clientList.id, contactId: contacts.clientUac.id },
    ],
  })
}

function printSeedGuide() {
  const lines = [
    "",
    "══════════════════════════════════════════════════════════════",
    "  HiTouch seed data loaded — full test samples",
    "══════════════════════════════════════════════════════════════",
    "",
    "  ADMIN (add to ADMIN_BOOTSTRAP_EMAILS or use dev password login)",
    "  ─────────────────────────────────────────────────────────────",
    `  Coordinator (limited):  ${seedEmail("coordinator")}`,
    `  Master Admin (full):    ${seedEmail("superadmin")}`,
    "",
    "  PORTAL magic link (/portal/login) — needs RESEND_API_KEY",
    "  ─────────────────────────────────────────────────────────────",
    `  Vendor inbox + reviews: ${seedEmail("vendor.photographer")}`,
    `  Vendor (stale reply):   ${seedEmail("vendor.photographer.alt")}`,
    `  Client workspace:       ${seedEmail("client.lead")}`,
    `  Client UAC slice:       ${seedEmail("client.peco.uac")}`,
    `  Client VestedIn slice:  ${seedEmail("client.peco.vested")}`,
    "",
    "  ADMIN PAGES",
    "  ───────────",
    "  Pending       → 4 pending + approved + declined + spam rows",
    "  Contacts      → 4 vendors, 3 client reps (PECO UAC/VestedIn split)",
    "  Companies     → 5 [Seed] companies + master timeline",
    "  HiTouch clients → 5 org tags",
    "  Projects      → Juneteenth (broadcast/winner/stale), UAC breakfast, Frankford",
    "  Notifications → stale reply, winner selected, new intake",
    "  Audit log     → portal.invite, pending.approve, vendor_review, winner",
    "  Team          → coordinator + superadmin seed users",
    "  Case studies  → featured work + unpublished draft",
    "  Deals         → /admin/deals pipeline (5 sample deals)",
    "  Tasks         → /admin/tasks (due today, overdue, completed)",
    "  Lists         → /admin/lists (vendors + UAC contacts)",
    "",
    "  WHAT TO TEST",
    "  ─────────────",
    "  • Coordinator vs superadmin RBAC (pending approve, audit, clients)",
    "  • Vendor Google-style reviews (public) vs internal notes on contact",
    "  • Client portal: switch UAC vs VestedIn tabs — same company, different slices",
    "  • Vendor portal: opportunities inbox + performance reviews",
    "  • Token proposal URL from vendor inbox (needs TRACKING_SECRET in .env)",
    "  • HubSpot CRM: /admin/deals kanban, /admin/tasks, /admin/lists",
    "",
    "  Re-run anytime: npm run db:seed",
    "",
  ]
  console.info(lines.join("\n"))
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add Neon URL to .env then run: npm run db:migrate && npm run db:seed")
    process.exit(1)
  }

  await wipeSeedData()
  await seedVendorSkills()
  const clients = await seedHiTouchClients()
  const staff = await seedStaffUsers()
  const { contacts, juneteenthProjectId } = await seedCompaniesAndContacts(clients, staff.coordinator.id)
  await seedPortalAccounts(contacts)
  await seedPendingIntake(staff.superadmin.id)
  if (juneteenthProjectId) {
    await seedProjectsAndVendorWorkflow(staff.coordinator.id, clients, contacts, juneteenthProjectId)
    await seedHubspotCrm(staff.coordinator.id, contacts, clients, juneteenthProjectId)
  }
  await seedAuditSamples(staff.coordinator.id, contacts)
  await seedCaseStudies()

  printSeedGuide()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
