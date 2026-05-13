import Link from "next/link"
import { notFound } from "next/navigation"
import { FeaturedWorkGalleryCarousel } from "@/components/featured-work-gallery-carousel"
import { FeaturedCaseStudyHeroImage } from "@/components/featured-case-study-hero-image"
import { PageHero, Prose } from "@/components/page-hero"
import { getFeaturedWorkGalleryPaths } from "@/lib/featured-gallery"
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

  const galleryPaths = getFeaturedWorkGalleryPaths(project.slug)

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
      {galleryPaths ? (
        <FeaturedWorkGalleryCarousel
          coverImage={project.image}
          coverAlt={project.title}
          galleryImages={galleryPaths}
        />
      ) : (
        <div className="border-b border-border">
          <FeaturedCaseStudyHeroImage src={project.image} alt={project.title} />
        </div>
      )}
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
