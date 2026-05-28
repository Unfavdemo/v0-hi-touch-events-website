"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"

const intakeCategorySchema = z.enum([
  "POTENTIAL_CLIENT",
  "POTENTIAL_VENDOR",
  "SPONSOR",
  "ATTENDEE_GUEST",
  "PARTNER_OR_FUTURE_EMPLOYEE",
])

const intakeSchema = z.object({
  fullName: z.string().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().max(50).optional().or(z.literal("")),
  organization: z.string().max(200).optional().or(z.literal("")),
  message: z.string().max(8000).optional().or(z.literal("")),
  categories: z.array(intakeCategorySchema).min(1),
  website: z.string().max(0).optional(),
})

export type IntakeResult = { ok: true } | { ok: false; error: string }

export async function submitIntakeForm(_prev: IntakeResult | undefined, formData: FormData): Promise<IntakeResult> {
  const website = String(formData.get("website") ?? "")
  if (website) return { ok: false, error: "Invalid submission." }

  const rawCats = formData.getAll("categories").map(String)
  const parsedCats = rawCats.filter((c): c is z.infer<typeof intakeCategorySchema> =>
    intakeCategorySchema.safeParse(c).success
  )

  const parsed = intakeSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    organization: String(formData.get("organization") ?? ""),
    message: String(formData.get("message") ?? ""),
    categories: parsedCats,
    website,
  })

  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again." }
  }

  if (!process.env.DATABASE_URL) {
    return { ok: false, error: "Submissions are temporarily unavailable." }
  }

  const emailLower = parsed.data.email.toLowerCase()
  const since = new Date(Date.now() - 15 * 60 * 1000)
  const recent = await prisma.pendingSubmission.count({
    where: { email: emailLower, createdAt: { gte: since } },
  })
  if (recent >= 3) {
    return { ok: false, error: "Too many submissions. Please wait before trying again." }
  }

  try {
    await prisma.pendingSubmission.create({
      data: {
        fullName: parsed.data.fullName,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone || null,
        organization: parsed.data.organization || null,
        message: parsed.data.message || null,
        categories: parsed.data.categories,
        meta: { source: "public_intake" },
      },
    })
    return { ok: true }
  } catch {
    return { ok: false, error: "Something went wrong. Please try again later." }
  }
}
