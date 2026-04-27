"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, X, MapPin, Mail, Instagram, Linkedin, Youtube } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { SiteLogoLink } from "@/components/site-logo"
import { aboutDropdown, contact, getInquiryMailtoHref, whatsNewLinks } from "@/lib/site"

function TwoLineMenuIcon() {
  return (
    <span className="flex w-7 flex-col gap-[7px]" aria-hidden>
      <span className="h-0.5 w-full bg-foreground" />
      <span className="h-0.5 w-full bg-foreground" />
    </span>
  )
}

const menuCol1 = [
  { label: "Home", href: "/" },
  { label: "Meet the team", href: "/meet-the-team" },
  { label: "Social feed", href: "/social-feed" },
  { label: "Contact", href: "/contact" },
]

const menuCol2 = [
  { label: "About us", href: "/about-us" },
  { label: "Founders' story", href: "/founders-story" },
  { label: "Featured work", href: "/featured-work" },
]

export function Header() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [whatsNewOpen, setWhatsNewOpen] = useState(false)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 12)
        ticking = false
      })
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
    setAboutOpen(false)
    setWhatsNewOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)

  const megaLink =
    "block w-full max-w-full font-display text-[clamp(1.75rem,min(7vw,11vmin),3.75rem)] uppercase leading-[0.95] tracking-tight text-foreground transition-colors hover:text-brand-ink break-words [hyphens:auto] py-0.5"

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        /* backdrop-filter creates a containing block: fixed menu would clip inside the header bar */
        isMenuOpen ? "bg-transparent" : isScrolled ? "bg-background/85 backdrop-blur-md dark:bg-black/80" : "bg-transparent"
      )}
    >
      <a
        href="#main"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:block focus:h-auto focus:w-auto focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:text-background focus:outline-none"
      >
        Skip to main content
      </a>

      <div className="hidden border-b border-border md:block">
        <div className="container mx-auto flex w-full min-w-0 max-w-full flex-wrap items-center justify-between gap-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground page-px">
          <span>{contact.citiesLine}</span>
          <a href={contact.emailHref} className="transition-colors hover:text-foreground">
            {contact.email}
          </a>
        </div>
      </div>

      <div className="border-b border-border">
        <div className="container mx-auto flex w-full min-w-0 max-w-full items-center justify-between gap-3 py-5 page-px sm:gap-4">
          <SiteLogoLink onClick={closeMenu} variant="header" />

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3 md:gap-4">
            <ThemeToggle className="hidden sm:flex" />
            <a
              href={getInquiryMailtoHref()}
              className="font-display hidden rounded-full border border-brand px-5 py-2.5 text-[10px] font-normal uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-brand/15 sm:inline-block md:px-6"
            >
              Connect with us
            </a>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-brand hover:text-brand-ink"
              onClick={() => setIsMenuOpen((o) => (o ? false : true))}
              aria-expanded={isMenuOpen}
              aria-controls="site-menu-panel"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-6 w-6" strokeWidth={1.25} /> : <TwoLineMenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-foreground/25 backdrop-blur-sm dark:bg-black/60"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <div
            id="site-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-0 z-[70] flex flex-col bg-gradient-to-br from-background via-muted to-brand-muted/25 animate-in fade-in duration-200 dark:from-black dark:via-black dark:to-[#1a1d5c]"
            style={{ paddingTop: "max(1rem, env(safe-area-inset-top, 0px))" }}
          >
            <div className="flex shrink-0 items-center justify-between pb-4 pt-2 page-px">
              <ThemeToggle className="sm:hidden" />
              <button
                type="button"
                onClick={closeMenu}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-brand hover:text-brand-ink sm:ml-auto"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" strokeWidth={1.25} />
              </button>
            </div>

            <nav
              className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] pt-4 page-px"
              aria-label="Primary"
            >
              <div className="grid flex-1 gap-x-10 gap-y-10 sm:gap-x-16 md:grid-cols-2 md:items-start">
                <div className="space-y-6 md:pr-4">
                  {menuCol1.map((item) => (
                    <Link key={item.href} href={item.href} className={megaLink} onClick={closeMenu}>
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="space-y-6 md:pl-2">
                  {menuCol2.map((item) => (
                    <Link key={item.href} href={item.href} className={megaLink} onClick={closeMenu}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="mt-12 border-t border-border pt-10">
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-2 text-left font-display text-lg uppercase tracking-[0.2em] text-muted-foreground"
                  onClick={() => setAboutOpen((o) => (o ? false : true))}
                  aria-expanded={aboutOpen}
                >
                  About
                  <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform", aboutOpen && "rotate-180")} />
                </button>
                {aboutOpen ? (
                  <div className="mt-2 space-y-2 border-l border-border pl-4">
                    {aboutDropdown.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block py-2 text-sm text-foreground/90 hover:text-brand-ink"
                        onClick={closeMenu}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : null}

                <button
                  type="button"
                  className="mt-4 flex w-full items-center justify-between py-2 text-left font-display text-lg uppercase tracking-[0.2em] text-muted-foreground"
                  onClick={() => setWhatsNewOpen((o) => (o ? false : true))}
                  aria-expanded={whatsNewOpen}
                >
                  What&apos;s new
                  <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform", whatsNewOpen && "rotate-180")} />
                </button>
                {whatsNewOpen ? (
                  <div className="mt-2 space-y-2 border-l border-border pl-4">
                    {whatsNewLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block py-2 text-sm text-foreground/90 hover:text-brand-ink"
                        onClick={closeMenu}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mt-auto border-t border-border pt-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-ink" aria-hidden />
                      <span className="leading-relaxed">{contact.citiesLine}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 shrink-0 text-brand-ink" aria-hidden />
                      <a href={contact.emailHref} className="min-w-0 break-words hover:text-foreground">
                        {contact.email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="font-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                      Follow us
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <a
                        href={contact.instagramUrl}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-brand hover:text-brand-ink"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                      <a
                        href={contact.linkedinUrl}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-brand hover:text-brand-ink"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                      <a
                        href={contact.youtubeChannelUrl}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-brand hover:text-brand-ink"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YouTube"
                      >
                        <Youtube className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
                <a
                  href={getInquiryMailtoHref()}
                  className="font-display mt-8 block rounded-full border-2 border-brand py-4 text-center text-[11px] uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-brand/15"
                  onClick={closeMenu}
                >
                  Connect with us
                </a>
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  )
}
