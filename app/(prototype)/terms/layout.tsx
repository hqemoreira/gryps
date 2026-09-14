import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms — GRYPS non-commercial R&D prototype",
  description:
    "Non-commercial research prototype terms for GRYPS — demonstration and learning purposes only. No warranties. Not for sale.",
  alternates: { canonical: "https://gryps.vercel.app/terms" },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
