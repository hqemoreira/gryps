import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Conditions | GRYPS",
  description: "Terms governing access to and use of GRYPS, a non-commercial R&D prototype for connectivity resilience analysis.",
  alternates: { canonical: "https://gryps.vercel.app/legal/terms" },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
