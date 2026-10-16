import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AnimatedFavicon } from "@/components/AnimatedFavicon";
import { ThemeProvider } from "@/context/ThemeContext";
import { HERO_DEMO_OG_TITLE } from "@/lib/hero-demo";
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
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://gryps.vercel.app/#app",
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
      author: { "@id": "https://gryps.vercel.app/#author" },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".gryps-hero-sub"],
      },
    },
    {
      "@type": "Person",
      "@id": "https://gryps.vercel.app/#author",
      name: "Henrique Moreira",
      url: "https://henriquemoreira.eu",
      jobTitle: "Connectivity resilience researcher",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Espoo",
        addressCountry: "FI",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://gryps.vercel.app/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is GRYPS?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "GRYPS is a non-commercial R&D prototype that scores satellite connectivity resilience for remote and autonomous industrial operations in Nordic, Arctic, and Icelandic environments. It produces a Resilience Signature for learning and documentation support — not as a commercial service.",
          },
        },
        {
          "@type": "Question",
          name: "Is GRYPS procurement or certification advice?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Results are indicative research outputs. They are not procurement advice, coverage certification, or engineering sign-off. See https://gryps.vercel.app/methodology for assumptions and limitations.",
          },
        },
        {
          "@type": "Question",
          name: "Is GRYPS free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. GRYPS is a free educational / portfolio prototype with no paid tiers. There is no commercial SaaS offering.",
          },
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title:
    "GRYPS — Connectivity resilience scoring for Nordic, Arctic and Icelandic sites",
  description:
    "Resilience Signatures for Nordic, Arctic & Icelandic operations. Deterministic, documented, free. Supports NIS2/CER readiness documentation. R&D prototype · Model v0.4 · Espoo, Finland.",
  keywords:
    "connectivity resilience, satellite connectivity scoring, autonomous operations connectivity, NIS2 connectivity risk, CER critical operator resilience, satellite resilience Arctic, satellite resilience Iceland, remote site connectivity risk, forestry autonomous fleet connectivity, Starlink Arctic coverage, Iridium Certus polar, OneWeb high latitude, LEO MEO GEO redundancy",
  metadataBase: new URL("https://gryps.vercel.app"),
  alternates: { canonical: "https://gryps.vercel.app" },
  openGraph: {
    title: HERO_DEMO_OG_TITLE,
    description:
      "Connectivity resilience scoring for Nordic, Arctic and Icelandic sites. Deterministic, documented, free.",
    type: "website",
    siteName: "GRYPS",
    url: "https://gryps.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: HERO_DEMO_OG_TITLE,
    description:
      "Connectivity resilience scoring for Nordic, Arctic and Icelandic sites. Deterministic, documented, free.",
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
