import { Bebas_Neue, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SeoJsonLd } from '@/components/seo-json-ld'
import { Providers } from '@/components/providers'
import { getMetadataBase } from '@/lib/site-url'
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
  metadataBase: getMetadataBase(),
  title: 'HiTouch Enterprises Inc. | Event Production & Luxury Transportation',
  description:
    "Hi-Quality, Hi-Impact results—expert event production, luxury transportation, and strategic marketing. Based in Philadelphia, PA, serving clients near and far.",
  applicationName: 'HiTouch Enterprises',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    siteName: 'HiTouch Enterprises Inc.',
    locale: 'en_US',
    title: 'HiTouch Enterprises Inc. | Event Production & Luxury Transportation',
    description:
      "Hi-Quality, Hi-Impact results—expert event production, luxury transportation, and strategic marketing. Based in Philadelphia, PA, serving clients near and far.",
    images: [{ url: '/HiTouch_final.png', width: 1200, height: 630, alt: 'HiTouch Enterprises Inc.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HiTouch Enterprises Inc. | Event Production & Luxury Transportation',
    description:
      "Hi-Quality, Hi-Impact results—expert event production, luxury transportation, and strategic marketing. Based in Philadelphia, PA, serving clients near and far.",
    images: ['/HiTouch_final.png'],
  },
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
        <SeoJsonLd />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
