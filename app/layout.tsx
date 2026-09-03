import type { Metadata } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AnimatedFavicon } from "@/components/AnimatedFavicon"
import { ThemeProvider } from "@/context/ThemeContext"
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
  "alternateName": "GRYPS Connectivity Resilience Advisor",
  "url": "https://gryps.vercel.app",
  "description": "GRYPS is a non-commercial R&D prototype that scores and documents satellite connectivity resilience for remote and autonomous industrial operations in Nordic, Arctic, and Icelandic environments. It produces a Resilience Signature — a scored assessment of single-provider dependency risk, orbital redundancy gaps, and NIS2/CER compliance posture. Built for learning and portfolio demonstration, not as a commercial service.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "Industrial operators, systems integrators, and connectivity planners working in maritime, forestry, mining, and Arctic environments"
  },
  "author": {
    "@type": "Person",
    "name": "Henrique Moreira",
    "url": "https://henriquemoreira.eu",
    "email": "hello@gryps.eu",
    "jobTitle": "Connectivity resilience researcher",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Espoo",
      "addressCountry": "FI"
    }
  },
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", ".gryps-hero-sub"]
  }
}

export const metadata: Metadata = {
  title: "GRYPS — Satellite Connectivity Resilience Scoring for Nordic, Arctic & Iceland Operations",
  description: "GRYPS is a free R&D prototype that scores satellite connectivity resilience for remote and autonomous industrial sites. It produces a Resilience Signature: a scored assessment covering single-provider dependency risk, LEO/MEO/GEO orbital redundancy, terrain obstruction penalties, and NIS2/CER compliance flags. Built in Espoo, Finland for maritime, forestry, mining, and Arctic operations above 60°N.",
  keywords: "connectivity resilience, satellite connectivity scoring, autonomous operations connectivity, NIS2 connectivity risk, CER critical operator resilience, satellite resilience Arctic, satellite resilience Iceland, remote site connectivity risk, forestry autonomous fleet connectivity, Starlink Arctic coverage, Iridium Certus polar, OneWeb high latitude, LEO MEO GEO redundancy",
  metadataBase: new URL("https://gryps.vercel.app"),
  alternates: { canonical: "https://gryps.vercel.app" },
  openGraph: {
    title: "GRYPS — Satellite Connectivity Resilience Scoring for Nordic, Arctic & Iceland",
    description: "Free R&D prototype: score satellite connectivity resilience for remote and autonomous sites. Produces a Resilience Signature covering provider dependency, orbital redundancy, terrain penalties, and NIS2/CER compliance. Espoo, Finland.",
    type: "website",
    siteName: "GRYPS",
  },
  twitter: {
    card: "summary_large_image",
    title: "GRYPS — Score Satellite Connectivity Resilience for Arctic & Nordic Operations",
    description: "Free research tool that produces a Resilience Signature — scored satellite connectivity assessment for remote industrial sites above 60°N. Covers Starlink, Iridium, OneWeb, and GEO providers.",
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
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
