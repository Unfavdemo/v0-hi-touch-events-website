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

interface FormData {
  companyName: string
  eventDate: string
  guestCount: string
  projectType: string
  budgetRange: string
}

export function InquiryForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    eventDate: "",
    guestCount: "",
    projectType: "",
    budgetRange: "",
  })
  const [isComplete, setIsComplete] = useState(false)
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

  const handleInputChange = (value: string) => {
    if (currentStepData) {
      setFormData((prev) => ({
        ...prev,
        [currentStepData.field]: value,
      }))
    }
  }

  const getCurrentValue = () => {
    if (currentStepData) {
      return formData[currentStepData.field as keyof FormData] || ""
    }
    return ""
  }

  return (
    <section id="inquire" ref={sectionRef} className="relative py-32 px-6 lg:px-12">
      {/* Background wave pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute top-0 right-0 w-full h-full opacity-10"
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="inquiryWave" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.4 0.15 20)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M1440,0 L1440,300 Q1200,400 900,300 T300,400 T0,300 L0,0 Z"
            fill="url(#inquiryWave)"
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
            Partner With Us
          </h2>
          <p className="text-muted-foreground text-lg mb-16 max-w-2xl">
            Tell us about your vision. We&apos;ll craft the experience.
          </p>
        </div>

        {/* Form Container */}
        <div
          className={`max-w-2xl mx-auto transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="bg-card border border-border p-8 lg:p-12">
            {!isComplete ? (
              <>
                {/* Progress Bar */}
                <div className="mb-12">
                  <div className="flex justify-between text-sm text-muted-foreground mb-3">
                    <span>Step {currentStep} of {steps.length}</span>
                    <span>{Math.round(progress)}% complete</span>
                  </div>
                  <div className="h-1 bg-border overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="mb-10">
                  <p className="text-muted-foreground text-sm tracking-wide uppercase mb-2">
                    {currentStepData?.subtitle}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-semibold text-foreground">
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
                      className="w-full bg-transparent border-b-2 border-border focus:border-accent text-foreground text-xl py-4 outline-none transition-colors duration-300 placeholder:text-muted-foreground/50"
                    />
                  )}

                  {currentStepData?.type === "date" && (
                    <input
                      type="date"
                      value={getCurrentValue()}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-border focus:border-accent text-foreground text-xl py-4 outline-none transition-colors duration-300"
                    />
                  )}

                  {currentStepData?.type === "select" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentStepData.options?.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleInputChange(option)}
                          className={cn(
                            "p-4 border text-left transition-all duration-300",
                            getCurrentValue() === option
                              ? "border-accent bg-accent/10 text-foreground"
                              : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                    className={cn(
                      "flex items-center gap-2 text-sm tracking-widest uppercase transition-colors duration-300",
                      currentStep === 1
                        ? "text-muted-foreground/30 cursor-not-allowed"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={!getCurrentValue()}
                    className={cn(
                      "flex items-center gap-2 px-8 py-3 text-sm tracking-widest uppercase transition-all duration-300",
                      getCurrentValue()
                        ? "bg-foreground text-background hover:bg-foreground/90"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {currentStep === steps.length ? "Submit" : "Continue"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-accent" />
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
        </div>
      </div>
    </section>
  )
}
