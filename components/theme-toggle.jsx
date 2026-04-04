"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-gold hover:text-gold",
        className
      )}
      aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {mounted ? (
        resolvedTheme === "dark" ? <Sun className="h-5 w-5" strokeWidth={1.25} /> : <Moon className="h-5 w-5" strokeWidth={1.25} />
      ) : (
        <span className="h-5 w-5" aria-hidden />
      )}
    </button>
  )
}
