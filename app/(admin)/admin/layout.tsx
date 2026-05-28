export const metadata = {
  title: "Admin | HiTouch Enterprises Inc.",
  robots: { index: false, follow: false },
}

export default function AdminSegmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-background"
      >
        Skip to admin content
      </a>
      {children}
    </div>
  )
}
