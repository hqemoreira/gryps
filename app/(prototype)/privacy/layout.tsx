import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy — GRYPS non-commercial R&D prototype",
  description:
    "How the GRYPS R&D prototype handles voluntarily entered data — controller, processors, retention, and your rights. No marketing tracking. Not a commercial service.",
  alternates: { canonical: "https://gryps.vercel.app/privacy" },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
