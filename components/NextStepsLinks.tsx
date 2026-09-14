"use client";

import Link from "next/link";
import type { Lang } from "@/lib/use-lang";

export type NextStepLink = {
  href: string;
  en: string;
  fi: string;
};

const DEFAULT_STEPS: NextStepLink[] = [
  { href: "/map", en: "Explore Map", fi: "Tutki karttaa" },
  { href: "/providers", en: "Providers", fi: "Toimittajat" },
  { href: "/scenarios", en: "Scenarios", fi: "Skenaariot" },
  { href: "/knowledge", en: "Evidence", fi: "Näyttö" },
  { href: "/methodology", en: "Methodology", fi: "Menetelmä" },
  { href: "/#advisor", en: "Generate Signature", fi: "Luo Signature" },
];

export function NextStepsLinks({
  lang,
  label,
  links = DEFAULT_STEPS,
}: {
  lang: Lang;
  label?: string;
  links?: NextStepLink[];
}) {
  const heading = label ?? (lang === "fi" ? "SEURAAVAT ASKELEET" : "NEXT STEPS");

  return (
    <nav
      className="gryps-next-steps"
      aria-label={heading}
      style={{
        marginTop: 8,
        paddingTop: 16,
        borderTop: "1px solid var(--border)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 9,
          color: "var(--text-dim)",
          letterSpacing: "0.12em",
          marginBottom: 10,
        }}
      >
        {heading}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {links.map((link) => (
          <Link
            key={link.href + link.en}
            href={link.href}
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--accent-blue)",
              textDecoration: "none",
              border: "1px solid rgba(79,168,255,0.28)",
              borderRadius: 6,
              padding: "6px 10px",
            }}
          >
            {lang === "fi" ? link.fi : link.en}
          </Link>
        ))}
      </div>
    </nav>
  );
}
