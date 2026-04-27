import { Bebas_Neue, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const display = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display-bebas',
})

export const viewport = {
  themeColor: '#292a75',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata = {
  title: 'HiTouch Enterprises Inc. | Event Production & Luxury Transportation',
  description:
    "Hi-Quality, Hi-Impact results—expert event production, luxury transportation, and strategic marketing. Based in Philadelphia, PA, serving clients near and far.",
  icons: {
    icon: [
      { url: '/hitouch-icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/hitouch-icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/hitouch-icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${display.variable}`}>
      <body className="font-serif antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
