import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyProposalToken } from "@/lib/proposal-token"
import { recordVendorProposalReply } from "@/lib/actions/vendor"

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params
  const verified = verifyProposalToken(token)
  if (!verified) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 404 })
  }

  const engagement = await prisma.vendorEngagement.findUnique({
    where: { id: verified.engagementId },
    include: {
      contact: { select: { firstName: true, email: true } },
      broadcast: {
        include: {
          project: { select: { name: true } },
          category: { select: { label: true } },
        },
      },
    },
  })

  if (!engagement) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }

  return NextResponse.json({
    projectName: engagement.broadcast.project.name,
    category: engagement.broadcast.category.label,
    subject: engagement.broadcast.subject,
    status: engagement.status,
    replied: Boolean(engagement.lastReplyAt),
  })
}

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params
  const verified = verifyProposalToken(token)
  if (!verified) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 404 })
  }

  let body: { message?: string }
  try {
    body = (await request.json()) as { message?: string }
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 })
  }

  const message = typeof body.message === "string" ? body.message : ""
  if (message.length > 8000) {
    return NextResponse.json({ error: "Message too long." }, { status: 400 })
  }

  try {
    await recordVendorProposalReply(verified.engagementId, message)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Could not record reply." }, { status: 500 })
  }
}
