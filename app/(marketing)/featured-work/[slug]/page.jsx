import Link from "next/link"
import { notFound } from "next/navigation"
import { PageHero, Prose } from "@/components/page-hero"
import { featuredProjects, getProjectBySlug, getInquiryMailtoHref } from "@/lib/site"

export function generateStaticParams() {
  return featuredProjects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return { title: "Project | HiTouch Enterprises Inc." }
  return {
    title: `${project.title} | HiTouch Enterprises Inc.`,
    description: project.listDescription,
  }
}

export default async function FeaturedWorkCasePage({ params }) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  return (
    <>
      <PageHero
        eyebrow={project.category}
        title={project.title}
        subtitle={project.listDescription}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Featured work", href: "/featured-work" },
          { label: project.title, href: `/featured-work/${project.slug}` },
        ]}
        variant="cinematic"
      />
      <div className="border-b border-border">
        <div
          className="mx-auto aspect-[21/9] max-h-[420px] w-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${project.image})`,
            backgroundColor: "oklch(0.14 0.04 278)",
          }}
        />
      </div>
      <Prose>
        {project.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
        <p className="!mt-12 flex flex-wrap gap-4">
          <Link
            href="/featured-work"
            className="font-display text-[10px] font-normal uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-brand-ink"
          >
            ← All featured work
          </Link>
          <a
            href={getInquiryMailtoHref()}
            className="font-display text-[10px] font-normal uppercase tracking-[0.22em] text-brand-ink transition-colors hover:text-foreground"
          >
            Plan something similar
          </a>
        </p>
      </Prose>
    </>
  )
}
