import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaClient } from "@/lib/generated/network-prisma/client";
import { normalizePgConnectionString } from "@/lib/db-connection";
import { topUpInvites } from "@/lib/network/matching";
import {
  ensurePayoutTestFixture,
  PAYOUT_TEST_JOB_TITLE,
  resetPayoutTestJob,
} from "@/lib/network/payout-test";
import { VENDOR_AGREEMENT_VERSION } from "@/lib/network/vendor-agreement";
import { writeDemoDocument } from "@/lib/network/vendor-docs";
import { writeDemoW9 } from "@/lib/network/w9";

const connectionString = normalizePgConnectionString(
  process.env.NETWORK_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim() || "",
);
if (!connectionString) {
  throw new Error("NETWORK_DATABASE_URL (or DATABASE_URL) is required to seed the network DB.");
}
const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const CATEGORY_TAGS = [
  "DJ",
  "Catering",
  "Photography",
  "Videography",
  "AV & Production",
  "Event Staffing",
  "Security",
  "Waste Management",
  "Decor & Design",
  "Transportation",
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function daysFromNow(days: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  // Category tags
  const tags = new Map<string, string>();
  for (const name of CATEGORY_TAGS) {
    const tag = await prisma.categoryTag.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name) },
    });
    tags.set(name, tag.id);
  }
  console.log(`Seeded ${tags.size} category tags`);

  // Admin
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@hitouch.io";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "hitouch-admin-2026";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", status: "APPROVED", adminScope: "SUPER" },
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
      adminScope: "SUPER",
      status: "APPROVED",
      profile: {
        create: { name: "HiTouch Solutions Operations", type: "BUSINESS", companyName: "HiTouch Solutions" },
      },
    },
  });
  console.log(`Admin ready: ${admin.email}`);

  const eventAdmin = await prisma.user.upsert({
    where: { email: "events.admin@hitouch.io" },
    update: { role: "ADMIN", status: "APPROVED", adminScope: "EVENT" },
    create: {
      email: "events.admin@hitouch.io",
      passwordHash: await bcrypt.hash("event-admin-2026", 10),
      role: "ADMIN",
      adminScope: "EVENT",
      status: "APPROVED",
      profile: {
        create: { name: "Jordan Lee", type: "INDIVIDUAL" },
      },
    },
  });
  console.log(`Event admin ready: ${eventAdmin.email}`);

  // Demo partner (approved)
  const partner = await prisma.user.upsert({
    where: { email: "partner@vestedin.example" },
    update: {},
    create: {
      email: "partner@vestedin.example",
      passwordHash: await bcrypt.hash("partner-demo-2026", 10),
      role: "PARTNER",
      status: "APPROVED",
      profile: {
        create: {
          name: "Dana Reyes",
          companyName: "Vested In Events",
          contactPerson: "Dana Reyes",
          phone: "215-555-0142",
          mailingAddress: "1800 Arch St, Suite 400, Philadelphia, PA 19103",
          type: "BUSINESS",
          bio: "Corporate event production across the tri-state area.",
          socialLinks: { website: "https://vestedinevents.example" },
        },
      },
    },
  });
  await prisma.profile.update({
    where: { userId: partner.id },
    data: {
      mailingAddress: "1800 Arch St, Suite 400, Philadelphia, PA 19103",
      phone: "215-555-0142",
      socialLinks: { website: "https://vestedinevents.example" },
    },
  });

  // Demo freelancers (approved, beta members)
  const freelancerSpecs = [
    {
      email: "marcus.dj@example.com",
      name: "Marcus Bell",
      type: "INDIVIDUAL" as const,
      phone: "215-555-0198",
      mailingAddress: "1420 Walnut St, Philadelphia, PA 19102",
      tags: ["DJ", "AV & Production"],
      bio: "Open-format DJ with 10 years on corporate galas, weddings, and brand activations across the tri-state. House-to-hip-hop close-outs, wireless mic support, and a compact Pioneer setup that fits most ballrooms. Based in Philadelphia; routinely staffs Center City, King of Prussia, and Wilmington.",
      socialLinks: { instagram: "@marcusbelldj", tiktok: "@marcusbelldj", linkedin: "marcus-bell-dj", email: "marcus.dj@example.com", website: "marcusbelldj.com" },
      headshotUrl: "/portraits/marcus-bell.jpg",
    },
    {
      email: "sofia.catering@example.com",
      name: "Sofia Marin",
      type: "BUSINESS" as const,
      companyName: "Marin Catering Co.",
      phone: "267-555-0114",
      mailingAddress: "901 S 9th St, Philadelphia, PA 19147",
      tags: ["Catering", "Event Staffing"],
      bio: "Full-service catering for events from 20 to 2,000 guests — passed appetizers, stations, plated dinners, and late-night bites. Uniformed staff, dietary accommodations, and a kitchen that has run galas for PECO, UAC, and Vested In. Based in South Philadelphia with a regional service radius.",
      socialLinks: { instagram: "@marincatering", facebook: "MarinCateringCo", linkedin: "company/marin-catering", email: "sofia.catering@example.com", website: "marincatering.example" },
      logoUrl: "/portraits/sofia-marin.jpg",
    },
    {
      email: "leo.photo@example.com",
      name: "Leo Tran",
      type: "INDIVIDUAL" as const,
      phone: "610-555-0172",
      mailingAddress: "14 E Lancaster Ave, Ardmore, PA 19003",
      tags: ["Photography", "Videography"],
      bio: "Event photographer and videographer. Stage coverage, candids, and executive headshots with edited selects in 72 hours. Dual-shooter teams available for festivals and award nights. Shot Wadsworth Day, UAC breakfasts, and private vow renewals.",
      socialLinks: { instagram: "@leotranphoto", tiktok: "@leotran.frames", linkedin: "leo-tran-photo", email: "leo.photo@example.com", website: "leotran.photo" },
      headshotUrl: "/portraits/leo-tran.jpg",
    },
    {
      email: "dana.dj@example.com",
      name: "Dana Brooks",
      type: "INDIVIDUAL" as const,
      phone: "215-555-0131",
      mailingAddress: "2300 Walnut St, Philadelphia, PA 19103",
      tags: ["DJ"],
      bio: "Wedding and nonprofit gala DJ. Clean edits, bilingual MC work, and a lighting package for dance floors up to 300.",
      socialLinks: { instagram: "@danabrooksdj", email: "dana.dj@example.com" },
    },
    {
      email: "jaylen.av@example.com",
      name: "Jaylen Carter",
      type: "INDIVIDUAL" as const,
      phone: "267-555-0177",
      mailingAddress: "4801 Baltimore Ave, Philadelphia, PA 19143",
      tags: ["DJ", "AV & Production"],
      bio: "DJ and A1 audio tech. Runs FOH for panels and keynotes, then flips to the dance floor after dinner.",
      socialLinks: { linkedin: "jaylen-carter-av", email: "jaylen.av@example.com" },
    },
    {
      email: "harbor.kitchen@example.com",
      name: "Andre Wallace",
      type: "BUSINESS" as const,
      companyName: "Harbor Street Kitchen",
      phone: "215-555-0150",
      mailingAddress: "1100 N Delaware Ave, Philadelphia, PA 19125",
      tags: ["Catering"],
      bio: "Chef-driven catering for corporate lunches, launches, and receptions up to 400. Seasonal menus and full service staff.",
      socialLinks: { instagram: "@harborstreetkitchen", email: "hello@harborstreet.example", website: "harborstreet.example" },
    },
    {
      email: "priya.photo@example.com",
      name: "Priya Shah",
      type: "INDIVIDUAL" as const,
      phone: "610-555-0119",
      mailingAddress: "200 W State St, Media, PA 19063",
      tags: ["Photography", "Videography"],
      bio: "Documentary-style event photographer and editor. Same-day social selects and sizzle reels for conferences.",
      socialLinks: { instagram: "@priyashahphoto", email: "priya.photo@example.com" },
    },
  ];

  const freelancers: { id: string; email: string }[] = [];
  for (const spec of freelancerSpecs) {
    const user = await prisma.user.upsert({
      where: { email: spec.email },
      update: {},
      create: {
        email: spec.email,
        passwordHash: await bcrypt.hash("freelancer-demo-2026", 10),
        role: "FREELANCER",
        status: "APPROVED",
        profile: {
          create: {
            name: spec.name,
            type: spec.type,
            phone: spec.phone,
            mailingAddress: spec.mailingAddress,
            companyName: "companyName" in spec ? spec.companyName : undefined,
            bio: spec.bio,
            taxIdType: spec.type === "INDIVIDUAL" ? "SSN" : "EIN",
            taxIdLast4: "1234",
            socialLinks: spec.socialLinks,
            headshotUrl: "headshotUrl" in spec ? spec.headshotUrl : undefined,
            logoUrl: "logoUrl" in spec ? spec.logoUrl : undefined,
            categoryTags: {
              connect: spec.tags.map((t) => ({ id: tags.get(t)! })),
            },
          },
        },
        membership: {
          create: { tier: "BETA_FREE", status: "ACTIVE" },
        },
      },
    });

    const existingPaper = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { w9Url: true },
    });
    const w9Url = existingPaper?.w9Url ?? (await writeDemoW9());

    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        name: spec.name,
        phone: spec.phone,
        mailingAddress: spec.mailingAddress,
        bio: spec.bio,
        companyName: "companyName" in spec ? spec.companyName : undefined,
        socialLinks: spec.socialLinks,
        headshotUrl: "headshotUrl" in spec ? spec.headshotUrl : undefined,
        logoUrl: "logoUrl" in spec ? spec.logoUrl : undefined,
        w9Url,
        vendorAgreementAcceptedAt: new Date(),
        vendorAgreementVersion: VENDOR_AGREEMENT_VERSION,
      },
    });

    const existingW9Doc = await prisma.vendorDocument.findFirst({
      where: { vendorId: user.id, kind: "W9" },
    });
    if (existingW9Doc) {
      await prisma.vendorDocument.update({
        where: { id: existingW9Doc.id },
        data: { storedKey: w9Url, label: "Form W-9" },
      });
    } else {
      await prisma.vendorDocument.create({
        data: { vendorId: user.id, kind: "W9", label: "Form W-9", storedKey: w9Url },
      });
    }
    const existingCoi = await prisma.vendorDocument.findFirst({
      where: { vendorId: user.id, kind: "COI" },
    });
    if (!existingCoi) {
      await prisma.vendorDocument.create({
        data: {
          vendorId: user.id,
          kind: "COI",
          label: "Certificate of insurance",
          storedKey: await writeDemoDocument("Certificate of insurance"),
        },
      });
    }

    freelancers.push({ id: user.id, email: user.email });
  }
  console.log(`Seeded ${freelancers.length} approved freelancers`);

  // A pending applicant for the admin queue
  const pending = await prisma.user.upsert({
    where: { email: "pending.vendor@example.com" },
    update: {},
    create: {
      email: "pending.vendor@example.com",
      passwordHash: await bcrypt.hash("pending-demo-2026", 10),
      role: "FREELANCER",
      status: "PENDING",
      profile: {
        create: {
          name: "Riley Quinn",
          type: "INDIVIDUAL",
          bio: "Stagehand and AV tech.",
          phone: "215-555-0166",
          mailingAddress: "4400 Chestnut St, Philadelphia, PA 19104",
          headshotUrl: "/portraits/riley-quinn.jpg",
          taxIdType: "SSN",
          taxIdLast4: "5678",
          categoryTags: { connect: [{ id: tags.get("AV & Production")! }] },
        },
      },
      membership: { create: { tier: "STANDARD", status: "INCOMPLETE" } },
    },
  });
  const pendingW9 =
    (
      await prisma.profile.findUnique({
        where: { userId: pending.id },
        select: { w9Url: true },
      })
    )?.w9Url ?? (await writeDemoW9());
  await prisma.profile.update({
    where: { userId: pending.id },
    data: {
      headshotUrl: "/portraits/riley-quinn.jpg",
      phone: "215-555-0166",
      mailingAddress: "4400 Chestnut St, Philadelphia, PA 19104",
      w9Url: pendingW9,
      vendorAgreementAcceptedAt: new Date(),
      vendorAgreementVersion: VENDOR_AGREEMENT_VERSION,
    },
  });
  const pendingW9Doc = await prisma.vendorDocument.findFirst({
    where: { vendorId: pending.id, kind: "W9" },
  });
  if (!pendingW9Doc) {
    await prisma.vendorDocument.create({
      data: {
        vendorId: pending.id,
        kind: "W9",
        label: "Form W-9",
        storedKey: pendingW9,
      },
    });
  }

  // Demo jobs
  const existingJobs = await prisma.jobOpportunity.count();
  if (existingJobs === 0) {
    await prisma.jobOpportunity.create({
      data: {
        title: "Corporate Gala — Open-Format DJ",
        description:
          "Black-tie corporate gala for 400 guests. Cocktail hour set, dinner ambiance, and a 2-hour dance floor close-out. House PA available; bring your own controller.",
        categoryTagId: tags.get("DJ")!,
        payRate: 850,
        location: "Philadelphia, PA — Center City ballroom",
        setupTime: daysFromNow(14, 15, 0),
        eventStartTime: daysFromNow(14, 18, 0),
        eventEndTime: daysFromNow(14, 23, 0),
        breakdownTime: daysFromNow(14, 23, 30),
        isOpenBidding: true,
        status: "ACTIVE",
        postedById: partner.id,
      },
    });
    await prisma.jobOpportunity.create({
      data: {
        title: "Product Launch — Passed Apps Catering",
        description:
          "Evening product launch for 150 guests. Passed appetizers and two stations. Staff of four minimum, uniforms required.",
        categoryTagId: tags.get("Catering")!,
        payRate: 3200,
        location: "King of Prussia, PA — showroom venue",
        setupTime: daysFromNow(21, 14, 30),
        eventStartTime: daysFromNow(21, 17, 30),
        eventEndTime: daysFromNow(21, 21, 0),
        breakdownTime: daysFromNow(21, 22, 0),
        isOpenBidding: true,
        status: "ACTIVE",
        postedById: partner.id,
      },
    });
    await prisma.jobOpportunity.create({
      data: {
        title: "Quarterly Town Hall — Event Photography",
        description:
          "Half-day corporate town hall. Candids, stage coverage, and executive headshots between sessions. Edited selects within 72 hours.",
        categoryTagId: tags.get("Photography")!,
        payRate: 600,
        location: "Wilmington, DE — HQ auditorium",
        setupTime: daysFromNow(10, 8, 0),
        eventStartTime: daysFromNow(10, 9, 0),
        eventEndTime: daysFromNow(10, 13, 0),
        breakdownTime: daysFromNow(10, 13, 30),
        isOpenBidding: false,
        status: "PENDING_APPROVAL",
        postedById: partner.id,
      },
    });
    console.log("Seeded 3 demo jobs");
  } else {
    console.log(`Jobs already present (${existingJobs}) — skipping job seed`);
  }

  const holidayTitle = "Holiday Party — DJ & Dance Floor";
  const holiday = await prisma.jobOpportunity.findFirst({ where: { title: holidayTitle } });
  if (!holiday) {
    await prisma.jobOpportunity.create({
      data: {
        title: holidayTitle,
        description:
          "Company holiday party for 250 guests. Cocktail-hour background set, then three hours of dance floor. Wireless mic for toasts. House lighting; DJ brings sound.",
        categoryTagId: tags.get("DJ")!,
        payRate: 900,
        location: "Philadelphia, PA — Old City event loft",
        setupTime: daysFromNow(30, 16, 0),
        eventStartTime: daysFromNow(30, 19, 0),
        eventEndTime: daysFromNow(30, 23, 30),
        breakdownTime: daysFromNow(31, 0, 30),
        isOpenBidding: false,
        status: "ACTIVE",
        postedById: partner.id,
      },
    });
    console.log(`Seeded live event "${holidayTitle}"`);
  }

  const liveJobs = await prisma.jobOpportunity.findMany({
    where: { status: "ACTIVE", invites: { none: {} } },
    select: { id: true, title: true },
  });
  for (const job of liveJobs) {
    const invited = await topUpInvites(job.id);
    console.log(`Invited ${invited.length} vendors to "${job.title}"`);
  }

  const delegateTarget =
    (await prisma.jobOpportunity.findFirst({ where: { title: holidayTitle } })) ??
    (await prisma.jobOpportunity.findFirst({ orderBy: { createdAt: "asc" } }));
  if (delegateTarget) {
    await prisma.eventDelegation.upsert({
      where: {
        jobId_adminId: { jobId: delegateTarget.id, adminId: eventAdmin.id },
      },
      update: {},
      create: {
        jobId: delegateTarget.id,
        adminId: eventAdmin.id,
        delegatedById: admin.id,
      },
    });
    console.log(`Delegated "${delegateTarget.title}" to ${eventAdmin.email}`);
  }

  const marcus = await prisma.user.findUnique({ where: { email: "marcus.dj@example.com" } });
  if (marcus) {
    await prisma.partnerVendor.upsert({
      where: { partnerId_vendorId: { partnerId: partner.id, vendorId: marcus.id } },
      create: { partnerId: partner.id, vendorId: marcus.id, favorite: true },
      update: {},
    });

    const paidTitle = "Client Appreciation — Open-Format DJ";
    const existingPaid = await prisma.jobOpportunity.findFirst({ where: { title: paidTitle } });
    if (!existingPaid) {
      await prisma.jobOpportunity.create({
        data: {
          title: paidTitle,
          description:
            "Annual thank-you mixer for 80 guests. Cocktail-hour set and a short dance-floor close.",
          categoryTagId: tags.get("DJ")!,
          payRate: 650,
          location: "Philadelphia, PA — Center City ballroom",
          setupTime: daysFromNow(-12, 16, 0),
          eventStartTime: daysFromNow(-12, 18, 0),
          eventEndTime: daysFromNow(-12, 22, 0),
          breakdownTime: daysFromNow(-12, 22, 30),
          isOpenBidding: false,
          status: "COMPLETED",
          postedById: partner.id,
          assignedFreelancerId: marcus.id,
          vendorPaidAt: daysFromNow(-5, 10, 0),
          vendorPayMethod: "CHECK",
          vendorPaidAmount: 650,
          vendorPayNote: "Check 1842 mailed",
          vendorArrivedAt: daysFromNow(-12, 16, 10),
          vendorWrappedAt: daysFromNow(-12, 22, 40),
        },
      });
      console.log(`Seeded paid event "${paidTitle}" for partner reports`);
    } else if (!existingPaid.vendorArrivedAt) {
      await prisma.jobOpportunity.update({
        where: { id: existingPaid.id },
        data: {
          vendorArrivedAt: daysFromNow(-12, 16, 10),
          vendorWrappedAt: daysFromNow(-12, 22, 40),
        },
      });
    }
  }

  {
    const payoutJob = await ensurePayoutTestFixture(prisma);
    await resetPayoutTestJob(prisma, payoutJob.id);
    console.log(`Payout test fixture ready (unpaid): "${PAYOUT_TEST_JOB_TITLE}"`);
  }

  await prisma.platformSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      warningThreshold: 3.5,
      dismissalThreshold: 3.0,
      inviteTarget: 5,
      sendMoreExtra: 3,
    },
    update: {},
  });

  const leo = await prisma.user.findUnique({ where: { email: "leo.photo@example.com" } });
  if (leo) {
    await prisma.membership.upsert({
      where: { userId: leo.id },
      create: { userId: leo.id, tier: "STANDARD", status: "PAST_DUE" },
      update: { status: "PAST_DUE", tier: "STANDARD" },
    });
    const unpaidTitle = "Board Retreat — Recap Photography";
    let unpaid = await prisma.jobOpportunity.findFirst({ where: { title: unpaidTitle } });
    if (!unpaid) {
      unpaid = await prisma.jobOpportunity.create({
        data: {
          title: unpaidTitle,
          description: "Half-day board retreat recap. Candids and a group portrait.",
          categoryTagId: tags.get("Photography")!,
          payRate: 550,
          location: "Wilmington, DE — HQ",
          setupTime: daysFromNow(-8, 8, 0),
          eventStartTime: daysFromNow(-8, 9, 0),
          eventEndTime: daysFromNow(-8, 13, 0),
          breakdownTime: daysFromNow(-8, 13, 30),
          isOpenBidding: false,
          status: "COMPLETED",
          postedById: partner.id,
          assignedFreelancerId: leo.id,
        },
      });
      console.log(`Seeded unpaid completed event "${unpaidTitle}"`);
    }
    if (unpaid) {
      const existingReview = await prisma.review.findFirst({
        where: { jobId: unpaid.id, reviewerId: admin.id },
      });
      if (!existingReview) {
        await prisma.review.create({
          data: {
            jobId: unpaid.id,
            freelancerId: leo.id,
            reviewerId: admin.id,
            reviewerType: "INTERNAL_ADMIN",
            stars: 4,
            feedback: "Solid coverage. Group portrait needed one more setup.",
          },
        });
      }
    }
  }

  if (marcus) {
    await prisma.vendorDocument.updateMany({
      where: { vendorId: marcus.id, kind: "COI" },
      data: { expiresAt: daysFromNow(12, 12, 0) },
    });
    const existingIncident = await prisma.incident.findFirst({
      where: { vendorId: marcus.id, notes: { contains: "late load-in" } },
    });
    if (!existingIncident) {
      await prisma.incident.create({
        data: {
          vendorId: marcus.id,
          jobId: delegateTarget?.id,
          reporterId: admin.id,
          kind: "COMPLAINT",
          notes: "Partner flagged a late load-in. Resolved on site; logged for pattern watch.",
        },
      });
    }
  }

  const venueSpecs = [
    {
      name: "Center City ballroom",
      address: "Philadelphia, PA — Center City ballroom",
      notes: "Load-in on 18th Street dock. Union house PA on stage.",
      contactName: "Front desk",
      contactPhone: "215-555-0100",
    },
    {
      name: "Old City event loft",
      address: "Philadelphia, PA — Old City event loft",
      notes: "Freight elevator off Church St. Street parking after 6pm.",
      contactName: "Building manager",
      contactPhone: "215-555-0166",
    },
  ];
  for (const spec of venueSpecs) {
    const existing = await prisma.savedVenue.findFirst({
      where: { partnerId: partner.id, name: spec.name },
    });
    if (!existing) {
      await prisma.savedVenue.create({ data: { partnerId: partner.id, ...spec } });
    }
  }

  const opsEmail = "ops@vestedin.example";
  let coordinator = await prisma.user.findUnique({ where: { email: opsEmail } });
  if (!coordinator) {
    coordinator = await prisma.user.create({
      data: {
        email: opsEmail,
        passwordHash: await bcrypt.hash("partner-ops-2026", 10),
        role: "PARTNER",
        status: "APPROVED",
        profile: {
          create: {
            name: "Alex Chen",
            type: "INDIVIDUAL",
            companyName: "Vested In Events",
            phone: "215-555-0188",
          },
        },
        partnerOrgSeat: {
          create: { ownerId: partner.id, role: "COORDINATOR" },
        },
      },
    });
    console.log(`Seeded coordinator ${opsEmail}`);
  } else {
    await prisma.partnerMember.upsert({
      where: { memberId: coordinator.id },
      create: { ownerId: partner.id, memberId: coordinator.id, role: "COORDINATOR" },
      update: { ownerId: partner.id, role: "COORDINATOR" },
    });
  }

  const threadJob = await prisma.jobOpportunity.findFirst({
    where: { title: "Client Appreciation — Open-Format DJ" },
  });
  if (threadJob && marcus) {
    const existingMsg = await prisma.jobMessage.findFirst({ where: { jobId: threadJob.id } });
    if (!existingMsg) {
      await prisma.jobMessage.create({
        data: {
          jobId: threadJob.id,
          senderId: partner.id,
          body: "Load-in is the 18th Street dock. Ask the front desk for the freight elevator key.",
        },
      });
      await prisma.jobMessage.create({
        data: {
          jobId: threadJob.id,
          senderId: marcus.id,
          body: "Got it — on site 10 minutes before setup. I'll text if the dock is blocked.",
        },
      });
    }
  }

  const sofia = await prisma.user.findUnique({ where: { email: "sofia.catering@example.com" } });
  if (sofia) {
    await prisma.profile.update({
      where: { userId: sofia.id },
      data: {
        defaultRate: 3200,
        travelRadiusMiles: 75,
        crewSize: 6,
        equipmentNotes: "Chafing stations, linens, and uniformed service staff included.",
      },
    });
    const existingBlackout = await prisma.vendorBlackout.findFirst({ where: { vendorId: sofia.id } });
    if (!existingBlackout) {
      await prisma.vendorBlackout.create({
        data: {
          vendorId: sofia.id,
          startAt: daysFromNow(45, 0, 0),
          endAt: daysFromNow(47, 23, 59),
          label: "Family vacation",
        },
      });
    }
    const existingPortfolio = await prisma.vendorDocument.findFirst({
      where: { vendorId: sofia.id, kind: "PORTFOLIO" },
    });
    if (!existingPortfolio) {
      await prisma.vendorDocument.create({
        data: {
          vendorId: sofia.id,
          kind: "PORTFOLIO",
          label: "Gala buffet setup",
          storedKey: await writeDemoDocument("Portfolio sample"),
        },
      });
    }
    let crewLead = await prisma.vendorCrewMember.findFirst({
      where: { vendorId: sofia.id, name: "Tanya Reyes" },
    });
    if (!crewLead) {
      crewLead = await prisma.vendorCrewMember.create({
        data: {
          vendorId: sofia.id,
          name: "Tanya Reyes",
          role: "Service captain",
          phone: "267-555-0199",
        },
      });
    }
    const cateringJob = await prisma.jobOpportunity.findFirst({
      where: { title: "Product Launch — Passed Apps Catering", status: "ACTIVE" },
    });
    if (cateringJob && crewLead) {
      const filled = await prisma.jobOpportunity.update({
        where: { id: cateringJob.id },
        data: {
          status: "FILLED",
          assignedFreelancerId: sofia.id,
        },
      });
      await prisma.jobCrewAssignment.upsert({
        where: { jobId_crewMemberId: { jobId: filled.id, crewMemberId: crewLead.id } },
        create: { jobId: filled.id, crewMemberId: crewLead.id, vendorId: sofia.id },
        update: {},
      });
    }
  }

  console.log("Seed complete.");
  console.log(`  Admin login:      ${adminEmail} / ${adminPassword}`);
  console.log("  Event admin:      events.admin@hitouch.io / event-admin-2026");
  console.log("  Partner login:    partner@vestedin.example / partner-demo-2026");
  console.log("  Coordinator:      ops@vestedin.example / partner-ops-2026");
  console.log("  Freelancer login: marcus.dj@example.com / freelancer-demo-2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
