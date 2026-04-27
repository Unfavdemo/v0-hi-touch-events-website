import Image from "next/image"
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
        <div className="relative mx-auto aspect-[21/9] max-h-[420px] w-full overflow-hidden bg-[oklch(0.14_0.04_278)]">
          <Image
            src={project.image}
            alt=""
            fill
            priority
            fetchPriority="high"
            className="object-cover object-center"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        </div>
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
            Connect with us
          </a>
        </p>
      </Prose>
    </>
  )
}
