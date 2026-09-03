import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy — GRYPS non-commercial R&D prototype",
  description: "How the GRYPS demonstration prototype handles voluntarily entered data — no marketing tracking, Mistral + Vercel processing for Resilience Signature output. Not a commercial service.",
  alternates: { canonical: "https://gryps.vercel.app/privacy" },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
