"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import {
  associateEvidenceToAssessment,
  createAnnotation,
  disassociateEvidenceFromAssessment,
  listAnnotations,
  listAssociationsForAssessment,
  removeAnnotation,
  setAssociationSupportIntent,
  updateAnnotation,
  type EvidenceSupportIntent,
  type UserEvidenceAnnotation,
} from "@/lib/research/evidence-annotation-store";
import {
  getEvidenceBinderRecord,
  listAssociatedEvidenceForAssessment,
  listCatalogEvidenceBinderRecords,
} from "@/lib/research/evidence-binder";

const field: CSSProperties = {
  width: "100%",
  backgroundColor: "var(--surface2)",
  border: "1px solid var(--border2)",
  borderRadius: 6,
  padding: "8px 10px",
  fontFamily: "var(--font-ui)",
  fontSize: 13,
  color: "var(--text)",
  marginBottom: 8,
};

const btnBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  backgroundColor: "var(--surface2)",
  border: "1px solid var(--border2)",
  borderRadius: 6,
  padding: "8px 12px",
  cursor: "pointer",
  fontFamily: "var(--font-ui)",
  fontWeight: 600,
  fontSize: 12,
  color: "var(--text-muted)",
};

export function EvidenceAnnotationPanel({
  assessmentId,
}: {
  /** When set, shows association controls for this assessment */
  assessmentId?: string;
}) {
  const [annotations, setAnnotations] = useState<UserEvidenceAnnotation[]>([]);
  const [associatedIds, setAssociatedIds] = useState<string[]>([]);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [documentReference, setDocumentReference] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [dependencyIds, setDependencyIds] = useState("");
  const [linkEvidenceId, setLinkEvidenceId] = useState("");

  const refresh = useCallback(() => {
    setAnnotations(listAnnotations());
    if (assessmentId) {
      setAssociatedIds(
        listAssociationsForAssessment(assessmentId).map((a) => a.evidenceId)
      );
    } else {
      setAssociatedIds([]);
    }
  }, [assessmentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function flash(msg: string) {
    setSavedFlash(msg);
    window.setTimeout(() => setSavedFlash(null), 2500);
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setDocumentReference("");
    setSourceUrl("");
    setDependencyIds("");
  }

  function startEdit(ann: UserEvidenceAnnotation) {
    setEditingId(ann.id);
    setTitle(ann.title);
    setDescription(ann.description);
    setDocumentReference(ann.documentReference ?? "");
    setSourceUrl(ann.sourceUrl ?? "");
    setDependencyIds(ann.dependencyIds.join(", "));
  }

  function handleSave() {
    const deps = dependencyIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (editingId) {
      const updated = updateAnnotation(editingId, {
        title,
        description,
        documentReference: documentReference || undefined,
        sourceUrl: sourceUrl || undefined,
        dependencyIds: deps,
      });
      if (updated) flash("Annotation saved");
    } else {
      const created = createAnnotation({
        title,
        description,
        documentReference: documentReference || undefined,
        sourceUrl: sourceUrl || undefined,
        dependencyIds: deps,
        assessmentIds: assessmentId ? [assessmentId] : [],
      });
      if (assessmentId) {
        associateEvidenceToAssessment(assessmentId, created.id);
      }
      flash("Annotation created · USER_SUPPLIED");
    }
    resetForm();
    refresh();
  }

  function handleDelete(id: string) {
    const ok = window.confirm(
      "Remove this USER_SUPPLIED annotation? Associations to it will be removed. Underlying catalog evidence is not deleted."
    );
    if (!ok) return;
    removeAnnotation(id, true);
    flash("Annotation removed");
    if (editingId === id) resetForm();
    refresh();
  }

  function handleAssociate() {
    if (!assessmentId || !linkEvidenceId.trim()) return;
    const id = linkEvidenceId.trim();
    const exists = getEvidenceBinderRecord(id) || listCatalogEvidenceBinderRecords().some((r) => r.id === id);
    if (!exists && !listAnnotations().some((a) => a.id === id)) {
      flash("Evidence id not found — association not created");
      return;
    }
    associateEvidenceToAssessment(assessmentId, id);
    setLinkEvidenceId("");
    flash("Associated (not a support claim)");
    refresh();
  }

  function handleDisassociate(evidenceId: string) {
    if (!assessmentId) return;
    disassociateEvidenceFromAssessment(assessmentId, evidenceId);
    flash("Association removed · evidence retained");
    refresh();
  }

  const associatedRows = assessmentId
    ? listAssociatedEvidenceForAssessment(assessmentId)
    : [];

  return (
    <section
      aria-labelledby="evidence-annotation-heading"
      style={{
        marginTop: 24,
        marginBottom: 28,
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "16px 16px 18px",
        backgroundColor: "var(--surface)",
      }}
    >
      <p
        id="evidence-annotation-heading"
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 10,
          color: "var(--text-dim)",
          letterSpacing: "0.12em",
          marginBottom: 6,
        }}
      >
        USER_SUPPLIED ANNOTATIONS · LOCAL
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
        Local researcher annotations. Origin stays USER_SUPPLIED — not independently verified
        public evidence. Opening this panel does not complete a research workflow stage.
      </p>

      {savedFlash && (
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 12,
            color: "var(--accent-cyan)",
            marginBottom: 10,
          }}
        >
          {savedFlash}
        </p>
      )}

      <div style={{ marginBottom: 16 }}>
        <input
          style={field}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Annotation title"
        />
        <textarea
          style={{ ...field, minHeight: 72, resize: "vertical" }}
          placeholder="Description / observation"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-label="Annotation description"
        />
        <input
          style={field}
          placeholder="Document reference (optional)"
          value={documentReference}
          onChange={(e) => setDocumentReference(e.target.value)}
          aria-label="Document reference"
        />
        <input
          style={field}
          placeholder="URL (optional)"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          aria-label="Source URL"
        />
        <input
          style={field}
          placeholder="Dependency IDs, comma-separated (optional)"
          value={dependencyIds}
          onChange={(e) => setDependencyIds(e.target.value)}
          aria-label="Dependency IDs"
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button type="button" style={btnBase} onClick={handleSave} disabled={!title.trim()}>
            {editingId ? "Save edit" : "Add annotation"}
          </button>
          {editingId && (
            <button type="button" style={btnBase} onClick={resetForm}>
              Cancel edit
            </button>
          )}
        </div>
      </div>

      {annotations.length === 0 ? (
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 13,
            color: "var(--text-dim)",
            marginBottom: assessmentId ? 16 : 0,
          }}
        >
          No USER_SUPPLIED annotations yet.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {annotations.map((ann) => (
            <li
              key={ann.id}
              style={{
                border: "1px solid var(--border2)",
                borderRadius: 6,
                padding: "10px 12px",
                backgroundColor: "var(--surface2)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 10,
                  color: "var(--text-dim)",
                  letterSpacing: "0.08em",
                  margin: "0 0 4px",
                }}
              >
                USER_SUPPLIED · unverified · {ann.id}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text)",
                  margin: "0 0 4px",
                }}
              >
                {ann.title}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 13,
                  color: "var(--text-muted)",
                  margin: "0 0 8px",
                  lineHeight: 1.5,
                }}
              >
                {ann.description || "—"}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 11,
                  color: "var(--text-dim)",
                  margin: "0 0 8px",
                }}
              >
                Updated {ann.updatedAt.slice(0, 19)}Z
                {ann.documentReference ? ` · Ref: ${ann.documentReference}` : ""}
                {ann.dependencyIds.length
                  ? ` · Deps: ${ann.dependencyIds.join(", ")}`
                  : " · Deps: unspecified"}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <button type="button" style={btnBase} onClick={() => startEdit(ann)}>
                  Edit
                </button>
                <button
                  type="button"
                  style={{ ...btnBase, color: "var(--accent-red)" }}
                  onClick={() => handleDelete(ann.id)}
                >
                  Remove
                </button>
                {assessmentId && !associatedIds.includes(ann.id) && (
                  <button
                    type="button"
                    style={btnBase}
                    onClick={() => {
                      associateEvidenceToAssessment(assessmentId, ann.id);
                      flash("Associated (not a support claim)");
                      refresh();
                    }}
                  >
                    Associate to assessment
                  </button>
                )}
                {assessmentId && associatedIds.includes(ann.id) && (
                  <button
                    type="button"
                    style={btnBase}
                    onClick={() => handleDisassociate(ann.id)}
                  >
                    Disassociate
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {assessmentId && (
        <div>
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 10,
              color: "var(--text-dim)",
              letterSpacing: "0.12em",
              marginBottom: 8,
            }}
          >
            ASSESSMENT ASSOCIATIONS
          </p>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 12,
              color: "var(--text-muted)",
              marginBottom: 10,
              lineHeight: 1.5,
            }}
          >
            Links are relationships only — they do not upgrade evidence into support for the
            assessment.
          </p>
          {associatedRows.length === 0 ? (
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-dim)" }}>
              No persisted associations for this assessment.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 12px" }}>
              {associatedRows.map(({ record, missing, supportIntent }) => (
                <li
                  key={record.id}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    alignItems: "center",
                    marginBottom: 8,
                    fontFamily: "var(--font-ui)",
                    fontSize: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  <span>
                    <strong style={{ color: "var(--text)" }}>{record.origin}</strong>
                    {missing ? " · MISSING REF" : ""} · {record.id} — {record.title}
                  </span>
                  {assessmentId && (
                    <select
                      aria-label={`Support intent for ${record.id}`}
                      value={supportIntent}
                      onChange={(e) => {
                        setAssociationSupportIntent(
                          assessmentId,
                          record.id,
                          e.target.value as EvidenceSupportIntent
                        );
                        flash("Support intent set explicitly (does not change evidence origin)");
                        refresh();
                      }}
                      style={{
                        ...btnBase,
                        padding: "6px 8px",
                        cursor: "pointer",
                      }}
                    >
                      <option value="none">Intent: none (associated only)</option>
                      <option value="supports_finding">Intent: supports finding</option>
                      <option value="assumption_only">Intent: assumption only</option>
                      <option value="conflicts_with">Intent: conflicts with</option>
                    </select>
                  )}
                  <button
                    type="button"
                    style={btnBase}
                    onClick={() => handleDisassociate(record.id)}
                  >
                    Disassociate
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <input
              style={{ ...field, marginBottom: 0, flex: "1 1 220px" }}
              placeholder="Binder evidence id to associate"
              value={linkEvidenceId}
              onChange={(e) => setLinkEvidenceId(e.target.value)}
              aria-label="Evidence id to associate"
            />
            <button type="button" style={btnBase} onClick={handleAssociate}>
              Associate evidence
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
