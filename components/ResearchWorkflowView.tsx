"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  WORKFLOW_DISCLAIMER_EN,
  WORKFLOW_STAGES,
  buildAdvisorHref,
  buildDependencyLabHref,
  buildEvidenceBinderHref,
  buildEvidenceLibraryHref,
  buildKnowledgeHref,
  buildWorkspaceHref,
  clearWorkflowSession,
  emptyWorkflowSession,
  findMatchingSavedAssessment,
  homepageRegressionSession,
  loadWorkflowSession,
  missingInformation,
  providersUnknown,
  resolveLinkedAssessment,
  saveWorkflowSession,
  scenarioFieldsComplete,
  siteFieldsComplete,
  stageStatus,
  type ResearchWorkflowSession,
  type WorkflowStageId,
  type WorkflowStageStatus,
} from "@/lib/research/workflow-context";
import { LAB_SCENARIO_OPTIONS, type LabScenarioId } from "@/lib/research/evidence-packs";
import { getSavedAssessment, listSavedAssessments } from "@/lib/research-workspace";
import { SCORING_ENGINE_DISPLAY, SCORING_MODEL_LABEL } from "@/lib/model-constants";
import {
  evidenceForLabScenario,
  missingEvidenceForSession,
} from "@/lib/research/evidence-binder";
import { listAssociationsForAssessment } from "@/lib/research/evidence-annotation-store";

const SECTORS = [
  "mining",
  "forestry",
  "maritime",
  "energy",
  "arctic",
  "research",
  "other",
] as const;

const AUTONOMY = ["manual", "remote-operated", "mixed", "autonomous"] as const;
const CRITICALITY = ["standard", "high", "safety-critical"] as const;
const PROVIDER_OPTIONS = ["starlink", "oneweb", "iridium", "inmarsat", "vsat"] as const;

const panel: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "20px 22px",
};

const label: CSSProperties = {
  fontFamily: "var(--font-data)",
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--text-dim)",
  display: "block",
  marginBottom: 6,
};

const input: CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-ui)",
  fontSize: 14,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border2)",
  background: "var(--bg)",
  color: "var(--text)",
};

const body: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: 14,
  lineHeight: 1.55,
  color: "var(--text-muted)",
};

function statusColor(s: WorkflowStageStatus): string {
  if (s === "complete") return "var(--accent-green)";
  if (s === "ready") return "var(--accent-cyan)";
  if (s === "unavailable") return "var(--text-dim)";
  return "var(--accent-amber)";
}

function statusLabel(s: WorkflowStageStatus): string {
  if (s === "complete") return "Complete";
  if (s === "ready") return "Ready";
  if (s === "unavailable") return "Not available yet";
  return "Not started";
}

export function ResearchWorkflowView() {
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<ResearchWorkflowSession>(() => emptyWorkflowSession());
  const [workspaceCount, setWorkspaceCount] = useState(0);
  const [assessmentIds, setAssessmentIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const refreshWorkspace = useCallback(() => {
    const items = listSavedAssessments();
    setWorkspaceCount(items.length);
    setAssessmentIds(items.map((a) => a.id));
  }, []);

  useEffect(() => {
    setSession(loadWorkflowSession());
    refreshWorkspace();
    setHydrated(true);
  }, [refreshWorkspace]);

  const persist = useCallback((next: ResearchWorkflowSession) => {
    setSession(saveWorkflowSession(next));
  }, []);

  const statuses = useMemo(() => {
    const map = {} as Record<WorkflowStageId, WorkflowStageStatus>;
    for (const stage of WORKFLOW_STAGES) {
      map[stage.id] = stageStatus(session, stage.id, workspaceCount, assessmentIds);
    }
    return map;
  }, [session, workspaceCount, assessmentIds]);

  const linkedResolution = useMemo(
    () => resolveLinkedAssessment(session, assessmentIds),
    [session, assessmentIds]
  );

  const associationCount = useMemo(() => {
    if (linkedResolution.status !== "linked") return 0;
    return listAssociationsForAssessment(linkedResolution.id).length;
  }, [linkedResolution]);

  const missing = useMemo(() => missingInformation(session), [session]);

  function saveSiteScenario() {
    const next: ResearchWorkflowSession = {
      ...session,
      stages: {
        ...session.stages,
        siteDefined: siteFieldsComplete(session),
        scenarioDefined: scenarioFieldsComplete(session),
      },
    };
    if (!siteFieldsComplete(session)) {
      setMessage("Site needs numeric latitude and longitude before it can be marked complete.");
      persist(next);
      return;
    }
    if (!scenarioFieldsComplete(session)) {
      setMessage("Scenario needs sector, operating mode, and criticality.");
      persist(next);
      return;
    }
    persist(next);
    setMessage(
      providersUnknown(session)
        ? "Site and scenario saved. Catalogue providers remain UNKNOWN — not invented."
        : "Site and scenario saved into the local research session."
    );
  }

  function markStage(
    key: keyof ResearchWorkflowSession["stages"],
    value: boolean,
    okMessage: string
  ) {
    persist({
      ...session,
      stages: { ...session.stages, [key]: value },
    });
    setMessage(okMessage);
    refreshWorkspace();
  }

  function toggleProvider(id: string) {
    const has = session.providers.includes(id);
    persist({
      ...session,
      providers: has ? session.providers.filter((p) => p !== id) : [...session.providers, id],
      stages: { ...session.stages, scenarioDefined: false },
    });
  }

  if (!hydrated) {
    return <div style={{ minHeight: "50vh", background: "var(--bg)" }} />;
  }

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
          Research workflow · Experimental · Non-commercial
        </p>
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
          Integrated research assessment
        </h1>
        <p style={{ ...body, maxWidth: 720, marginBottom: 12 }}>
          Define a site and scenario once, then move through dependencies, evidence, Model v0.4
          assessment, workspace comparison, and report export — without re-typing the same
          coordinates. Local browser session only · no accounts · no Neon writes.
        </p>
        <p style={{ ...body, fontSize: 13, color: "var(--text-dim)", maxWidth: 720 }}>
          {WORKFLOW_DISCLAIMER_EN}
        </p>
        <p style={{ ...body, fontSize: 12, marginTop: 10, color: "var(--text-dim)" }}>
          {SCORING_MODEL_LABEL} · {SCORING_ENGINE_DISPLAY}
        </p>
      </header>

      {/* Stage strip */}
      <nav aria-label="Research workflow stages" style={{ ...panel, marginBottom: 20 }}>
        <p style={{ ...label, marginBottom: 14 }}>Where you are</p>
        <ol
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gap: 10,
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          }}
        >
          {WORKFLOW_STAGES.map((stage, i) => {
            const st = statuses[stage.id];
            return (
              <li key={stage.id} style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: statusColor(st),
                    marginBottom: 4,
                  }}
                >
                  {i + 1}. {stage.en}
                </div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text)" }}>
                  {statusLabel(st)}
                </div>
              </li>
            );
          })}
        </ol>
        <p style={{ ...body, fontSize: 12, marginTop: 14, marginBottom: 0 }}>
          Opening a linked page does not mark a stage complete. Use the acknowledgement actions
          below.
        </p>
      </nav>

      {message && (
        <p
          role="status"
          style={{
            ...panel,
            marginBottom: 20,
            borderColor: "var(--accent-cyan)",
            color: "var(--text)",
            fontSize: 14,
          }}
        >
          {message}
        </p>
      )}

      {/* Missing */}
      <section style={{ ...panel, marginBottom: 20 }}>
        <p style={label}>Missing or unknown</p>
        {missing.length === 0 ? (
          <p style={{ ...body, margin: 0 }}>No open gaps recorded in this session.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, ...body }}>
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </section>

      {/* Site + scenario form */}
      <section style={{ ...panel, marginBottom: 20 }}>
        <p style={label}>1–2 · Site and scenario</p>
        <div
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={label} htmlFor="rw-label">
              Site label (optional)
            </label>
            <input
              id="rw-label"
              style={input}
              value={session.siteLabel}
              onChange={(e) => persist({ ...session, siteLabel: e.target.value })}
              placeholder="e.g. Northern Finland research envelope"
            />
          </div>
          <div>
            <label style={label} htmlFor="rw-lat">
              Latitude °N
            </label>
            <input
              id="rw-lat"
              style={input}
              inputMode="decimal"
              value={session.lat}
              onChange={(e) =>
                persist({
                  ...session,
                  lat: e.target.value,
                  stages: { ...session.stages, siteDefined: false },
                })
              }
              placeholder="67.0"
            />
          </div>
          <div>
            <label style={label} htmlFor="rw-lng">
              Longitude °E
            </label>
            <input
              id="rw-lng"
              style={input}
              inputMode="decimal"
              value={session.lng}
              onChange={(e) =>
                persist({
                  ...session,
                  lng: e.target.value,
                  stages: { ...session.stages, siteDefined: false },
                })
              }
              placeholder="26.0"
            />
          </div>
          <div>
            <label style={label} htmlFor="rw-sector">
              Sector
            </label>
            <select
              id="rw-sector"
              style={input}
              value={session.sector}
              onChange={(e) =>
                persist({
                  ...session,
                  sector: e.target.value,
                  stages: { ...session.stages, scenarioDefined: false },
                })
              }
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={label} htmlFor="rw-autonomy">
              Operating mode
            </label>
            <select
              id="rw-autonomy"
              style={input}
              value={session.autonomy}
              onChange={(e) =>
                persist({
                  ...session,
                  autonomy: e.target.value,
                  stages: { ...session.stages, scenarioDefined: false },
                })
              }
            >
              {AUTONOMY.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={label} htmlFor="rw-crit">
              Criticality
            </label>
            <select
              id="rw-crit"
              style={input}
              value={session.criticality}
              onChange={(e) =>
                persist({
                  ...session,
                  criticality: e.target.value,
                  stages: { ...session.stages, scenarioDefined: false },
                })
              }
            >
              {CRITICALITY.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <span style={label}>Catalogue providers (optional)</span>
            <p style={{ ...body, fontSize: 12, margin: "0 0 8px" }}>
              Leave empty to keep providers UNKNOWN. Do not invent satellite use from remoteness
              alone.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PROVIDER_OPTIONS.map((p) => {
                const on = session.providers.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleProvider(p)}
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: 11,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: `1px solid ${on ? "var(--accent-cyan)" : "var(--border2)"}`,
                      background: on
                        ? "color-mix(in srgb, var(--accent-cyan) 16%, transparent)"
                        : "transparent",
                      color: "var(--text)",
                      cursor: "pointer",
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={label} htmlFor="rw-notes">
              Researcher notes (local)
            </label>
            <textarea
              id="rw-notes"
              style={{ ...input, minHeight: 72, resize: "vertical" }}
              value={session.notes}
              onChange={(e) => persist({ ...session, notes: e.target.value })}
              placeholder="Assumptions, unknowns, questions — not evidence."
            />
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
          <button
            type="button"
            onClick={saveSiteScenario}
            style={{
              fontFamily: "var(--font-ui)",
              fontWeight: 600,
              fontSize: 14,
              padding: "12px 18px",
              borderRadius: 10,
              border: "none",
              background: "var(--accent-blue)",
              color: "var(--on-accent, #070B12)",
              cursor: "pointer",
            }}
          >
            Save site · scenario
          </button>
          <button
            type="button"
            onClick={() => {
              persist(homepageRegressionSession());
              setMessage(
                "Loaded homepage regression example (67°N, 26°E · mining · Starlink + Iridium). Score remains a research regression lock — not a field measurement."
              );
            }}
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 14,
              padding: "12px 18px",
              borderRadius: 10,
              border: "1px solid var(--border2)",
              background: "transparent",
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            Load 83 · B regression example
          </button>
          <button
            type="button"
            onClick={() => {
              persist(clearWorkflowSession());
              setMessage("Local workflow session cleared. Workspace assessments were not deleted.");
            }}
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 14,
              padding: "12px 18px",
              borderRadius: 10,
              border: "1px solid var(--border2)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            Clear session
          </button>
        </div>
      </section>

      {/* Downstream stages */}
      <section style={{ display: "grid", gap: 16 }}>
        <StageCard
          title="3 · Dependencies"
          status={statuses.dependencies}
          summary={WORKFLOW_STAGES[2].summaryEn}
          disabled={statuses.dependencies === "unavailable"}
        >
          <p style={{ ...body, fontSize: 13 }}>
            Opens the Dependency Research Lab with this session&apos;s coordinates and providers as
            context. Lab fixtures do not invent site serving paths and do not change the Signature.
          </p>
          <label style={{ ...label, marginTop: 8 }} htmlFor="rw-lab">
            Preferred lab scenario
          </label>
          <select
            id="rw-lab"
            style={{ ...input, marginBottom: 12 }}
            value={session.preferredLabScenario}
            onChange={(e) =>
              persist({
                ...session,
                preferredLabScenario: e.target.value as LabScenarioId,
              })
            }
          >
            {LAB_SCENARIO_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link
              href={buildDependencyLabHref(session)}
              style={linkBtn(statuses.dependencies === "unavailable")}
            >
              Open Dependency Lab
            </Link>
            <button
              type="button"
              disabled={statuses.dependencies === "unavailable"}
              onClick={() =>
                markStage(
                  "dependenciesReviewed",
                  true,
                  "Dependencies stage acknowledged. UNKNOWN relationships remain UNKNOWN."
                )
              }
              style={ackBtn(statuses.dependencies === "unavailable")}
            >
              Mark dependency review noted
            </button>
          </div>
        </StageCard>

        <StageCard
          title="4 · Evidence"
          status={statuses.evidence}
          summary={WORKFLOW_STAGES[3].summaryEn}
          disabled={statuses.evidence === "unavailable"}
        >
          <p style={{ ...body, fontSize: 13 }}>
            Research Library and the Evidence Binder preserve provenance. Public packs and
            synthetic fixtures are not operational proof. Intake remains research-only. Acknowledging
            this stage does not mark research as complete or claims as verified.
          </p>
          <p style={{ ...body, fontSize: 12, color: "var(--text-dim)" }}>
            Binder records for {session.preferredLabScenario}:{" "}
            {evidenceForLabScenario(session.preferredLabScenario).length}
            {" · "}
            Persisted associations on linked assessment: {associationCount}
            {" · "}
            Missing / insufficient:{" "}
            {missingEvidenceForSession(session).length
              ? missingEvidenceForSession(session).join("; ")
              : "none flagged"}
            . Counts do not mark this stage complete.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link
              href={buildEvidenceLibraryHref()}
              style={linkBtn(statuses.evidence === "unavailable")}
            >
              Research Library
            </Link>
            <Link
              href={buildEvidenceBinderHref(session)}
              style={linkBtn(statuses.evidence === "unavailable")}
            >
              Evidence binder
            </Link>
            <Link href={buildKnowledgeHref()} style={linkBtn(statuses.evidence === "unavailable")}>
              Evidence / knowledge
            </Link>
            <Link href="/methodology" style={linkBtn(statuses.evidence === "unavailable")}>
              Methodology
            </Link>
            <button
              type="button"
              disabled={statuses.evidence === "unavailable"}
              onClick={() =>
                markStage(
                  "evidenceReviewed",
                  true,
                  "Evidence stage acknowledged. No claim upgraded to verified independence."
                )
              }
              style={ackBtn(statuses.evidence === "unavailable")}
            >
              Mark evidence review noted
            </button>
          </div>
        </StageCard>

        <StageCard
          title="5 · Assessment"
          status={statuses.assessment}
          summary={WORKFLOW_STAGES[4].summaryEn}
          disabled={statuses.assessment === "unavailable"}
        >
          <p style={{ ...body, fontSize: 13 }}>
            Deep-links the Resilience Advisor with this session&apos;s inputs. Model v0.4 is
            unchanged. Save the result from the Advisor into Assessments (local workspace), then
            link it here.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <Link
              href={buildAdvisorHref(session)}
              style={linkBtn(statuses.assessment === "unavailable")}
            >
              Open Advisor with session inputs
            </Link>
            <button
              type="button"
              disabled={statuses.assessment === "unavailable"}
              onClick={() => {
                refreshWorkspace();
                const items = listSavedAssessments();
                if (!items.length) {
                  setMessage(
                    "No saved workspace assessment found. Run Advisor and save to Assessments first."
                  );
                  return;
                }
                const matched = findMatchingSavedAssessment(session, items);
                if (!matched) {
                  setMessage(
                    "No saved assessment matches this session’s coordinates, sector, autonomy and criticality. Save a matching Advisor run before linking — do not link an unrelated latest result."
                  );
                  return;
                }
                persist({
                  ...session,
                  linkedAssessmentId: matched.id,
                  stages: { ...session.stages, assessmentLinked: true },
                });
                setMessage(`Linked matching workspace assessment: ${matched.title}`);
              }}
              style={ackBtn(statuses.assessment === "unavailable")}
            >
              Link matching saved assessment
            </button>
          </div>
          {session.linkedAssessmentId && (
            <div style={{ marginTop: 10 }}>
              <p style={{ ...body, fontSize: 12 }}>
                Linked id:{" "}
                {linkedResolution.status === "linked" ? (
                  <Link href={buildWorkspaceHref(session)} style={{ color: "var(--accent-cyan)" }}>
                    {session.linkedAssessmentId}
                    {getSavedAssessment(session.linkedAssessmentId)
                      ? ` · ${getSavedAssessment(session.linkedAssessmentId)!.title}`
                      : ""}
                  </Link>
                ) : (
                  <span style={{ color: "var(--accent-amber)" }}>
                    {session.linkedAssessmentId} · STALE — assessment missing from workspace (not
                    substituted with another record)
                  </span>
                )}
              </p>
              {linkedResolution.status === "stale" && (
                <button
                  type="button"
                  style={{ ...ackBtn(false), marginTop: 8 }}
                  onClick={() => {
                    persist({
                      ...session,
                      linkedAssessmentId: undefined,
                      stages: { ...session.stages, assessmentLinked: false, reportExported: false },
                    });
                    setMessage(
                      "Cleared stale assessment link. Re-link a matching saved assessment when available."
                    );
                  }}
                >
                  Clear stale link
                </button>
              )}
            </div>
          )}
        </StageCard>

        <StageCard
          title="6 · Comparison"
          status={statuses.comparison}
          summary={WORKFLOW_STAGES[5].summaryEn}
          disabled={statuses.comparison === "unavailable"}
        >
          <p style={{ ...body, fontSize: 13 }}>
            Uses the existing Assessments compare view. A deeper comparison engine is deferred.
            Needs at least two saved local assessments ({workspaceCount} currently).
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link
              href={buildWorkspaceHref(session, "compare")}
              style={linkBtn(statuses.comparison === "unavailable")}
            >
              Open Assessments · compare
            </Link>
            <button
              type="button"
              disabled={statuses.comparison === "unavailable"}
              onClick={() =>
                markStage("comparisonReviewed", true, "Comparison stage acknowledged.")
              }
              style={ackBtn(statuses.comparison === "unavailable")}
            >
              Mark comparison noted
            </button>
          </div>
        </StageCard>

        <StageCard
          title="7 · Report"
          status={statuses.report}
          summary={WORKFLOW_STAGES[6].summaryEn}
          disabled={statuses.report === "unavailable"}
        >
          <p style={{ ...body, fontSize: 13 }}>
            Reuses Local Workspace markdown export. A dedicated reproducible report package is
            deferred. Export does not certify the site.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link
              href={buildWorkspaceHref(session, "export")}
              style={linkBtn(statuses.report === "unavailable")}
            >
              Open Assessments · export
            </Link>
            <button
              type="button"
              disabled={statuses.report === "unavailable"}
              onClick={() =>
                markStage(
                  "reportExported",
                  true,
                  "Report stage acknowledged after workspace export."
                )
              }
              style={ackBtn(statuses.report === "unavailable")}
            >
              Mark report export noted
            </button>
          </div>
        </StageCard>
      </section>
    </main>
  );
}

function StageCard({
  title,
  status,
  summary,
  disabled,
  children,
}: {
  title: string;
  status: WorkflowStageStatus;
  summary: string;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        ...panel,
        opacity: disabled ? 0.72 : 1,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h2
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 18,
            fontWeight: 650,
            margin: 0,
            color: "var(--text)",
          }}
        >
          {title}
        </h2>
        <span
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: statusColor(status),
          }}
        >
          {statusLabel(status)}
        </span>
      </div>
      <p style={{ ...body, fontSize: 13, margin: "8px 0 14px" }}>{summary}</p>
      {children}
    </section>
  );
}

function linkBtn(disabled: boolean): CSSProperties {
  return {
    fontFamily: "var(--font-ui)",
    fontSize: 13,
    fontWeight: 600,
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid var(--border2)",
    background: disabled
      ? "transparent"
      : "color-mix(in srgb, var(--accent-blue) 14%, transparent)",
    color: disabled ? "var(--text-dim)" : "var(--text)",
    textDecoration: "none",
    pointerEvents: disabled ? "none" : "auto",
    opacity: disabled ? 0.5 : 1,
  };
}

function ackBtn(disabled: boolean): CSSProperties {
  return {
    fontFamily: "var(--font-ui)",
    fontSize: 13,
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid var(--border2)",
    background: "transparent",
    color: disabled ? "var(--text-dim)" : "var(--text-muted)",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}
