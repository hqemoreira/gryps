import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AnimatedFavicon } from "@/components/AnimatedFavicon";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-data",
  display: "swap",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "GRYPS",
  alternateName: "GRYPS Connectivity Resilience Advisor",
  url: "https://gryps.vercel.app",
  description:
    "GRYPS is a non-commercial R&D prototype that scores and documents satellite connectivity resilience for remote and autonomous industrial operations in Nordic, Arctic, and Icelandic environments. It produces a Resilience Signature — a scored assessment of single-provider dependency risk, orbital redundancy gaps, and NIS2/CER readiness documentation support. Built for learning and portfolio demonstration, not as a commercial service.",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
  },
  audience: {
    "@type": "Audience",
    audienceType:
      "Industrial operators, systems integrators, and connectivity planners working in maritime, forestry, mining, and Arctic environments",
  },
  author: {
    "@type": "Person",
    name: "Henrique Moreira",
    url: "https://henriquemoreira.eu",
    email: "hello@gryps.eu",
    jobTitle: "Connectivity resilience researcher",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Espoo",
      addressCountry: "FI",
    },
  },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".gryps-hero-sub"],
  },
};

export const metadata: Metadata = {
  title: "GRYPS — Know your score before the Arctic finds it for you",
  description:
    "Resilience Signatures for Nordic, Arctic & Icelandic operations. Score satellite dependency and redundancy gaps in 60 seconds — supports NIS2/CER readiness documentation. Free R&D prototype · Model v0.3 · Espoo, Finland.",
  keywords:
    "connectivity resilience, satellite connectivity scoring, autonomous operations connectivity, NIS2 connectivity risk, CER critical operator resilience, satellite resilience Arctic, satellite resilience Iceland, remote site connectivity risk, forestry autonomous fleet connectivity, Starlink Arctic coverage, Iridium Certus polar, OneWeb high latitude, LEO MEO GEO redundancy",
  metadataBase: new URL("https://gryps.vercel.app"),
  alternates: { canonical: "https://gryps.vercel.app" },
  openGraph: {
    title: "GRYPS · Score: 40/100 · Grade D",
    description:
      "Know your score before the Arctic finds it for you. Free Resilience Signature demo for Nordic & Arctic operations.",
    type: "website",
    siteName: "GRYPS",
    url: "https://gryps.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "GRYPS · Score: 40/100 · Grade D",
    description:
      "Know your score before the Arctic finds it for you. Resilience Signatures for Nordic, Arctic & Icelandic ops.",
  },
  robots: { index: true, follow: true },
  verification: { google: "vbGW3-1oXwqBQl7NlA461C2enz8BtVkFOPqW0SiJVy0" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <AnimatedFavicon />
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
