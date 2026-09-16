"use client";

import {
  EVIDENCE_KINDS,
  resolveEvidenceKind,
  type EvidenceKindInput,
} from "@/lib/evidence-kinds";
import { useLang } from "@/lib/use-lang";

export type EvidenceTypeKind = EvidenceKindInput;

/** Epistemic chip — what kind of evidence the block is, same meaning everywhere. */
export function TypeLabel({
  kind,
  className,
}: {
  kind: EvidenceKindInput;
  className?: string;
}) {
  const [lang] = useLang();
  const resolved = resolveEvidenceKind(kind);
  const meta = EVIDENCE_KINDS[resolved];
  const title = lang === "fi" ? meta.fi : meta.en;

  return (
    <span
      className={`gryps-type-label gryps-type-label--${resolved.toLowerCase()}${className ? ` ${className}` : ""}`}
      title={title}
      data-evidence-kind={resolved}
    >
      {meta.label}
    </span>
  );
}

/** Compact legend for Methodology / docs — optional reuse. */
export function EvidenceKindLegend({ className }: { className?: string }) {
  const [lang] = useLang();
  return (
    <ul className={`gryps-evidence-legend${className ? ` ${className}` : ""}`}>
      {(Object.keys(EVIDENCE_KINDS) as (keyof typeof EVIDENCE_KINDS)[]).map((key) => {
        const meta = EVIDENCE_KINDS[key];
        return (
          <li key={key}>
            <TypeLabel kind={key} />
            <span>{lang === "fi" ? meta.fi : meta.en}</span>
          </li>
        );
      })}
    </ul>
  );
}
