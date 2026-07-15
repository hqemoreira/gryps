import type { Metadata } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AnimatedFavicon } from "@/components/AnimatedFavicon"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-data",
  display: "swap",
})

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "GRYPS",
  "url": "https://gryps.vercel.app",
  "description": "Compare satellite providers for maritime, Arctic, forestry, and mining operations. GRYPS maps coverage, latency, and SLA data so you choose the right provider before your mission depends on it.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "audience": {
    "@type": "Audience",
    "audienceType": "Industrial operators in maritime, forestry, mining, and Arctic environments"
  },
  "author": {
    "@type": "Organization",
    "name": "GRYPS",
    "url": "https://gryps.vercel.app"
  }
}

export const metadata: Metadata = {
  title: "Satellite Connectivity Comparison — Starlink vs OneWeb vs Iridium | GRYPS",
  description: "Compare satellite providers for maritime, Arctic, forestry, and mining operations. GRYPS maps coverage, latency, and SLA data so you choose the right provider before your mission depends on it.",
  keywords: "satellite connectivity comparison, Starlink maritime, OneWeb Arctic, Iridium satellite, satellite internet mining, remote connectivity, satellite provider comparison",
  metadataBase: new URL("https://gryps.vercel.app"),
  alternates: { canonical: "https://gryps.vercel.app" },
  openGraph: {
    title: "Satellite Connectivity Comparison — Starlink vs OneWeb vs Iridium | GRYPS",
    description: "Compare satellite providers for maritime, Arctic, forestry, and mining operations. Coverage, latency, and SLA data before your mission depends on it.",
    type: "website",
    siteName: "GRYPS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Satellite Connectivity Comparison | GRYPS",
    description: "Compare Starlink, OneWeb, and Iridium for maritime, Arctic, and mining operations. Choose the right provider before your mission depends on it.",
  },
  robots: { index: true, follow: true },
  verification: { google: "vbGW3-1oXwqBQl7NlA461C2enz8BtVkFOPqW0SiJVy0" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <AnimatedFavicon />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
