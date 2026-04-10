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
    'Hi-Quality, Hi-Impact results—expert event production, luxury transportation, and strategic marketing. Based, serving clients near and far.',
  icons: {
    icon: [{ url: '/HiTouch_final.png', type: 'image/png' }],
    apple: [{ url: '/HiTouch_final.png', type: 'image/png' }],
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
