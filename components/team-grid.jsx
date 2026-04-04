import { teamMembers } from "@/lib/site"

export function TeamGrid() {
  return (
    <div className="grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {teamMembers.map((member) => (
        <article
          key={member.name}
          className="group relative min-w-0 overflow-hidden border border-border bg-background dark:bg-black"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-900">
            <div
              className="absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(circle at 50% 35%, rgba(46,49,146,0.5) 0%, transparent 55%), linear-gradient(180deg, #262626 0%, #0a0a0a 100%)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
          <div className="relative z-10 border-t border-border p-6 transition-opacity duration-300 group-hover:opacity-0">
            <h2 className="font-display text-xl font-normal uppercase tracking-tight text-foreground">{member.name}</h2>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-gold">{member.role}</p>
          </div>
          <div className="absolute inset-0 z-20 flex flex-col justify-end bg-accent p-6 text-accent-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <p className="max-h-[min(50vh,220px)] overflow-y-auto text-sm leading-relaxed">{member.bio}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
