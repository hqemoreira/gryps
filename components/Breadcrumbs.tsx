"use client";
import Link from "next/link";
import type { CSSProperties } from "react";

export function Breadcrumbs({
  items,
  lang = "en",
}: {
  items: { href?: string; en: string; fi: string }[];
  lang?: "en" | "fi";
}) {
  if (!items.length) return null;
  return (
    <nav aria-label={lang === "fi" ? "Murupolku" : "Breadcrumb"} style={wrap}>
      <ol style={list}>
        <li style={item}>
          <Link href="/" style={link}>
            GRYPS
          </Link>
        </li>
        {items.map((crumb, i) => {
          const label = lang === "fi" ? crumb.fi : crumb.en;
          const last = i === items.length - 1;
          return (
            <li key={`${crumb.en}-${i}`} style={item}>
              <span style={sep} aria-hidden>
                /
              </span>
              {last || !crumb.href ? (
                <span style={current} aria-current={last ? "page" : undefined}>
                  {label}
                </span>
              ) : (
                <Link href={crumb.href} style={link}>
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const wrap: CSSProperties = { marginBottom: 16 };
const list: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 4,
  listStyle: "none",
  margin: 0,
  padding: 0,
  fontFamily: "var(--font-data)",
  fontSize: 10,
  letterSpacing: "0.06em",
};
const item: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 4 };
const sep: CSSProperties = { color: "var(--text-dim)", margin: "0 2px" };
const link: CSSProperties = { color: "var(--text-muted)", textDecoration: "none" };
const current: CSSProperties = { color: "var(--text-dim)" };
