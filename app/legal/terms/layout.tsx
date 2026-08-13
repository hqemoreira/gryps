import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms | GRYPS",
  description: "Non-commercial research prototype terms for GRYPS — demonstration and learning purposes only. No warranties.",
  alternates: { canonical: "https://gryps.vercel.app/legal/terms" },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
