import { Instagram, Twitter, Linkedin, Youtube } from "lucide-react"

const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "YouTube", icon: Youtube, href: "#" },
]

const siteLinks = [
  { name: "Work", href: "#work" },
  { name: "Services", href: "#services" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#inquire" },
]

export function Footer() {
  return (
    <footer className="border-t border-border py-16 px-6 lg:px-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-semibold text-foreground tracking-tight mb-4">
              HITOUCH EVENTS
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Premium event production for those who demand excellence. Curating unforgettable experiences since 2015.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm tracking-widest uppercase text-muted-foreground mb-4">
              Contact
            </h4>
            <div className="space-y-3">
              <a
                href="mailto:hello@hitouchevents.com"
                className="block text-foreground hover:text-accent transition-colors duration-300"
              >
                hello@hitouchevents.com
              </a>
              <a
                href="tel:+15551234567"
                className="block text-foreground hover:text-accent transition-colors duration-300"
              >
                +1 (555) 123-4567
              </a>
              <p className="text-muted-foreground text-sm">
                Los Angeles • New York • London
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm tracking-widest uppercase text-muted-foreground mb-4">
                Sitemap
              </h4>
              <ul className="space-y-3">
                {siteLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-foreground/70 hover:text-foreground transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm tracking-widest uppercase text-muted-foreground mb-4">
                Social
              </h4>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-foreground/70 hover:text-accent transition-colors duration-300"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} HiTouch Events. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-300">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
