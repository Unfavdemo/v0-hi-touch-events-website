"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { teamMembers } from "@/lib/site"

function TeamMemberPhoto({ imageSrc, alt, index }) {
  const [loaded, setLoaded] = useState(false)
  const isFirstRow = index < 3

  return (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-[1] transition-opacity duration-500 ease-out",
          loaded ? "opacity-0" : "opacity-100",
        )}
      >
        <div className="team-photo-shimmer absolute inset-0" />
      </div>
      <Image
        src={encodeURI(imageSrc)}
        alt={alt}
        fill
        priority={isFirstRow}
        loading={isFirstRow ? "eager" : "lazy"}
        fetchPriority={isFirstRow ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        className={cn(
          "z-[2] object-cover object-top transition-[opacity,transform] duration-500 ease-out group-hover:scale-[1.02]",
          loaded ? "opacity-100" : "opacity-0",
        )}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </>
  )
}

export function TeamGrid() {
  return (
    <div className="grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {teamMembers.map((member, index) => (
        <article
          key={member.name}
          className="group relative min-w-0 overflow-hidden border border-border bg-background dark:bg-black"
        >
          <div
            className="relative w-full overflow-hidden bg-neutral-900"
            style={{ aspectRatio: "4 / 5" }}
          >
            {member.image ? (
              <>
                <TeamMemberPhoto imageSrc={member.image} alt={member.name} index={index} />
                <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </>
            ) : (
              <>
                <div
                  className="absolute inset-0 opacity-80"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 35%, rgba(41,42,117,0.5) 0%, transparent 55%), linear-gradient(180deg, #262626 0%, #0a0a0a 100%)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </>
            )}
          </div>
          <div className="relative z-10 border-t border-border p-6 transition-opacity duration-300 group-hover:opacity-0">
            <h2 className="font-display text-xl font-normal uppercase tracking-tight text-foreground">{member.name}</h2>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-brand-ink">{member.role}</p>
          </div>
          <div className="absolute inset-0 z-20 flex flex-col justify-end bg-accent p-6 text-accent-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <p className="max-h-[min(50vh,220px)] overflow-y-auto text-sm leading-relaxed">{member.bio}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
