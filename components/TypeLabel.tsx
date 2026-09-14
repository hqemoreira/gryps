"use client";

export type EvidenceTypeKind = "MODEL" | "DATA" | "RESEARCH" | "INTERPRETATION";

export function TypeLabel({ kind }: { kind: EvidenceTypeKind }) {
  return <span className="gryps-type-label">{kind}</span>;
}
