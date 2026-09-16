"use client";

import { EVIDENCE_KINDS, EVIDENCE_KIND_ORDER, type EvidenceKind } from "@/lib/evidence-kinds";
import { useLang } from "@/lib/use-lang";

export type EvidenceTypeKind = EvidenceKind;

/** Epistemic chip — what kind of evidence the block is, same meaning everywhere. */
export function TypeLabel({
  kind,
  className,
}: {
  kind: EvidenceKind;
  className?: string;
}) {
  const [lang] = useLang();
  const meta = EVIDENCE_KINDS[kind];
  const title = lang === "fi" ? meta.fi : meta.en;

  return (
    <span
      className={`gryps-type-label gryps-type-label--${kind.toLowerCase()}${className ? ` ${className}` : ""}`}
      title={title}
      data-evidence-kind={kind}
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
      {EVIDENCE_KIND_ORDER.map((key) => {
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
