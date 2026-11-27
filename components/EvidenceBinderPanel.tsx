"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type {
  EvidenceBinderRecord,
  EvidenceOrigin,
} from "@/lib/research/evidence-binder";

const originStyle: Record<EvidenceOrigin, CSSProperties> = {
  PUBLIC: {
    color: "var(--accent-cyan)",
    border: "1px solid rgba(34,211,238,0.35)",
    backgroundColor: "rgba(34,211,238,0.08)",
  },
  SYNTHETIC: {
    color: "var(--accent-amber)",
    border: "1px solid rgba(217,119,6,0.4)",
    backgroundColor: "rgba(217,119,6,0.1)",
  },
  USER_SUPPLIED: {
    color: "var(--text-muted)",
    border: "1px solid var(--border2)",
    backgroundColor: "var(--surface2)",
  },
};

function OriginChip({ origin }: { origin: EvidenceOrigin }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-data)",
        fontSize: 10,
        letterSpacing: "0.08em",
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 4,
        ...originStyle[origin],
      }}
    >
      {origin}
    </span>
  );
}

function MetaLine({ label, value }: { label: string; value?: string }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-data)",
        fontSize: 11,
        color: "var(--text-dim)",
        margin: "0 0 4px",
      }}
    >
      {label}:{" "}
      <span style={{ color: "var(--text-muted)" }}>{value?.trim() ? value : "unspecified"}</span>
    </p>
  );
}

export function EvidenceBinderPanel({
  records,
  title = "Evidence binder",
  emptyMessage = "No binder evidence for this context yet. Missing evidence stays visible — nothing is invented.",
  returnHref,
  returnLabel = "Return to research workflow",
  assessmentHref,
  maxItems = 12,
  showConflicts = true,
}: {
  records: EvidenceBinderRecord[];
  title?: string;
  emptyMessage?: string;
  returnHref?: string;
  returnLabel?: string;
  assessmentHref?: string;
  maxItems?: number;
  showConflicts?: boolean;
}) {
  const shown = records.slice(0, maxItems);
  const conflicts = showConflicts
    ? records.filter((r) => r.contradictsIds.length > 0 || r.verificationStatus === "conflicting")
    : [];

  return (
    <section
      id="evidence-binder"
      aria-labelledby="evidence-binder-heading"
      style={{ marginBottom: 28 }}
    >
      <p
        id="evidence-binder-heading"
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 10,
          color: "var(--text-dim)",
          letterSpacing: "0.12em",
          marginBottom: 8,
        }}
      >
        {title.toUpperCase()}
      </p>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 13,
          color: "var(--text-muted)",
          lineHeight: 1.55,
          marginBottom: 12,
        }}
      >
        Structured evidence references for this research context. Sources do not prove operational
        resilience or infrastructure independence. Synthetic items are always labelled.
      </p>

      {(returnHref || assessmentHref) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 14,
          }}
        >
          {returnHref && (
            <Link
              href={returnHref}
              style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--accent-cyan)" }}
            >
              {returnLabel}
            </Link>
          )}
          {assessmentHref && (
            <Link
              href={assessmentHref}
              style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--accent-blue)" }}
            >
              Associated assessment →
            </Link>
          )}
        </div>
      )}

      {!shown.length ? (
        <div
          style={{
            border: "1px dashed var(--border2)",
            borderRadius: 6,
            padding: "16px 14px",
            backgroundColor: "var(--surface)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 13,
              color: "var(--text-muted)",
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            {emptyMessage}
          </p>
        </div>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {shown.map((r) => (
            <li
              key={r.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "12px 14px",
                backgroundColor: "var(--surface)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <OriginChip origin={r.origin} />
                <span
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: 10,
                    color: "var(--text-dim)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {r.supportClass.replace(/_/g, " ").toUpperCase()} · {r.verificationStatus}
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text)",
                  margin: "0 0 6px",
                }}
              >
                {r.title}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 13,
                  color: "var(--text-muted)",
                  lineHeight: 1.55,
                  margin: "0 0 8px",
                }}
              >
                {r.description}
              </p>
              <MetaLine label="Id" value={r.id} />
              <MetaLine label="Source org" value={r.sourceOrganisation} />
              <MetaLine label="Publication" value={r.publicationDate} />
              <MetaLine label="Retrieved" value={r.retrievalDate} />
              <MetaLine
                label="Dependency"
                value={r.associations.infrastructureDependencyIds.join(", ") || undefined}
              />
              <MetaLine label="Supports" value={r.supportedClaim} />
              {r.sourceUrl && (
                <p style={{ margin: "6px 0 0", fontFamily: "var(--font-ui)", fontSize: 12 }}>
                  <a href={r.sourceUrl} style={{ color: "var(--accent-blue)" }}>
                    Source / document
                  </a>
                </p>
              )}
              {r.limitations[0] && (
                <p
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 12,
                    color: "var(--text-dim)",
                    margin: "8px 0 0",
                    lineHeight: 1.5,
                  }}
                >
                  Limitation: {r.limitations[0]}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {records.length > maxItems && (
        <p
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 11,
            color: "var(--text-dim)",
            marginTop: 10,
          }}
        >
          Showing {maxItems} of {records.length} binder records
        </p>
      )}

      {conflicts.length > 0 && (
        <div
          style={{
            marginTop: 14,
            padding: "10px 12px",
            borderRadius: 6,
            border: "1px solid rgba(217,119,6,0.35)",
            backgroundColor: "rgba(217,119,6,0.08)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 12,
              color: "var(--accent-amber)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Conflicting sources remain identifiable ({conflicts.length}). Neither side is silently
            overwritten or upgraded to verified fact.
          </p>
        </div>
      )}
    </section>
  );
}
