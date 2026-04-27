import Image from "next/image"
import { Prose } from "@/components/page-hero"
import { divisions, getInquiryMailtoHref } from "@/lib/site"

export function DivisionPage({ slug }) {
  const d = divisions.find((x) => x.slug === slug)
  if (!d) return null

  return (
    <>
      <section className="relative min-h-[min(70vh,520px)] w-full min-w-0 overflow-hidden border-b border-border pt-32 sm:min-h-[min(70vh,560px)] sm:pt-36 md:pt-44">
        <div className="absolute inset-0 bg-[#1a0a0a]">
          <Image
            src={d.heroImage}
            alt=""
            fill
            priority
            fetchPriority="high"
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/35" />
        <div className="relative z-10 flex min-h-[min(70vh,520px)] flex-col items-center justify-center pb-16 pt-20 text-center page-px sm:min-h-[min(70vh,560px)] sm:pb-20 sm:pt-24">
          <p className="font-display text-xs font-normal uppercase tracking-[0.35em] text-brand-ink">What we do</p>
          <h1 className="font-display mt-4 max-w-5xl text-[clamp(2rem,8vw,6rem)] font-normal uppercase leading-[0.92] tracking-tight text-balance text-white">
            {d.title}
          </h1>
          <p className="mt-6 max-w-2xl text-sm font-normal uppercase tracking-[0.22em] text-white/85 md:text-base">
            {d.heroLine}
          </p>
        </div>
      </section>
      <Prose>
        <p className="font-display text-sm font-normal uppercase tracking-[0.25em] text-brand-ink">{d.tagline}</p>
        {d.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
        <ul className="!mt-8 space-y-2 border-t border-border pt-8">
          {d.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <p className="!mt-12">
          <a
            href={getInquiryMailtoHref()}
            className="font-display inline-flex rounded-full border-2 border-brand px-8 py-3.5 text-[10px] font-normal uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-brand/15"
          >
            Connect with us
          </a>
        </p>
      </Prose>
    </>
  )
}
