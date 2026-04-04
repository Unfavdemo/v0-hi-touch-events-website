"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, ArrowLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    id: 1,
    title: "Company Name",
    subtitle: "Let's start with who you are",
    type: "text",
    placeholder: "Enter your company name",
    field: "companyName",
  },
  {
    id: 2,
    title: "Event Date",
    subtitle: "When is your event planned?",
    type: "date",
    placeholder: "Select a date",
    field: "eventDate",
  },
  {
    id: 3,
    title: "Guest Count",
    subtitle: "How many attendees are you expecting?",
    type: "select",
    options: ["Under 100", "100-500", "500-1,000", "1,000-5,000", "5,000+"],
    field: "guestCount",
  },
  {
    id: 4,
    title: "Project Type",
    subtitle: "What type of event are you planning?",
    type: "select",
    options: ["Corporate Conference", "Product Launch", "Gala / Awards", "Festival / Concert", "Public Event", "Private Celebration"],
    field: "projectType",
  },
  {
    id: 5,
    title: "Budget Range",
    subtitle: "What's your estimated budget?",
    type: "select",
    options: ["$25K - $50K", "$50K - $100K", "$100K - $250K", "$250K - $500K", "$500K+"],
    field: "budgetRange",
  },
]









export function InquiryForm({ embedded = false }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    companyName: "",
    eventDate: "",
    guestCount: "",
    projectType: "",
    budgetRange: "",
  })
  const [isComplete, setIsComplete] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

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

  const currentStepData = steps.find((s) => s.id === currentStep)
  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsComplete(true)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (value) => {
    if (currentStepData) {
      setFormData((prev) => ({
        ...prev,
        [currentStepData.field]: value,
      }))
    }
  }

  const getCurrentValue = () => {
    if (currentStepData) {
      return formData[currentStepData.field] || ""
    }
    return ""
  }

  const formCard = (
    <div className="bg-card border border-gold/25 p-5 shadow-[0_0_60px_-30px_rgba(212,175,55,0.12)] sm:p-8 lg:p-12">
            {!isComplete ? (
              <>
                {/* Progress Bar */}
                <div className="mb-12">
                  <div className="flex justify-between text-sm text-muted-foreground mb-3">
                    <span>Step {currentStep} of {steps.length}</span>
                    <span>{Math.round(progress)}% complete</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10 ring-1 ring-gold/25 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold-muted to-brand transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="mb-10">
                  <p className="font-display text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">
                    {currentStepData?.subtitle}
                  </p>
                  <h3 className="text-2xl font-semibold text-foreground md:text-3xl">
                    {currentStepData?.title}
                  </h3>
                </div>

                {/* Input */}
                <div className="mb-12">
                  {currentStepData?.type === "text" && (
                    <input
                      type="text"
                      value={getCurrentValue()}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder={currentStepData.placeholder}
                      className="w-full min-w-0 bg-transparent border-b-2 border-border py-4 text-lg text-foreground outline-none transition-colors duration-300 placeholder:text-muted-foreground/50 focus:border-gold sm:text-xl"
                    />
                  )}

                  {currentStepData?.type === "date" && (
                    <input
                      type="date"
                      value={getCurrentValue()}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className="w-full min-w-0 max-w-full bg-transparent border-b-2 border-border py-4 text-base text-foreground outline-none transition-colors duration-300 focus:border-gold sm:text-xl"
                    />
                  )}

                  {currentStepData?.type === "select" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentStepData.options?.map((option) => (
                        <button
                          type="button"
                          key={option}
                          onClick={() => handleInputChange(option)}
                          className={cn(
                            "p-4 border text-left transition-all duration-300",
                            getCurrentValue() === option
                              ? "border-gold bg-gold/10 text-foreground ring-1 ring-gold/30"
                              : "border-border text-muted-foreground hover:border-gold/40 hover:text-foreground"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                    className={cn(
                      "font-display flex min-h-11 w-full items-center justify-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 sm:w-auto sm:justify-start",
                      currentStep === 1
                        ? "text-muted-foreground/30 cursor-not-allowed"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!getCurrentValue()}
                    className={cn(
                      "font-display flex min-h-11 w-full items-center justify-center gap-2 px-8 py-3 text-[11px] font-semibold tracking-[0.2em] uppercase transition-all duration-300 sm:w-auto",
                      getCurrentValue()
                        ? "bg-foreground text-background hover:bg-foreground/90"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {currentStep === steps.length ? "Submit" : "Continue"}
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </button>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full border border-gold/35 bg-gold/10 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  Thank You, {formData.companyName}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We&apos;ve received your inquiry and will be in touch within 24 hours to discuss your event vision.
                </p>
              </div>
            )}
    </div>
  )

  if (embedded) {
    return (
      <div ref={sectionRef} className="relative w-full">
        <div
          className={`transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {formCard}
        </div>
      </div>
    )
  }

  return (
    <section id="inquire" ref={sectionRef} className="relative scroll-mt-28 border-t border-border py-20 page-px sm:py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg
          className="absolute top-0 right-0 h-full w-full opacity-10"
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="inquiryWave" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.35 0.14 278)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M1440,0 L1440,300 Q1200,400 900,300 T300,400 T0,300 L0,0 Z"
            fill="url(#inquiryWave)"
          />
        </svg>
      </div>

      <div className="container relative z-10 mx-auto w-full min-w-0 max-w-full">
        <div
          className={`transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-gold">
            Inquiry
          </p>
          <h2 className="font-display mt-3 text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
            Partner with us
          </h2>
          <p className="mt-6 mb-16 max-w-2xl text-lg text-muted-foreground">
            Tell us about your vision—we&apos;ll craft the experience.
          </p>
        </div>

        <div
          className={`mx-auto max-w-2xl transition-all delay-200 duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {formCard}
        </div>
      </div>
    </section>
  )
}
