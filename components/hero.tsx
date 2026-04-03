"use client"

import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"

export function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section id="about" className="relative h-screen w-full overflow-hidden">
      {/* Video Background Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background">
        {/* Animated wave pattern overlay */}
        <div className="absolute inset-0 opacity-30">
          <svg
            className="absolute w-full h-full"
            viewBox="0 0 1440 800"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.35 0.12 20)" />
                <stop offset="50%" stopColor="oklch(0.25 0.08 20)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              className="animate-pulse"
              d="M0,400 C200,300 400,500 600,400 C800,300 1000,500 1200,400 C1300,350 1400,400 1440,380 L1440,800 L0,800 Z"
              fill="url(#waveGradient)"
            />
            <path
              className="animate-pulse"
              style={{ animationDelay: "0.5s" }}
              d="M0,500 C150,400 350,600 550,500 C750,400 950,600 1150,500 C1300,450 1400,500 1440,480 L1440,800 L0,800 Z"
              fill="url(#waveGradient)"
              opacity="0.5"
            />
          </svg>
        </div>

        {/* Video simulation overlay with subtle movement */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_oklch(0.08_0_0)_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_oklch(0.2_0.1_20)_0%,_transparent_50%)] opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <div
          className={`transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-foreground tracking-tight leading-tight text-balance max-w-5xl">
            HITOUCH EVENTS:
            <br />
            <span className="text-foreground/90">Curating Unforgettable Experiences</span>
          </h1>
        </div>

        <div
          className={`transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl tracking-wide">
            Premium Production for Corporate and Public Events
          </p>
        </div>

        <div
          className={`transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <a
            href="#work"
            className="mt-12 inline-flex items-center gap-3 text-sm tracking-widest uppercase text-foreground/70 hover:text-foreground transition-colors duration-300 group"
          >
            View Portfolio
            <ChevronDown className="w-4 h-4 animate-bounce group-hover:animate-none" />
          </a>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
