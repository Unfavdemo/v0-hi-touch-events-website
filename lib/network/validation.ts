import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Valid email required").transform((v) => v.toLowerCase()),
  password: z.string().min(1, "Password required"),
});

const emailField = z
  .string()
  .trim()
  .email("Valid email required")
  .transform((v) => v.toLowerCase());

const passwordField = z.string().min(8, "Password must be at least 8 characters");

const optionalTrimmed = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v ? v : undefined));

const phoneField = z
  .string()
  .trim()
  .min(7, "Enter a phone number we can call or text")
  .max(40);

const mailingAddressField = z
  .string()
  .trim()
  .min(8, "Enter a street address, city, and ZIP")
  .max(500);

const websiteField = z
  .string()
  .trim()
  .max(300)
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine(
    (v) => v === undefined || /^https?:\/\//i.test(v) || /^[\w.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(v),
    "Enter a website like yourstudio.com",
  );

export const socialLinksSchema = z.object({
  instagram: optionalTrimmed,
  facebook: optionalTrimmed,
  tiktok: optionalTrimmed,
  linkedin: optionalTrimmed,
  email: optionalTrimmed,
  website: websiteField,
});

export const partnerRegisterSchema = z.object({
  companyName: z.string().trim().min(2, "Company name required").max(200),
  contactPerson: z.string().trim().min(2, "Contact person required").max(200),
  email: emailField,
  phone: phoneField,
  mailingAddress: mailingAddressField,
  website: websiteField,
  bio: z.string().trim().max(2000).optional().transform((v) => (v ? v : undefined)),
  password: passwordField,
});

export const freelancerRegisterSchema = z
  .object({
    type: z.enum(["INDIVIDUAL", "BUSINESS"]),
    name: z.string().trim().min(2, "Name required").max(200),
    email: emailField,
    phone: phoneField,
    mailingAddress: mailingAddressField,
    bio: z.string().trim().max(2000).optional().transform((v) => (v ? v : undefined)),
    password: passwordField,
    companyName: optionalTrimmed,
    taxIdLast4: z
      .string()
      .trim()
      .regex(/^\d{4}$/, "Enter the last 4 digits"),
    socialLinks: socialLinksSchema,
    categoryTagIds: z.array(z.string().uuid()).min(1, "Pick at least one skill"),
    tier: z.enum(["STANDARD", "PRO"]),
    acceptAgreement: z.preprocess(
      (v) => (v === "1" ? "1" : undefined),
      z.literal("1", {
        message: "Please accept the vendor agreement",
      }),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.type === "BUSINESS" && !data.companyName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["companyName"],
        message: "Business name required",
      });
    }
  });

export type FreelancerRegisterInput = z.infer<typeof freelancerRegisterSchema>;
export type PartnerRegisterInput = z.infer<typeof partnerRegisterSchema>;

export const jobSchema = z
  .object({
    title: z.string().trim().min(3, "Title required").max(200),
    description: z
      .string()
      .trim()
      .min(10, "Add a short description so vendors know what's needed")
      .max(5000),
    categoryTagId: z.string().uuid("Pick a category"),
    payRate: z.coerce.number().positive("Enter a pay rate above $0").max(1_000_000),
    location: z.string().trim().min(2, "Add a location").max(300),
    setupTime: z.coerce.date({ message: "Pick a setup arrival time" }),
    eventStartTime: z.coerce.date({ message: "Pick when the opportunity starts" }),
    eventEndTime: z.coerce.date({ message: "Pick when the opportunity ends" }),
    breakdownTime: z.coerce.date({ message: "Pick a breakdown time" }),
    isOpenBidding: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.setupTime > data.eventStartTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["setupTime"],
        message: "Setup must be at or before the opportunity start",
      });
    }
    if (data.eventStartTime >= data.eventEndTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["eventEndTime"],
        message: "Live end must be after live start",
      });
    }
    if (data.breakdownTime < data.eventEndTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["breakdownTime"],
        message: "Breakdown must be at or after the opportunity end",
      });
    }
  });

export type JobInput = z.infer<typeof jobSchema>;

export const partnerEventSchema = z.object({
  name: z.string().trim().min(2, "Event name required").max(200),
  description: z.string().trim().max(5000).optional(),
  location: z.string().trim().max(300).optional(),
  applicationCloseAt: z.coerce.date().optional(),
  outreachAudience: z.enum(["ALL_VENDORS", "INVITED_ONLY"]).optional(),
  sendInitialOutreach: z.boolean().optional(),
});

export const partnerEventDetailsSchema = z
  .object({
    eventId: z.string().uuid(),
    message: z.string().trim().min(3, "Write the details vendors need").max(4000),
    sendInApp: z.boolean().optional(),
    sendEmail: z.boolean().optional(),
    sendSms: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.sendInApp && !data.sendEmail && !data.sendSms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sendInApp"],
        message: "Pick at least one delivery channel.",
      });
    }
  });

export const bidSchema = z.object({
  amount: z.coerce.number().positive("Enter a quote above $0").max(1_000_000),
  notes: z.string().trim().max(2000).optional().transform((v) => (v ? v : undefined)),
});

export const reviewSchema = z.object({
  stars: z.coerce.number().int().min(1, "Pick 1 to 5 stars").max(5, "Pick 1 to 5 stars"),
  feedback: z.string().trim().min(3, "Add a few words about how it went").max(3000),
});

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name required").max(200),
  phone: phoneField,
  mailingAddress: mailingAddressField,
  bio: z.string().trim().max(2000).optional().transform((v) => (v ? v : undefined)),
  companyName: optionalTrimmed,
  contactEmail: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v ? v.toLowerCase() : undefined))
    .refine((v) => v === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: "Enter a valid email",
    }),
  instagram: optionalTrimmed,
  facebook: optionalTrimmed,
  tiktok: optionalTrimmed,
  linkedin: optionalTrimmed,
  website: websiteField,
  categoryTagIds: z.array(z.string().uuid()).min(1, "Pick at least one skill"),
  defaultRate: z
    .union([z.literal(""), z.coerce.number().positive().max(1_000_000)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
  travelRadiusMiles: z
    .union([z.literal(""), z.coerce.number().int().min(0).max(500)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
  crewSize: z
    .union([z.literal(""), z.coerce.number().int().min(0).max(500)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
  equipmentNotes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const partnerProfileUpdateSchema = z.object({
  companyName: z.string().trim().min(2, "Company name required").max(200),
  contactPerson: z.string().trim().min(2, "Contact person required").max(200),
  phone: phoneField,
  mailingAddress: mailingAddressField,
  bio: z.string().trim().max(2000).optional().transform((v) => (v ? v : undefined)),
  website: websiteField,
});

export type PartnerProfileUpdateInput = z.infer<typeof partnerProfileUpdateSchema>;

export const vendorPaySchema = z.object({
  jobId: z.string().uuid(),
  method: z.enum(["CHECK", "ACH", "CARD", "CASH", "OTHER"]),
  amount: z.coerce.number().positive("Enter the amount you paid"),
  note: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export const eventAdminCreateSchema = z.object({
  name: z.string().trim().min(2, "Name required").max(200),
  email: emailField,
  password: passwordField,
});

export const savedVenueSchema = z.object({
  name: z.string().trim().min(2, "Venue name required").max(120),
  address: mailingAddressField,
  notes: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => (v ? v : undefined)),
  contactName: optionalTrimmed,
  contactPhone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || v.replace(/\D/g, "").length >= 7, {
      message: "Enter a phone number we can call",
    }),
});

export type SavedVenueInput = z.infer<typeof savedVenueSchema>;

export const incidentSchema = z.object({
  vendorId: z.string().uuid("Pick a vendor"),
  jobId: z.string().uuid().optional(),
  kind: z.enum(["NO_SHOW", "COMPLAINT", "DAMAGE", "OTHER"]),
  notes: z.string().trim().min(3, "Add a short note").max(4000),
  flagForDismissal: z.boolean().optional(),
});

export const incidentUpdateSchema = z.object({
  incidentId: z.string().uuid(),
  jobId: z.union([z.string().uuid(), z.literal("")]).optional(),
  kind: z.enum(["NO_SHOW", "COMPLAINT", "DAMAGE", "OTHER"]),
  notes: z.string().trim().min(3, "Add a short note").max(4000),
});

export const announcementOpportunityScopeSchema = z.enum([
  "hired",
  "invited",
  "applicants",
  "all_vendors",
  "partner",
  "everyone",
]);

export const announcementSchema = z
  .object({
    audience: z.enum(["vendors", "partners", "skill", "membership", "opportunity"]),
    skillTagId: z.string().uuid().optional(),
    membershipStatus: z
      .enum(["INCOMPLETE", "TRIALING", "ACTIVE", "PAST_DUE", "CANCELED"])
      .optional(),
    jobId: z.string().uuid().optional(),
    opportunityScope: announcementOpportunityScopeSchema.optional(),
    message: z.string().trim().min(3, "Write a short message").max(2000),
    sendInApp: z.boolean().optional(),
    sendEmail: z.boolean().optional(),
    sendSms: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.sendInApp && !data.sendEmail && !data.sendSms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sendInApp"],
        message: "Pick at least one delivery channel.",
      });
    }
    if (data.audience === "skill" && !data.skillTagId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["skillTagId"],
        message: "Pick a skill for that audience.",
      });
    }
    if (data.audience === "membership" && !data.membershipStatus) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["membershipStatus"],
        message: "Pick a membership status for that audience.",
      });
    }
    if (data.audience === "opportunity") {
      if (!data.jobId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["jobId"],
          message: "Pick an opportunity.",
        });
      }
      if (!data.opportunityScope) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["opportunityScope"],
          message: "Pick who on that opportunity should receive this.",
        });
      }
    }
  });

export const categoryTagSchema = z.object({
  name: z.string().trim().min(2, "Name required").max(80),
});

export const platformSettingsSchema = z.object({
  warningThreshold: z.coerce.number().min(1).max(5),
  dismissalThreshold: z.coerce.number().min(1).max(5),
  inviteTarget: z.coerce.number().int().min(1).max(50),
  sendMoreExtra: z.coerce.number().int().min(1).max(20),
});

export const partnerDocumentRequirementSchema = z.object({
  label: z.string().trim().min(2, "Name this requirement").max(120),
  description: z.string().trim().max(400).optional(),
});

export const jobDocumentRequirementSchema = z.object({
  label: z.string().trim().min(2, "Name the required document").max(120),
  description: z.string().trim().max(400).optional(),
});

export const jobMessageSchema = z.object({
  jobId: z.string().uuid(),
  body: z.string().trim().min(1, "Write a short message").max(2000),
});

export const vendorBlackoutSchema = z
  .object({
    startAt: z.coerce.date({ message: "Pick a start date" }),
    endAt: z.coerce.date({ message: "Pick an end date" }),
    label: optionalTrimmed,
  })
  .superRefine((data, ctx) => {
    if (data.endAt < data.startAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endAt"],
        message: "End must be on or after start",
      });
    }
  });

export const vendorCrewMemberSchema = z.object({
  name: z.string().trim().min(2, "Name required").max(120),
  role: z.string().trim().min(2, "Role required").max(120),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || v.replace(/\D/g, "").length >= 7, {
      message: "Enter a phone number we can call",
    }),
});

export const vendorSettingsSchema = z.object({
  timezone: z.string().trim().min(2, "Pick a timezone").max(80),
  emergencyContact: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v ? v : undefined)),
  invites: z.boolean(),
  hired: z.boolean(),
  messages: z.boolean(),
  payments: z.boolean(),
  announcements: z.boolean(),
});

export const vendorNotificationPrefsSchema = z.object({
  invites: z.boolean(),
  hired: z.boolean(),
  messages: z.boolean(),
  payments: z.boolean(),
  announcements: z.boolean(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordField,
    confirmPassword: passwordField,
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "New passwords don't match",
      });
    }
  });

