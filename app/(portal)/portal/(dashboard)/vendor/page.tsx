import { PortalKind } from "@/lib/generated/prisma/client"
import { requirePortalSession } from "@/lib/portal-route-guard"
import { getVendorPortalInbox } from "@/lib/queries/vendor-portal-inbox"
import { getPublicVendorReviewsForContact } from "@/lib/queries/public-vendor-reviews"
import { VendorInbox } from "@/components/portal/vendor-inbox"
import { GoogleReviewCard } from "@/components/reviews/google-review-card"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Vendor opportunities | HiTouch",
  robots: { index: false, follow: false },
}

export default async function PortalVendorPage() {
  const { portal } = await requirePortalSession(PortalKind.VENDOR)
  const [engagements, reviews] = await Promise.all([
    getVendorPortalInbox(portal.contactId),
    getPublicVendorReviewsForContact(portal.contactId),
  ])

  return (
    <>
      <h1 className="font-display text-2xl font-normal uppercase tracking-tight">Opportunities</h1>
      <p className="mt-2 text-sm text-muted-foreground">Inbound project requests from HiTouch.</p>
      <div className="mt-8">
        <VendorInbox engagements={engagements} />
      </div>

      {reviews.length > 0 ? (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="font-display text-sm uppercase tracking-[0.28em] text-brand-ink">Your reviews</h2>
          <p className="mt-1 text-xs text-muted-foreground">Feedback from past HiTouch events.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {reviews.map((r) => (
              <GoogleReviewCard key={r.id} review={r} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
