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
  "description": "GRYPS scores, documents, and monitors connectivity resilience for autonomous and remote operations in maritime, Arctic, forestry, and mining environments — NIS2/CER-aligned reporting for critical operators.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "audience": {
    "@type": "Audience",
    "audienceType": "Industrial operators in maritime, forestry, mining, and Arctic environments"
  },
  "author": {
    "@type": "Organization",
    "name": "GRYPS",
    "url": "https://gryps.vercel.app",
    "email": "hello@gryps.fi"
  }
}

export const metadata: Metadata = {
  title: "Connectivity Resilience for Autonomous & Remote Operations | GRYPS",
  description: "GRYPS scores, documents, and monitors satellite connectivity resilience for autonomous fleets and remote sites in maritime, Arctic, forestry, and mining. Free Resilience Signature — NIS2/CER-aligned reporting.",
  keywords: "connectivity resilience, autonomous operations connectivity, NIS2 connectivity risk, CER critical operator, satellite resilience Arctic, satellite resilience Iceland, remote site connectivity risk, forestry autonomous fleet connectivity",
  metadataBase: new URL("https://gryps.vercel.app"),
  alternates: { canonical: "https://gryps.vercel.app" },
  openGraph: {
    title: "Connectivity Resilience for Autonomous & Remote Operations | GRYPS",
    description: "Score, document, and monitor satellite connectivity risk for autonomous and remote operations. Free Resilience Signature — NIS2/CER-aligned reporting for Nordic, Arctic, and Icelandic critical operators.",
    type: "website",
    siteName: "GRYPS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Connectivity Resilience for Autonomous & Remote Operations | GRYPS",
    description: "Free Resilience Signature for your site. Score, document, and monitor connectivity risk before it becomes a safety event.",
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
