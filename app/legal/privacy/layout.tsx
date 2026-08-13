import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy | GRYPS",
  description: "How the GRYPS demonstration prototype handles voluntarily entered data — no marketing tracking, Mistral + Vercel processing for Resilience Signature output.",
  alternates: { canonical: "https://gryps.vercel.app/legal/privacy" },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
