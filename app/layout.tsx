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
  "url": "https://gryps.vercel.app",
  "description": "Non-commercial R&D prototype: GRYPS scores and documents satellite connectivity resilience for remote and autonomous site demos — learning and portfolio use, not a commercial service.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web",
  "audience": {
    "@type": "Audience",
    "audienceType": "Industrial operators in maritime, forestry, mining, and Arctic environments"
  },
  "author": {
    "@type": "Organization",
    "name": "GRYPS",
    "url": "https://gryps.vercel.app",
    "email": "hello@gryps.eu"
  }
}

export const metadata: Metadata = {
  title: "Connectivity Resilience for Autonomous & Remote Operations | GRYPS",
  description: "Non-commercial R&D prototype: GRYPS scores and documents satellite connectivity resilience for remote/autonomous site demos. Learning and portfolio use — not a commercial service.",
  keywords: "connectivity resilience, autonomous operations connectivity, NIS2 connectivity risk, CER critical operator, satellite resilience Arctic, satellite resilience Iceland, remote site connectivity risk, forestry autonomous fleet connectivity",
  metadataBase: new URL("https://gryps.vercel.app"),
  alternates: { canonical: "https://gryps.vercel.app" },
  openGraph: {
    title: "Connectivity Resilience for Autonomous & Remote Operations | GRYPS",
    description: "Non-commercial R&D prototype: score and document satellite connectivity risk for remote and autonomous site demos. Learning and portfolio use — not a commercial service.",
    type: "website",
    siteName: "GRYPS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Connectivity Resilience for Autonomous & Remote Operations | GRYPS",
    description: "Research demo Resilience Signature for learning — not a commercial service. Score connectivity risk for remote and autonomous site demos.",
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
