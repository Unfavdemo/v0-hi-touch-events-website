"use client"

import { useEffect, useRef, useState } from "react"
import { Lightbulb, Speaker, Layers, Truck } from "lucide-react"

const services = [
  {
    icon: Lightbulb,
    title: "Event Strategy",
    points: [
      "Concept development & creative direction",
      "Budget planning & optimization",
      "Vendor coordination & management",
      "Timeline & milestone mapping",
    ],
  },
  {
    icon: Speaker,
    title: "Technical Production",
    points: [
      "Sound engineering & acoustics",
      "Lighting design & programming",
      "Video production & live streaming",
      "LED walls & projection mapping",
    ],
  },
  {
    icon: Layers,
    title: "Stage Design",
    points: [
      "Custom set construction",
      "Scenic design & fabrication",
      "3D visualization & rendering",
      "Branded environment creation",
    ],
  },
  {
    icon: Truck,
    title: "Logistics Management",
    points: [
      "Venue scouting & coordination",
      "Equipment transport & setup",
      "On-site crew management",
      "Health & safety compliance",
    ],
  },
]

export function Services() {
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
    <section id="services" ref={sectionRef} className="relative py-32 px-6 lg:px-12">
      {/* Background wave pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute bottom-0 left-0 w-full h-96 opacity-10"
          viewBox="0 0 1440 400"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="servicesWave" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.4 0.15 20)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M0,100 C300,200 600,50 900,150 C1100,220 1300,80 1440,120 L1440,400 L0,400 Z"
            fill="url(#servicesWave)"
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
            What We Do
          </h2>
          <p className="text-muted-foreground text-lg mb-16 max-w-2xl">
            End-to-end event production services crafted to deliver exceptional experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`group p-8 bg-card border border-border hover:border-accent/50 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
            >
              {/* Icon */}
              <div className="mb-6">
                <service.icon className="w-8 h-8 text-accent" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-foreground tracking-tight mb-4">
                {service.title}
              </h3>

              {/* Points */}
              <ul className="space-y-3">
                {service.points.map((point) => (
                  <li
                    key={point}
                    className="text-muted-foreground text-sm leading-relaxed flex items-start gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-accent mt-2 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
