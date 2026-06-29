import type { Metadata } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
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
  "url": "https://gryps.io",
  "description": "Satellite connectivity intelligence for mission-critical operations. Know which provider to choose before your deployment depends on it.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "audience": {
    "@type": "Audience",
    "audienceType": "Industrial operators in maritime, forestry, mining, and Arctic environments"
  },
  "author": {
    "@type": "Person",
    "name": "Henrique Moreira",
    "url": "https://henriquemoreira.eu"
  }
}

export const metadata: Metadata = {
  title: "GRYPS — Satellite Connectivity Intelligence",
  description: "Know which satellite provider to choose before your deployment depends on it. Connectivity intelligence for maritime, Arctic, forestry, and mining operations.",
  metadataBase: new URL("https://gryps.vercel.app"),
  alternates: { canonical: "https://gryps.vercel.app" },
  openGraph: {
    title: "GRYPS — Satellite Connectivity Intelligence",
    description: "Know which satellite provider to choose before your deployment depends on it.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GRYPS — Satellite Connectivity Intelligence",
    description: "Know which satellite provider to choose before your deployment depends on it.",
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
