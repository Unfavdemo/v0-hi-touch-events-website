"use client"

import { useEffect, useRef, useState } from "react"

const projects = [
  {
    title: "The Summit Conference '23",
    description: "Full-scale production, 1,500 attendees, hybrid execution",
    image: "/images/project-1.jpg",
  },
  {
    title: "Velocity Music Festival",
    description: "Main stage design, 25,000 capacity, 3-day festival",
    image: "/images/project-2.jpg",
  },
  {
    title: "TechForward Global Launch",
    description: "Product unveiling, immersive AV experience, 800 guests",
    image: "/images/project-3.jpg",
  },
  {
    title: "Aurora Gala Night",
    description: "Luxury corporate gala, bespoke staging, 500 executives",
    image: "/images/project-4.jpg",
  },
]

export function Portfolio() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="work" ref={sectionRef} className="relative py-32 px-6 lg:px-12">
      {/* Background wave pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute top-0 left-0 w-full h-full opacity-10"
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="portfolioWave" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.4 0.15 20)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M-100,200 Q200,100 400,200 T800,200 T1200,200 T1600,200 L1600,0 L-100,0 Z"
            fill="url(#portfolioWave)"
          />
        </svg>
      </div>

      <div className="container mx-auto relative z-10">
        <div
          className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-4">
            Our Featured Work
          </h2>
          <p className="text-muted-foreground text-lg mb-16 max-w-2xl">
            Every event is a canvas. Here are some of our most ambitious productions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className={`group relative overflow-hidden bg-card border border-border transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${project.image})`,
                    backgroundColor: "oklch(0.15 0.02 20)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <h3 className="text-xl lg:text-2xl font-semibold text-foreground tracking-tight mb-2 group-hover:text-accent transition-colors duration-300">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm lg:text-base">
                  {project.description}
                </p>
              </div>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
