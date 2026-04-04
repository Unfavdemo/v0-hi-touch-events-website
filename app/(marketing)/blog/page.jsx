import Link from "next/link"
import { PageHero, Prose } from "@/components/page-hero"

export const metadata = {
  title: "Blog | HiTouch Enterprises Inc.",
  description: "Notes on production craft, experience design, and live show operations.",
}

const placeholderPosts = [
  {
    title: "Why rehearsal is your real insurance policy",
    date: "Coming soon",
    href: "#",
  },
  {
    title: "Hybrid that does not feel like a webinar bolt-on",
    date: "Coming soon",
    href: "#",
  },
  {
    title: "Scenic that survives touring—and photographers",
    date: "Coming soon",
    href: "#",
  },
]

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="What's new"
        title="Blog"
        subtitle="Longer-form notes for clients, crew, and curious producers."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
        ]}
        variant="cinematic"
      />
      <section className="pb-24 page-px">
        <div className="container mx-auto w-full min-w-0 max-w-3xl">
          <ul className="divide-y divide-border border-t border-border">
            {placeholderPosts.map((post) => (
              <li key={post.title} className="py-8">
                <p className="font-display text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  {post.date}
                </p>
                <h2 className="font-display mt-2 text-xl font-bold uppercase tracking-tight text-foreground md:text-2xl">
                  {post.href === "#" ? (
                    post.title
                  ) : (
                    <Link href={post.href} className="hover:text-gold">
                      {post.title}
                    </Link>
                  )}
                </h2>
              </li>
            ))}
          </ul>
          <p className="mt-12 text-sm text-muted-foreground">
            Editorial calendar opening soon.{" "}
            <Link href="/contact" className="text-gold underline-offset-4 hover:underline">
              Pitch a topic
            </Link>{" "}
            or subscribe when we launch.
          </p>
        </div>
      </section>
    </>
  )
}
