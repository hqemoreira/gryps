import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signatures | GRYPS",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://gryps.vercel.app/research" },
};

export default function SignaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
