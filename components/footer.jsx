import Image from "next/image"
import Link from "next/link"
import { Instagram, Twitter, Linkedin, Youtube, MapPin, Mail } from "lucide-react"
import { contact, whatsNewLinks } from "@/lib/site"

const socialLinks = [
  { name: "Instagram", icon: Instagram, href: contact.instagramUrl },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: contact.linkedinUrl },
  { name: "YouTube", icon: Youtube, href: contact.youtubeChannelUrl },
]

const colAbout = [
  { name: "About us", href: "/about-us" },
  { name: "Founders' story", href: "/founders-story" },
  { name: "Meet the team", href: "/meet-the-team" },
  { name: "Contact", href: "/contact" },
]

const legalLinks = [
  { name: "Privacy policy", href: "#" },
  { name: "Terms of service", href: "#" },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background pt-20 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] dark:bg-black page-px">
      <div className="container mx-auto w-full min-w-0 max-w-full">
        <div className="grid grid-cols-1 gap-14 border-b border-border pb-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Link href="/" className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="relative h-11 w-[64px] shrink-0 sm:h-12 sm:w-[72px]">
                <Image
                  src="/HiTouch_final.png"
                  alt="HiTouch Enterprises"
                  fill
                  className="object-contain object-left dark:brightness-0 dark:invert"
                  sizes="72px"
                />
              </span>
              <span className="font-display text-xl uppercase tracking-tight text-foreground sm:text-2xl">
                Enterprises
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Event production, luxury charter, and strategic marketing—high-quality, high-impact results for clients
              across the region.
            </p>
            <p className="font-display mt-8 text-[10px] font-normal uppercase tracking-[0.3em] text-muted-foreground">
              Follow us
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand-ink"
                  aria-label={social.name}
                  {...(social.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-3">
            <div>
              <h3 className="font-display text-[10px] font-normal uppercase tracking-[0.28em] text-brand-ink">About</h3>
              <ul className="mt-5 space-y-3">
                {colAbout.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-[10px] font-normal uppercase tracking-[0.28em] text-brand-ink">
                What&apos;s new
              </h3>
              <ul className="mt-5 space-y-3">
                {whatsNewLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="font-display text-[10px] font-normal uppercase tracking-[0.28em] text-brand-ink">
                Reach us
              </h3>
              <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
                <li>
                  <a href={contact.emailHref} className="block break-words hover:text-foreground">
                    {contact.email}
                  </a>
                </li>
                {contact.addressLines.length > 0 ? (
                  <li className="pt-2 leading-relaxed">
                    {contact.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 border-b border-border py-10 md:flex-row md:flex-wrap md:items-center md:justify-between">
          <div className="flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:gap-10">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 shrink-0 text-brand-ink" aria-hidden />
              <span>{contact.citiesLine}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-brand-ink" aria-hidden />
              <a href={contact.emailHref} className="min-w-0 break-words hover:text-foreground">
                {contact.email}
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 pt-10 md:flex-row">
          <div className="text-center text-sm text-muted-foreground md:text-left">
            <p>&copy; {new Date().getFullYear()} HiTouch Enterprises Inc. All rights reserved.</p>
            <p className="mt-2 text-xs text-muted-foreground/90">
              Website designed by{" "}
              <span className="text-muted-foreground">DemoTech</span>
            </p>
          </div>
          <ul className="flex flex-wrap justify-center gap-6">
            {legalLinks.map((link) => (
              <li key={link.name}>
                <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
