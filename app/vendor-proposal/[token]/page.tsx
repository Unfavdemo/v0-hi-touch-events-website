import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { verifyProposalToken } from "@/lib/proposal-token"
import { VendorProposalForm } from "@/components/vendor-proposal-form"

export const metadata = {
  title: "Vendor opportunity | HiTouch",
  robots: { index: false, follow: false },
}

export default async function VendorProposalPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const verified = verifyProposalToken(token)
  if (!verified) notFound()

  const engagement = await prisma.vendorEngagement.findUnique({
    where: { id: verified.engagementId },
    include: {
      broadcast: {
        include: {
          project: true,
          category: true,
        },
      },
    },
  })

  if (!engagement) notFound()

  return (
    <main className="mx-auto min-h-screen max-w-lg px-6 py-16">
      <p className="font-display text-[10px] uppercase tracking-[0.28em] text-muted-foreground">HiTouch vendor opportunity</p>
      <h1 className="font-display mt-4 text-2xl font-normal uppercase tracking-tight">
        {engagement.broadcast.project.name}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {engagement.broadcast.category.label} · {engagement.broadcast.subject}
      </p>
      {engagement.lastReplyAt ? (
        <p className="mt-8 rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
          Thank you — we already received your response on {engagement.lastReplyAt.toLocaleString()}.
        </p>
      ) : (
        <VendorProposalForm token={token} />
      )}
    </main>
  )
}
