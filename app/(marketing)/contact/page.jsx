import { PageHero } from "@/components/page-hero"
import { contact, getInquiryMailtoHref } from "@/lib/site"

export const metadata = {
  title: "Contact | HiTouch Enterprises Inc.",
  description:
    "Email HiTouch for events, marketing, and partnerships—based in Philadelphia, PA, serving clients near and far.",
}

export default function ContactPage() {
  const eventsMailto = getInquiryMailtoHref()

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk"
        subtitle="Connect with us—let's work together on something great."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact", href: "/contact" },
        ]}
        variant="cinematic"
      />
      <section className="border-t border-border bg-background page-section-y page-px dark:bg-black">
        <div className="container mx-auto w-full min-w-0 max-w-full">
          <div className="mx-auto max-w-2xl">
            <a
              href={eventsMailto}
              className="font-display flex w-full items-center justify-center rounded-full border-2 border-brand bg-brand/10 px-8 py-5 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground transition-colors hover:bg-brand/20 sm:text-xs"
            >
              Connect with us
            </a>
            <p className="mt-6 text-center text-sm leading-relaxed text-muted-foreground">
              Opens your email app with a starter message—no form. Luxury charter quotes: use the link on our homepage.
            </p>
          </div>
          {contact.addressLines.length > 0 ? (
            <p className="mx-auto mt-12 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground">
              {contact.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </section>
    </>
  )
}
