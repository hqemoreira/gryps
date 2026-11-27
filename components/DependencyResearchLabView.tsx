"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import {
  DEPENDENCY_LAB_FIXTURE_CONTEXT_NOTICE,
  DEPENDENCY_LAB_SIGNATURE_NOTICE,
  REFERENCE_SIGNATURE_LABEL,
  RESEARCH_SCENARIO_LABEL,
  UNKNOWN_RELATIONSHIP_COPY,
  buildLayerViews,
  contradictedRelationships,
  entityById,
  fixtureHasContradiction,
  fixtureHasPositiveSeparation,
  fixtureHasSharedFailureDomain,
  isSyntheticFixture,
  separationRelationships,
  type FixtureEvidence,
  type FixtureRelationship,
} from "@/lib/research/dependency-fixtures";
import {
  EVIDENCE_PACK_NO_SCORE_NOTICE,
  EVIDENCE_PACK_NOTICE,
  LAB_SCENARIO_OPTIONS,
  getLabScenario,
  isEvidencePackId,
  isPublicEvidencePack,
  type LabScenarioId,
} from "@/lib/research/evidence-packs";
import {
  HERO_DEMO_GRADE,
  HERO_DEMO_INPUT,
  HERO_DEMO_PLACE,
  HERO_DEMO_PROFILE_EN,
  HERO_DEMO_SCORE,
  HERO_DEMO_SCENARIO_EN,
} from "@/lib/hero-demo";
import { SCORING_ENGINE_DISPLAY, SCORING_MODEL_LABEL } from "@/lib/model-constants";
import { gradeColor, gradeTextColor } from "@/lib/resilience-colors";

export type DependencyLabWorkflowContext = {
  fromWorkflow?: boolean;
  label?: string;
  lat?: string;
  lng?: string;
  sector?: string;
  providers?: string;
};

const sectionLabel: CSSProperties = {
  fontFamily: "var(--font-data)",
  fontSize: 10,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--text-dim)",
  marginBottom: 10,
};

const panel: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "20px 22px",
};

const body: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: 14,
  lineHeight: 1.55,
  color: "var(--text-muted)",
};

function yesNo(v: boolean): string {
  return v ? "Yes" : "No";
}

function ConfidenceChip({ value }: { value: string }) {
  const color =
    value === "verified"
      ? "var(--accent-green)"
      : value === "documented"
        ? "var(--accent-cyan)"
        : value === "inferred"
          ? "var(--accent-amber)"
          : value === "contradicted"
            ? "var(--accent-red)"
            : value === "unknown"
              ? "var(--text-muted)"
              : "var(--text-dim)";
  return (
    <span
      style={{
        fontFamily: "var(--font-data)",
        fontSize: 10,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color,
        border: `1px solid ${color}`,
        padding: "2px 8px",
        borderRadius: 4,
      }}
    >
      {value}
    </span>
  );
}

function EvidenceCard({ ev }: { ev: FixtureEvidence }) {
  return (
    <article
      id={`evidence-${ev.id}`}
      style={{
        ...panel,
        padding: "14px 16px",
        background: ev.isSynthetic ? "var(--surface2)" : "var(--surface)",
        borderColor: ev.isSynthetic ? "var(--accent-amber)" : "var(--border)",
      }}
    >
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 8 }}
      >
        <h4
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text)",
            margin: 0,
            flex: "1 1 200px",
          }}
        >
          {ev.title}
        </h4>
        {ev.isSynthetic && (
          <span
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--accent-amber)",
              border: "1px solid var(--accent-amber)",
              padding: "2px 8px",
              borderRadius: 4,
            }}
          >
            Synthetic test evidence
          </span>
        )}
        <ConfidenceChip value={ev.verificationStatus} />
      </div>
      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(110px, 140px) 1fr",
          gap: "6px 12px",
          margin: 0,
          fontFamily: "var(--font-ui)",
          fontSize: 12,
          color: "var(--text-muted)",
        }}
      >
        <dt style={{ color: "var(--text-dim)" }}>Publisher</dt>
        <dd style={{ margin: 0 }}>{ev.publisher ?? "—"}</dd>
        <dt style={{ color: "var(--text-dim)" }}>Reference</dt>
        <dd style={{ margin: 0, wordBreak: "break-word" }}>
          {ev.urlOrReference.startsWith("http") ? (
            <a
              href={ev.urlOrReference}
              style={{ color: "var(--accent-blue)" }}
              target="_blank"
              rel="noreferrer"
            >
              {ev.urlOrReference}
            </a>
          ) : (
            ev.urlOrReference
          )}
        </dd>
        <dt style={{ color: "var(--text-dim)" }}>Published</dt>
        <dd style={{ margin: 0 }}>{ev.publicationDate ?? "—"}</dd>
        <dt style={{ color: "var(--text-dim)" }}>Retrieved</dt>
        <dd style={{ margin: 0 }}>{ev.retrievalDate}</dd>
        <dt style={{ color: "var(--text-dim)" }}>Validity</dt>
        <dd style={{ margin: 0 }}>
          {ev.validFrom || ev.validTo ? `${ev.validFrom ?? "—"} → ${ev.validTo ?? "open"}` : "—"}
        </dd>
        <dt style={{ color: "var(--text-dim)" }}>Type</dt>
        <dd style={{ margin: 0 }}>{ev.evidenceType}</dd>
        {ev.accessClass ? (
          <>
            <dt style={{ color: "var(--text-dim)" }}>Access</dt>
            <dd style={{ margin: 0 }}>{ev.accessClass}</dd>
          </>
        ) : null}
        {ev.supportsClaimType ? (
          <>
            <dt style={{ color: "var(--text-dim)" }}>Supports</dt>
            <dd style={{ margin: 0 }}>{ev.supportsClaimType}</dd>
          </>
        ) : null}
        {ev.relevantPassage ? (
          <>
            <dt style={{ color: "var(--text-dim)" }}>Passage</dt>
            <dd style={{ margin: 0, fontStyle: "italic" }}>{ev.relevantPassage}</dd>
          </>
        ) : null}
        <dt style={{ color: "var(--text-dim)" }}>Claim</dt>
        <dd style={{ margin: 0, color: "var(--text)" }}>{ev.claim}</dd>
        <dt style={{ color: "var(--text-dim)" }}>Scope</dt>
        <dd style={{ margin: 0 }}>
          {ev.scope.label}
          {ev.scope.precision ? ` · ${ev.scope.precision}` : ""}
        </dd>
        {(ev.qualifies || ev.qualifiedBy || ev.supersedes || ev.supersededBy) && (
          <>
            <dt style={{ color: "var(--text-dim)" }}>Temporal link</dt>
            <dd style={{ margin: 0 }}>
              {ev.qualifies ? `Qualifies ${ev.qualifies}` : null}
              {ev.qualifiedBy ? `Qualified by ${ev.qualifiedBy}` : null}
              {ev.supersedes ? `Supersedes ${ev.supersedes}` : null}
              {ev.supersededBy ? `Superseded by ${ev.supersededBy}` : null}
              {!ev.supersedes && !ev.supersededBy && (ev.qualifies || ev.qualifiedBy)
                ? " — does not delete the earlier record"
                : null}
            </dd>
          </>
        )}
        <dt style={{ color: "var(--text-dim)" }}>Limitations</dt>
        <dd style={{ margin: 0 }}>{ev.limitations}</dd>
      </dl>
    </article>
  );
}

function RelationshipRow({
  rel,
  scenarioId,
}: {
  rel: FixtureRelationship;
  scenarioId: LabScenarioId;
}) {
  const fixture = getLabScenario(scenarioId);
  const from = entityById(fixture, rel.fromId);
  const to = entityById(fixture, rel.toId);
  return (
    <li
      style={{
        borderTop: "1px solid var(--border)",
        padding: "12px 0",
        listStyle: "none",
      }}
    >
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 6 }}
      >
        <span style={{ fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text)" }}>
          {from?.name ?? rel.fromId}
          <span style={{ color: "var(--text-dim)" }}> —{rel.type}→ </span>
          {to?.name ?? rel.toId}
        </span>
        <ConfidenceChip value={rel.confidence} />
        <span
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 10,
            color: "var(--text-dim)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {rel.assertionKind}
          {rel.inferred ? " · inferred" : ""}
        </span>
      </div>
      <p style={{ ...body, fontSize: 12, marginBottom: 6 }}>{rel.limitations}</p>
      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 11,
          color: "var(--text-dim)",
          margin: 0,
        }}
      >
        Scope: {rel.scope.label}
        {rel.evidenceIds.length > 0 ? (
          <>
            {" · Evidence: "}
            {rel.evidenceIds.map((eid, i) => (
              <span key={eid}>
                {i > 0 ? ", " : ""}
                <a href={`#evidence-${eid}`} style={{ color: "var(--accent-cyan)" }}>
                  {eid}
                </a>
              </span>
            ))}
          </>
        ) : (
          " · Evidence: —"
        )}
      </p>
    </li>
  );
}

export function DependencyResearchLabView({
  initialScenarioId,
  workflowContext,
}: {
  initialScenarioId?: LabScenarioId;
  workflowContext?: DependencyLabWorkflowContext;
} = {}) {
  const [scenarioId, setScenarioId] = useState<LabScenarioId>(
    initialScenarioId ?? "fixture-b-starlink-iridium"
  );
  const fixture = useMemo(() => getLabScenario(scenarioId), [scenarioId]);
  const layers = useMemo(() => buildLayerViews(fixture), [fixture]);
  const synthetic = isSyntheticFixture(fixture);
  const publicPack = isPublicEvidencePack(fixture) || isEvidencePackId(scenarioId);
  const sharedDomain = fixtureHasSharedFailureDomain(fixture);
  const hasSeparation = fixtureHasPositiveSeparation(fixture);
  const hasContradiction = fixtureHasContradiction(fixture);
  const separations = separationRelationships(fixture);
  const contradicted = contradictedRelationships(fixture);
  const gc = gradeColor(HERO_DEMO_GRADE);
  const gtc = gradeTextColor(HERO_DEMO_GRADE);

  const providerEntities = fixture.entities.filter((e) => e.kind === "service_provider");
  const scenarioOption = LAB_SCENARIO_OPTIONS.find((o) => o.id === scenarioId);

  return (
    <main
      style={{
        maxWidth: "var(--content-max)",
        margin: "0 auto",
        padding: "28px var(--pad-x) 72px",
      }}
    >
      <header style={{ marginBottom: 28 }}>
        <p
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--accent-amber)",
            marginBottom: 10,
          }}
        >
          Research preview · Experimental · Non-scoring
        </p>
        {workflowContext && (
          <div
            style={{
              ...panel,
              marginBottom: 16,
              borderColor: "var(--accent-cyan)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-data)",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--accent-cyan)",
                marginBottom: 8,
              }}
            >
              Research workflow context
            </p>
            <p style={{ ...body, fontSize: 13, margin: 0 }}>
              {workflowContext.label ? `${workflowContext.label} · ` : ""}
              {workflowContext.lat != null && workflowContext.lng != null
                ? `${workflowContext.lat}°N, ${workflowContext.lng}°E`
                : "coordinates not set"}
              {workflowContext.sector ? ` · ${workflowContext.sector}` : ""}
              {workflowContext.providers
                ? ` · session providers: ${workflowContext.providers}`
                : " · session providers: UNKNOWN"}
            </p>
            <p style={{ ...body, fontSize: 12, margin: "8px 0 0" }}>
              Context is for navigation only. It does not invent site serving paths or change the
              Reference Signature.{" "}
              <Link href="/research/workflow" style={{ color: "var(--accent-cyan)" }}>
                Return to research workflow
              </Link>
            </p>
          </div>
        )}
        <h1
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            marginBottom: 10,
          }}
        >
          Dependency research lab
        </h1>
        <p style={{ ...body, maxWidth: 720 }}>
          Prototype interface for the proposed hybrid catalogue + dependency model. It does not
          assess operational path independence, does not write to persistence, and does not change{" "}
          {SCORING_MODEL_LABEL} ({SCORING_ENGINE_DISPLAY}).
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Dependency research scenarios"
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}
      >
        {LAB_SCENARIO_OPTIONS.map((opt) => {
          const active = opt.id === scenarioId;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setScenarioId(opt.id)}
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 13,
                fontWeight: 600,
                padding: "10px 14px",
                borderRadius: 8,
                border: active
                  ? opt.kind === "evidence_pack"
                    ? "1px solid var(--accent-green)"
                    : "1px solid var(--accent-cyan)"
                  : "1px solid var(--border)",
                background: active ? "var(--surface2)" : "var(--surface)",
                color: active ? "var(--text)" : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              {opt.shortLabel}
            </button>
          );
        })}
      </div>

      {publicPack && (
        <div
          role="status"
          style={{
            ...panel,
            marginBottom: 20,
            borderColor: "var(--accent-green)",
            background: "var(--surface2)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent-green)",
              marginBottom: 8,
            }}
          >
            Public evidence pack · Research only
          </p>
          <p style={{ ...body, margin: "0 0 8px", color: "var(--text)" }}>{EVIDENCE_PACK_NOTICE}</p>
          <p style={{ ...body, margin: 0, color: "var(--text-muted)" }}>
            {EVIDENCE_PACK_NO_SCORE_NOTICE}
          </p>
        </div>
      )}

      {synthetic && (
        <div
          role="status"
          style={{
            ...panel,
            marginBottom: 20,
            borderColor: "var(--accent-amber)",
            background: "var(--surface2)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent-amber)",
              marginBottom: 8,
            }}
          >
            Synthetic fixture
          </p>
          <p style={{ ...body, margin: 0, color: "var(--text)" }}>
            All entities and evidence in this fixture are fictional synthetic test data. They must
            not be read as claims about Starlink, OneWeb, Iridium, or any real operator.
          </p>
        </div>
      )}

      {/* A · Reference Signature */}
      <section aria-labelledby="dep-lab-signature" style={{ marginBottom: 28 }}>
        <h2 id="dep-lab-signature" style={sectionLabel}>
          A · {REFERENCE_SIGNATURE_LABEL}
        </h2>
        <div style={panel}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-end" }}>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 48,
                  fontWeight: 700,
                  color: gtc,
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                {HERO_DEMO_SCORE}
                <span style={{ fontSize: 22, color: "var(--text-muted)" }}>
                  {" "}
                  · {HERO_DEMO_GRADE}
                </span>
              </p>
              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 11,
                  color: gc,
                  marginTop: 6,
                  letterSpacing: "0.08em",
                }}
              >
                {SCORING_MODEL_LABEL}
              </p>
            </div>
            <div style={{ flex: "1 1 240px" }}>
              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 15,
                  color: "var(--text)",
                  margin: "0 0 4px",
                }}
              >
                {HERO_DEMO_SCENARIO_EN}
              </p>
              <p style={{ ...body, fontSize: 13, margin: 0 }}>{HERO_DEMO_PLACE}</p>
              <p style={{ ...body, fontSize: 13, margin: "4px 0 0" }}>{HERO_DEMO_PROFILE_EN}</p>
              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 11,
                  color: "var(--text-dim)",
                  marginTop: 8,
                }}
              >
                Reference providers: {HERO_DEMO_INPUT.providers.join(" + ")} · {HERO_DEMO_INPUT.lat}
                °N, {HERO_DEMO_INPUT.lng}°E · {HERO_DEMO_INPUT.sector} · {HERO_DEMO_INPUT.autonomy}{" "}
                · {HERO_DEMO_INPUT.criticality}
              </p>
            </div>
          </div>
          <p
            role="note"
            style={{
              ...body,
              fontSize: 13,
              marginTop: 16,
              paddingTop: 14,
              borderTop: "1px solid var(--border)",
              color: "var(--text)",
            }}
          >
            {DEPENDENCY_LAB_SIGNATURE_NOTICE}
          </p>
        </div>
      </section>

      {/* Research scenario context */}
      <section aria-labelledby="dep-lab-research-scenario" style={{ marginBottom: 28 }}>
        <h2 id="dep-lab-research-scenario" style={sectionLabel}>
          {RESEARCH_SCENARIO_LABEL}
        </h2>
        <div style={panel}>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 15,
              color: "var(--text)",
              margin: "0 0 8px",
            }}
          >
            {scenarioOption?.label ?? fixture.displayName ?? scenarioId}
          </p>
          <p style={{ ...body, fontSize: 13, margin: "0 0 10px" }}>{fixture.purpose}</p>
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 12,
              color: "var(--text)",
              margin: "0 0 8px",
            }}
          >
            {publicPack ? "Envelope providers: " : "Fixture providers: "}
            {providerEntities.map((p) => p.name).join(" · ") ||
              fixture.catalogueClassification.providerIds.join(" · ")}
          </p>
          <p style={{ ...body, fontSize: 13, margin: 0, color: "var(--text)" }}>
            {publicPack ? EVIDENCE_PACK_NOTICE : DEPENDENCY_LAB_FIXTURE_CONTEXT_NOTICE}
          </p>
          {hasSeparation && (
            <p style={{ ...body, fontSize: 13, marginTop: 12, color: "var(--accent-green)" }}>
              Positive separation is documented only for:{" "}
              {separations
                .map((r) => {
                  const from = entityById(fixture, r.fromId)?.name ?? r.fromId;
                  const to = entityById(fixture, r.toId)?.name ?? r.toId;
                  return `${from} separated_from ${to} (${r.scope.label})`;
                })
                .join("; ")}
              . Other layers remain Unknown unless evidenced.
            </p>
          )}
          {hasContradiction && (
            <p style={{ ...body, fontSize: 13, marginTop: 12, color: "var(--accent-amber)" }}>
              Unresolved contradiction on {contradicted.length} relationship
              {contradicted.length === 1 ? "" : "s"} (confidence: contradicted). Newer evidence does
              not automatically override earlier evidence — both records are retained.
            </p>
          )}
        </div>
      </section>

      {/* B · Catalogue classifications */}
      <section aria-labelledby="dep-lab-catalogue" style={{ marginBottom: 28 }}>
        <h2 id="dep-lab-catalogue" style={sectionLabel}>
          B · Provider diversity and catalogue classifications
          {publicPack ? " (evidence pack)" : " (fixture)"}
        </h2>
        <div style={panel}>
          <p style={{ ...body, marginBottom: 14 }}>{fixture.catalogueClassification.note}</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {[
              {
                label: "Provider diversity",
                value: yesNo(fixture.catalogueClassification.providerDiversity),
              },
              {
                label: "Catalogue-based orbit mix",
                value: yesNo(fixture.catalogueClassification.catalogueBasedOrbitMix),
              },
              {
                label: "Catalogue confidence",
                value: "Not used here — separate v0.4 component",
              },
              {
                label: "Infrastructure independence",
                value: "Not established by this classification",
              },
            ].map((cell) => (
              <div
                key={cell.label}
                style={{
                  background: "var(--surface2)",
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--text-dim)",
                    marginBottom: 6,
                  }}
                >
                  {cell.label}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 13,
                    color: "var(--text)",
                    margin: 0,
                  }}
                >
                  {cell.value}
                </p>
              </div>
            ))}
          </div>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {providerEntities.map((p) => (
              <li
                key={p.id}
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 12,
                  color: "var(--text-muted)",
                  borderTop: "1px solid var(--border)",
                  paddingTop: 8,
                }}
              >
                <span style={{ color: "var(--text)", fontWeight: 600 }}>{p.name}</span>
                {" · "}
                {String(p.attributes?.orbit ?? "—")}
                {" · "}
                {String(p.attributes?.serviceClass ?? "—")}
                {p.attributes?.catalogueId != null
                  ? ` · id ${String(p.attributes.catalogueId)}`
                  : ""}
                {p.attributes?.fictional === true ? " · fictional" : ""}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* C · Dependency layers */}
      <section aria-labelledby="dep-lab-layers" style={{ marginBottom: 28 }}>
        <h2 id="dep-lab-layers" style={sectionLabel}>
          C · Dependency layers
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {layers.map((layer) => (
            <div key={layer.id} style={panel}>
              <h3
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 10,
                }}
              >
                {layer.label}
              </h3>

              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  marginBottom: 6,
                }}
              >
                Known entities
              </p>
              {layer.entities.length === 0 ? (
                <p style={{ ...body, fontSize: 13, marginBottom: 12 }}>
                  None instantiated in this fixture.
                </p>
              ) : (
                <ul style={{ margin: "0 0 12px", paddingLeft: 18, ...body, fontSize: 13 }}>
                  {layer.entities.map((e) => (
                    <li key={e.id}>
                      {e.name}
                      {e.attributes?.fictional === true ? " (synthetic)" : ""}
                      {e.attributes?.spaceSegmentProfile
                        ? ` · ${String(e.attributes.spaceSegmentProfile)}`
                        : ""}
                      {e.kind === "failure_domain" && e.attributes?.layer
                        ? ` · layer ${String(e.attributes.layer)}`
                        : ""}
                    </li>
                  ))}
                </ul>
              )}

              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  marginBottom: 0,
                }}
              >
                Documented relationships
              </p>
              {layer.relationships.length === 0 ? (
                <p style={{ ...body, fontSize: 13, margin: "6px 0 12px" }}>
                  No evidenced relationships in this layer for the fixture.
                </p>
              ) : (
                <ul style={{ margin: 0, padding: 0 }}>
                  {layer.relationships.map((r) => (
                    <RelationshipRow key={r.id} rel={r} scenarioId={scenarioId} />
                  ))}
                </ul>
              )}

              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  margin: "12px 0 6px",
                }}
              >
                Unknown relationships
              </p>
              {layer.unknowns.length === 0 ? (
                <p style={{ ...body, fontSize: 13, margin: 0 }}>
                  No explicit UNKNOWN entries for this layer in the fixture.
                </p>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {layer.unknowns.map((u) => (
                    <li
                      key={u.id}
                      style={{
                        background: "var(--surface2)",
                        borderRadius: 8,
                        padding: "12px 14px",
                        marginBottom: 8,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-ui)",
                          fontSize: 13,
                          color: "var(--text)",
                          margin: "0 0 6px",
                        }}
                      >
                        {UNKNOWN_RELATIONSHIP_COPY}
                      </p>
                      <p style={{ ...body, fontSize: 12, margin: "0 0 4px" }}>{u.question}</p>
                      <p
                        style={{
                          fontFamily: "var(--font-data)",
                          fontSize: 11,
                          color: "var(--text-dim)",
                          margin: 0,
                        }}
                      >
                        Must not infer: {u.mustNotInfer}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* D · Evidence */}
      <section aria-labelledby="dep-lab-evidence" style={{ marginBottom: 28 }}>
        <h2 id="dep-lab-evidence" style={sectionLabel}>
          D · Evidence and provenance
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {fixture.evidence.map((ev) => (
            <EvidenceCard key={ev.id} ev={ev} />
          ))}
        </div>
        <p style={{ ...body, marginTop: 12, fontSize: 13 }}>
          Binder view (same Research Library catalog — not a second evidence library):{" "}
          <Link
            href={`/research?from=workflow&binder=1&lab=${encodeURIComponent(scenarioId)}#evidence-binder`}
            style={{ color: "var(--accent-cyan)" }}
          >
            Open evidence binder for this scenario
          </Link>
        </p>
      </section>

      {/* E · Interpretation */}
      <section aria-labelledby="dep-lab-interpretation" style={{ marginBottom: 12 }}>
        <h2 id="dep-lab-interpretation" style={sectionLabel}>
          E · Research interpretation
        </h2>
        <div style={panel}>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 12,
            }}
          >
            {fixture.researchConclusion}
          </p>
          <p style={{ ...body, marginBottom: 10 }}>
            <strong style={{ color: "var(--text)", fontWeight: 600 }}>Establishes: </strong>
            {fixture.purpose}
          </p>
          <p style={{ ...body, marginBottom: 10 }}>
            <strong style={{ color: "var(--text)", fontWeight: 600 }}>Does not establish: </strong>
            {fixture.claimsNotToMake.slice(0, 3).join("; ")}.
          </p>
          <p style={{ ...body, marginBottom: 10 }}>
            <strong style={{ color: "var(--text)", fontWeight: 600 }}>Unknown layers: </strong>
            {fixture.unknownRelationships.length === 0
              ? "None declared."
              : [...new Set(fixture.unknownRelationships.map((u) => u.layer))].join(", ")}
            .
          </p>
          <p style={{ ...body, marginBottom: 10 }}>
            <strong style={{ color: "var(--text)", fontWeight: 600 }}>
              Shared failure domain:{" "}
            </strong>
            {hasContradiction
              ? "Contested — evidence conflicts; shared exposure cannot be classified as established or absent."
              : sharedDomain
                ? "Yes — fixture models a common infrastructure entity affecting both paths (structural demo only; no probability)."
                : hasSeparation
                  ? "Not for the separated layer — other layers remain Unknown and are not implied shared or independent."
                  : "Not demonstrated — remaining coupling across ground, backhaul, operations, and site is Unknown."}
          </p>
          {hasSeparation && (
            <p style={{ ...body, marginBottom: 10 }}>
              <strong style={{ color: "var(--text)", fontWeight: 600 }}>Scoped separation: </strong>
              Evidence supports separation only for the named infrastructure dependency. This does
              not establish complete end-to-end independence.
            </p>
          )}
          {hasContradiction && (
            <p style={{ ...body, marginBottom: 10 }}>
              <strong style={{ color: "var(--text)", fontWeight: 600 }}>
                Contradiction status:{" "}
              </strong>
              Unresolved. Earlier and later evidence records are both preserved; a newer publication
              date alone does not select the correct claim.
            </p>
          )}
          <p style={{ ...body, margin: 0 }}>
            <strong style={{ color: "var(--text)", fontWeight: 600 }}>
              Why no research score:{" "}
            </strong>
            Fixtures carry{" "}
            <code style={{ fontFamily: "var(--font-data)", fontSize: 12 }}>
              containsScoreOrProbability: {String(fixture.containsScoreOrProbability)}
            </code>{" "}
            and{" "}
            <code style={{ fontFamily: "var(--font-data)", fontSize: 12 }}>
              isOperationalAssessment: {String(fixture.isOperationalAssessment)}
            </code>
            . Provider diversity and catalogue-based orbit mix are catalogue classifications, not
            infrastructure independence.
          </p>
          <ul style={{ margin: "14px 0 0", paddingLeft: 18, ...body, fontSize: 12 }}>
            {fixture.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
