"use client"

import { Instagram } from "lucide-react"
const tiles = [
  { type: "image", image: "/images/project-1.jpg" },
  { type: "brand", label: "On site" },
  { type: "image", image: "/images/project-2.jpg" },
  { type: "image", image: "/images/project-3.jpg" },
  { type: "brand", label: "Show days" },
  { type: "image", image: "/images/project-4.jpg" },
  { type: "image", image: "/images/project-1.jpg" },
  { type: "brand", label: "Strike wins" },
  { type: "image", image: "/images/project-2.jpg" },
]

export function SocialFeedGrid() {
  return (
    <div className="grid grid-cols-2 gap-0 border border-border md:grid-cols-3">
      {tiles.map((tile, i) => (
        <div
          key={`${tile.type}-${i}`}
          className="group relative aspect-square overflow-hidden border-e border-b border-border md:[&:nth-child(3n)]:border-e-0"
        >
          {tile.type === "brand" ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-accent p-6 text-center">
              <p className="font-display text-2xl font-normal uppercase leading-none tracking-tight text-accent-foreground md:text-3xl">
                {tile.label}
              </p>
              <Instagram className="mt-4 h-6 w-6 text-accent-foreground/90" aria-hidden />
            </div>
          ) : (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url(${tile.image})`,
                  backgroundColor: "#1a0a0a",
                }}
              />
              <div className="absolute inset-0 bg-transparent transition-colors group-hover:bg-foreground/40 dark:group-hover:bg-black/55" />
              <div className="absolute right-3 top-3 rounded-full bg-foreground/35 p-1.5 backdrop-blur-sm dark:bg-black/50">
                <Instagram className="h-4 w-4 text-background dark:text-white" aria-hidden />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
