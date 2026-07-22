import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | GRYPS",
  description: "How GRYPS collects, processes, and protects personal data in connection with the GRYPS connectivity resilience platform.",
  alternates: { canonical: "https://gryps.vercel.app/legal/privacy" },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
