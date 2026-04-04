import Link from "next/link"
import { PageHero } from "@/components/page-hero"
import { featuredProjects } from "@/lib/site"

export const metadata = {
  title: "Featured Work | HiTouch Enterprises Inc.",
  description: "Selected conferences, launches, festivals, and galas produced by HiTouch Enterprises.",
}

export default function FeaturedWorkPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Featured work"
        subtitle="Yes—that was us. A cross-section of productions where creative ambition met operational rigor."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Featured work", href: "/featured-work" },
        ]}
        variant="cinematic"
      />
      <section className="bg-background px-0 pb-24 dark:bg-black">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-0 border border-border md:grid-cols-2">
            {featuredProjects.map((project) => (
              <Link
                key={project.slug}
                href={`/featured-work/${project.slug}`}
                className="group relative block overflow-hidden border-b border-border md:border-e md:border-b-0 last:border-b-0 md:[&:nth-child(2n)]:border-e-0"
              >
                <div className="relative aspect-[16/11] min-h-[280px] overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage: `url(${project.image})`,
                      backgroundColor: "#1a0a0a",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5 sm:p-8">
                    <span className="font-display text-[10px] font-normal uppercase tracking-[0.25em] text-white/70">
                      {project.category}
                    </span>
                    <h2 className="font-display mt-2 max-w-lg text-xl font-normal uppercase tracking-tight text-balance text-white sm:text-2xl md:text-4xl">
                      {project.title}
                    </h2>
                    <span className="mt-3 block h-1 w-10 rounded-full bg-gradient-line" aria-hidden />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
