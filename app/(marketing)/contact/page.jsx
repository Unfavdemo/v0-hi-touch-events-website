import { PageHero } from "@/components/page-hero"
import { InquiryForm } from "@/components/inquiry-form"
import { contact } from "@/lib/site"

export const metadata = {
  title: "Contact | HiTouch Enterprises Inc.",
  description: "Reach HiTouch for events, marketing, and luxury charter—Philadelphia and the region.",
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk"
        subtitle="Let's work together on something great—events, marketing, or luxury charter."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact", href: "/contact" },
        ]}
        variant="cinematic"
      />
      <section className="border-t border-border py-12 page-px sm:py-16">
        <div className="container mx-auto grid w-full min-w-0 max-w-full gap-10 sm:gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-10">
            <div>
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Events &amp; marketing
              </p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href={contact.emailHref} className="block break-words text-foreground hover:text-gold">
                    {contact.email}
                  </a>
                </li>
                <li>
                  <a href={contact.phoneHref} className="block text-foreground hover:text-gold">
                    {contact.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={contact.mainWeb}
                    className="text-foreground hover:text-gold"
                    target="_blank"
                    rel="noreferrer"
                  >
                    hitouchinc.com
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Luxury charter
              </p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href={contact.charterEmailHref} className="block break-words text-foreground hover:text-gold">
                    {contact.charterEmail}
                  </a>
                </li>
                <li>
                  <a href={contact.charterPhoneHref} className="block text-foreground hover:text-gold">
                    {contact.charterPhone}
                  </a>
                </li>
                <li>
                  <a
                    href={contact.charterWeb}
                    className="text-foreground hover:text-gold"
                    target="_blank"
                    rel="noreferrer"
                  >
                    hitouchluxurycharter.com
                  </a>
                </li>
              </ul>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {contact.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
          <div className="lg:col-span-8">
            <InquiryForm embedded />
          </div>
        </div>
      </section>
    </>
  )
}
