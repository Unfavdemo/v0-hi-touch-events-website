import Link from "next/link"
import { PageHero } from "@/components/page-hero"
import { IntakeForm } from "@/components/intake-form"
import { buildPageMetadata } from "@/lib/seo-metadata"

export const metadata = {
  ...buildPageMetadata({
    title: "Intake | HiTouch Enterprises Inc.",
    description:
      "Reach HiTouch as a potential client, vendor, sponsor, guest, or partner — one form can flag multiple paths for our team.",
    path: "/intake",
  }),
}

export default function IntakePage() {
  return (
    <>
      <PageHero
        eyebrow="Connect"
        title="General intake"
        subtitle="Tell us who you are and how you’d like to work with HiTouch. Your submission is reviewed internally before it enters our CRM."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Intake", href: "/intake" },
        ]}
        variant="cinematic"
      />
      <section className="bg-background page-section-y dark:bg-black">
        <div className="container mx-auto page-px pb-20">
          <IntakeForm />
          <p className="mx-auto mt-10 max-w-xl text-center text-sm text-muted-foreground">
            Prefer email? You can still{" "}
            <Link href="/contact" className="text-brand-ink underline-offset-4 hover:underline">
              visit our contact page
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
