import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Resilience Signatures — Nordic & Arctic Connectivity Scores | GRYPS",
  description: "Browse scored connectivity resilience signatures for Nordic and Arctic industrial sites — forestry, mining, maritime, and Arctic operations. Illustrative data demonstrating the GRYPS scoring model.",
  alternates: { canonical: "https://gryps.vercel.app/signatures" },
}

export default function SignaturesLayout({ children }: { children: React.ReactNode }) {
  return children
}
