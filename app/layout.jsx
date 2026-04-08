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
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${display.variable}`}>
      <head>
        <link rel="preload" as="image" href="/images/DSC_0015.jpg" fetchPriority="high" />
      </head>
      <body className="font-serif antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
