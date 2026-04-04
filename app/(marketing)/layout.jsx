import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function MarketingLayout({ children }) {
  return (
    <>
      <Header />
      <div id="main" className="min-h-screen w-full min-w-0 max-w-[100vw] overflow-x-clip bg-background">
        {children}
      </div>
      <Footer />
    </>
  )
}
