/**
 * P6-S10 — Local USER_SUPPLIED evidence annotations + assessment associations.
 *
 * Persistence: sibling localStorage key next to gryps-research-workspace-v1.
 * Workspace assessments stay a plain array (backward compatible).
 * This store never rewrites assessment JSON except when callers explicitly link ids.
 *
 * Boundaries: no Neon, no Model v0.4 changes, no crypto package.
 */

export const EVIDENCE_ANNOTATION_STORE_KEY = "gryps-evidence-annotation-store-v0";
export const EVIDENCE_ANNOTATION_STORE_SCHEMA = "gryps-evidence-annotation-store-v0" as const;

/** Association ≠ support claim — relationship only. */
export type AssessmentEvidenceLinkKind = "associated";

/**
 * Explicit researcher support intent — never inferred from association alone.
 * Default remains "none" until the user sets it.
 */
export type EvidenceSupportIntent =
  | "none"
  | "supports_finding"
  | "assumption_only"
  | "conflicts_with";

export const DEFAULT_SUPPORT_INTENT: EvidenceSupportIntent = "none";

export type AnnotationSupportClass =
  | "directly_documented"
  | "indirect"
  | "synthetic_demonstration"
  | "user_supplied"
  | "assumption"
  | "unknown";

export type AnnotationVerificationStatus =
  | "documented"
  | "unverified"
  | "insufficient"
  | "conflicting"
  | "unknown";

export type UserEvidenceAnnotation = {
  id: string;
  title: string;
  description: string;
  documentReference?: string;
  sourceUrl?: string;
  /** ISO date when the observation was made — omitted if unknown */
  dateSupplied?: string;
  dependencyIds: string[];
  assessmentIds: string[];
  origin: "USER_SUPPLIED";
  supportClass: AnnotationSupportClass;
  limitations: string[];
  verificationStatus: AnnotationVerificationStatus;
  provenanceNotes: string;
  createdAt: string;
  updatedAt: string;
  /** Prior revision snapshots (title/description only) when architecture supports history */
  history?: Array<{
    updatedAt: string;
    title: string;
    description: string;
  }>;
};

export type AssessmentEvidenceAssociation = {
  id: string;
  assessmentId: string;
  evidenceId: string;
  linkKind: AssessmentEvidenceLinkKind;
  /**
   * Explicit support intent. Association alone never upgrades this from "none".
   * Does not alter the underlying evidence origin/classification.
   */
  supportIntent: EvidenceSupportIntent;
  /** Optional researcher note about why linked — not a support upgrade */
  note?: string;
  createdAt: string;
  /** When supportIntent was last set explicitly (omitted if never set beyond default) */
  supportIntentUpdatedAt?: string;
};

export type EvidenceAnnotationStore = {
  schema: typeof EVIDENCE_ANNOTATION_STORE_SCHEMA;
  annotations: UserEvidenceAnnotation[];
  associations: AssessmentEvidenceAssociation[];
  updatedAt: string;
};

/** In-memory fallback for Node tests / SSR — does not touch assessments workspace. */
const memoryBucket = new Map<string, string>();

function storageGet(key: string): string | null {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return memoryBucket.get(key) ?? null;
}

function storageSet(key: string, value: string): void {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
      return;
    } catch {
      /* fall through to memory */
    }
  }
  memoryBucket.set(key, value);
}

function storageRemove(key: string): void {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
  memoryBucket.delete(key);
}

export function emptyAnnotationStore(): EvidenceAnnotationStore {
  return {
    schema: EVIDENCE_ANNOTATION_STORE_SCHEMA,
    annotations: [],
    associations: [],
    updatedAt: new Date(0).toISOString(),
  };
}

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeAnnotation(raw: unknown): UserEvidenceAnnotation | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || !o.id.trim()) return null;
  if (typeof o.title !== "string") return null;
  const now = new Date().toISOString();
  return {
    id: o.id,
    title: o.title,
    description: typeof o.description === "string" ? o.description : "",
    documentReference:
      typeof o.documentReference === "string" && o.documentReference.trim()
        ? o.documentReference
        : undefined,
    sourceUrl:
      typeof o.sourceUrl === "string" && o.sourceUrl.trim() ? o.sourceUrl : undefined,
    dateSupplied:
      typeof o.dateSupplied === "string" && o.dateSupplied.trim()
        ? o.dateSupplied
        : undefined,
    dependencyIds: Array.isArray(o.dependencyIds)
      ? o.dependencyIds.filter((x): x is string => typeof x === "string")
      : [],
    assessmentIds: Array.isArray(o.assessmentIds)
      ? o.assessmentIds.filter((x): x is string => typeof x === "string")
      : [],
    origin: "USER_SUPPLIED",
    supportClass:
      o.supportClass === "assumption" ||
      o.supportClass === "unknown" ||
      o.supportClass === "indirect" ||
      o.supportClass === "user_supplied"
        ? o.supportClass
        : "user_supplied",
    limitations: Array.isArray(o.limitations)
      ? o.limitations.filter((x): x is string => typeof x === "string")
      : ["USER_SUPPLIED — not independently verified public evidence."],
    verificationStatus:
      o.verificationStatus === "insufficient" ||
      o.verificationStatus === "unknown" ||
      o.verificationStatus === "conflicting" ||
      o.verificationStatus === "unverified"
        ? o.verificationStatus
        : "unverified",
    provenanceNotes:
      typeof o.provenanceNotes === "string" && o.provenanceNotes.trim()
        ? o.provenanceNotes
        : "USER_SUPPLIED local annotation — researcher observation, not field validation.",
    createdAt: typeof o.createdAt === "string" ? o.createdAt : now,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : now,
    history: Array.isArray(o.history)
      ? o.history
          .filter((h): h is { updatedAt: string; title: string; description: string } => {
            if (!h || typeof h !== "object") return false;
            const x = h as Record<string, unknown>;
            return (
              typeof x.updatedAt === "string" &&
              typeof x.title === "string" &&
              typeof x.description === "string"
            );
          })
          .slice(-20)
      : undefined,
  };
}

function normalizeSupportIntent(raw: unknown): EvidenceSupportIntent {
  if (
    raw === "supports_finding" ||
    raw === "assumption_only" ||
    raw === "conflicts_with" ||
    raw === "none"
  ) {
    return raw;
  }
  return DEFAULT_SUPPORT_INTENT;
}

function normalizeAssociation(raw: unknown): AssessmentEvidenceAssociation | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || !o.id.trim()) return null;
  if (typeof o.assessmentId !== "string" || !o.assessmentId.trim()) return null;
  if (typeof o.evidenceId !== "string" || !o.evidenceId.trim()) return null;
  return {
    id: o.id,
    assessmentId: o.assessmentId,
    evidenceId: o.evidenceId,
    linkKind: "associated",
    supportIntent: normalizeSupportIntent(o.supportIntent),
    note: typeof o.note === "string" && o.note.trim() ? o.note : undefined,
    createdAt: typeof o.createdAt === "string" ? o.createdAt : new Date().toISOString(),
    supportIntentUpdatedAt:
      typeof o.supportIntentUpdatedAt === "string" ? o.supportIntentUpdatedAt : undefined,
  };
}

/** Parse store JSON safely — malformed → empty store, never throws. */
export function parseAnnotationStore(raw: string | null | undefined): EvidenceAnnotationStore {
  if (!raw || !raw.trim()) return emptyAnnotationStore();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return emptyAnnotationStore();
    const o = parsed as Record<string, unknown>;
    // Reject accidental replacement of unrelated workspace assessment arrays
    if (Array.isArray(parsed)) return emptyAnnotationStore();
    if (o.schema && o.schema !== EVIDENCE_ANNOTATION_STORE_SCHEMA) {
      // Unknown future schema — do not destroy; return empty for this reader
      return emptyAnnotationStore();
    }
    const annotations = Array.isArray(o.annotations)
      ? o.annotations.map(normalizeAnnotation).filter((x): x is UserEvidenceAnnotation => !!x)
      : [];
    const associations = Array.isArray(o.associations)
      ? o.associations.map(normalizeAssociation).filter((x): x is AssessmentEvidenceAssociation => !!x)
      : [];
    // Deduplicate by id (stable — keep first)
    const annIds = new Set<string>();
    const dedupAnn: UserEvidenceAnnotation[] = [];
    for (const a of annotations) {
      if (annIds.has(a.id)) continue;
      annIds.add(a.id);
      dedupAnn.push(a);
    }
    const assocKeys = new Set<string>();
    const dedupAssoc: AssessmentEvidenceAssociation[] = [];
    for (const a of associations) {
      const key = `${a.assessmentId}::${a.evidenceId}`;
      if (assocKeys.has(key)) continue;
      assocKeys.add(key);
      dedupAssoc.push(a);
    }
    return {
      schema: EVIDENCE_ANNOTATION_STORE_SCHEMA,
      annotations: dedupAnn,
      associations: dedupAssoc,
      updatedAt:
        typeof o.updatedAt === "string" ? o.updatedAt : new Date().toISOString(),
    };
  } catch {
    return emptyAnnotationStore();
  }
}

export function loadAnnotationStore(): EvidenceAnnotationStore {
  return parseAnnotationStore(storageGet(EVIDENCE_ANNOTATION_STORE_KEY));
}

export function saveAnnotationStore(store: EvidenceAnnotationStore): EvidenceAnnotationStore {
  const next: EvidenceAnnotationStore = {
    schema: EVIDENCE_ANNOTATION_STORE_SCHEMA,
    annotations: store.annotations,
    associations: store.associations,
    updatedAt: new Date().toISOString(),
  };
  storageSet(EVIDENCE_ANNOTATION_STORE_KEY, JSON.stringify(next));
  return next;
}

/** Test helper — clears memory + localStorage key without touching workspace assessments. */
export function resetAnnotationStoreForTests(): void {
  storageRemove(EVIDENCE_ANNOTATION_STORE_KEY);
}

export type CreateAnnotationInput = {
  title: string;
  description: string;
  documentReference?: string;
  sourceUrl?: string;
  dateSupplied?: string;
  dependencyIds?: string[];
  assessmentIds?: string[];
  supportClass?: AnnotationSupportClass;
  limitations?: string[];
};

export function createAnnotation(input: CreateAnnotationInput): UserEvidenceAnnotation {
  const store = loadAnnotationStore();
  const now = new Date().toISOString();
  const annotation: UserEvidenceAnnotation = {
    id: newId("ann"),
    title: input.title.trim() || "Untitled annotation",
    description: input.description.trim(),
    documentReference: input.documentReference?.trim() || undefined,
    sourceUrl: input.sourceUrl?.trim() || undefined,
    dateSupplied: input.dateSupplied?.trim() || undefined,
    dependencyIds: input.dependencyIds ?? [],
    assessmentIds: input.assessmentIds ?? [],
    origin: "USER_SUPPLIED",
    supportClass: input.supportClass ?? "user_supplied",
    limitations: input.limitations?.length
      ? input.limitations
      : [
          "USER_SUPPLIED — researcher observation only.",
          "Not independently verified public evidence.",
          "Does not establish infrastructure independence.",
        ],
    verificationStatus: "unverified",
    provenanceNotes:
      "USER_SUPPLIED local annotation — origin remains USER_SUPPLIED; not upgraded to PUBLIC.",
    createdAt: now,
    updatedAt: now,
  };
  // Idempotent id — never duplicate on re-save of same store write
  if (store.annotations.some((a) => a.id === annotation.id)) {
    return annotation;
  }
  store.annotations = [...store.annotations, annotation];
  saveAnnotationStore(store);
  return annotation;
}

export function updateAnnotation(
  id: string,
  patch: Partial<
    Pick<
      UserEvidenceAnnotation,
      | "title"
      | "description"
      | "documentReference"
      | "sourceUrl"
      | "dateSupplied"
      | "dependencyIds"
      | "assessmentIds"
      | "supportClass"
      | "limitations"
    >
  > & { supportClass?: AnnotationSupportClass }
): UserEvidenceAnnotation | undefined {
  const store = loadAnnotationStore();
  const idx = store.annotations.findIndex((a) => a.id === id);
  if (idx < 0) return undefined;
  const prev = store.annotations[idx];
  const now = new Date().toISOString();
  const history = [
    ...(prev.history ?? []),
    { updatedAt: prev.updatedAt, title: prev.title, description: prev.description },
  ].slice(-20);
  const next: UserEvidenceAnnotation = {
    ...prev,
    title: patch.title !== undefined ? patch.title.trim() || prev.title : prev.title,
    description: patch.description !== undefined ? patch.description : prev.description,
    documentReference:
      patch.documentReference !== undefined
        ? patch.documentReference.trim() || undefined
        : prev.documentReference,
    sourceUrl:
      patch.sourceUrl !== undefined ? patch.sourceUrl.trim() || undefined : prev.sourceUrl,
    dateSupplied:
      patch.dateSupplied !== undefined
        ? patch.dateSupplied.trim() || undefined
        : prev.dateSupplied,
    dependencyIds: patch.dependencyIds ?? prev.dependencyIds,
    assessmentIds: patch.assessmentIds ?? prev.assessmentIds,
    supportClass: patch.supportClass ?? prev.supportClass,
    limitations: patch.limitations ?? prev.limitations,
    origin: "USER_SUPPLIED",
    verificationStatus: "unverified",
    updatedAt: now,
    history,
  };
  store.annotations = store.annotations.map((a, i) => (i === idx ? next : a));
  saveAnnotationStore(store);
  return next;
}

/**
 * Remove annotation. Associations referencing it are removed (not other evidence).
 * confirm must be true — callers must obtain explicit UI confirmation.
 */
export function removeAnnotation(id: string, confirm: boolean): boolean {
  if (!confirm) return false;
  const store = loadAnnotationStore();
  if (!store.annotations.some((a) => a.id === id)) return false;
  store.annotations = store.annotations.filter((a) => a.id !== id);
  store.associations = store.associations.filter((a) => a.evidenceId !== id);
  saveAnnotationStore(store);
  return true;
}

export function listAnnotations(): UserEvidenceAnnotation[] {
  return loadAnnotationStore().annotations;
}

export function getAnnotation(id: string): UserEvidenceAnnotation | undefined {
  return listAnnotations().find((a) => a.id === id);
}

export function listAssociations(): AssessmentEvidenceAssociation[] {
  return loadAnnotationStore().associations;
}

export function listAssociationsForAssessment(
  assessmentId: string
): AssessmentEvidenceAssociation[] {
  return listAssociations().filter((a) => a.assessmentId === assessmentId);
}

export function listAssociationsForEvidence(evidenceId: string): AssessmentEvidenceAssociation[] {
  return listAssociations().filter((a) => a.evidenceId === evidenceId);
}

/**
 * Link evidence (catalog or annotation id) to an assessment.
 * Does not claim the evidence supports the assessment — linkKind stays "associated"
 * and supportIntent defaults to "none" (never inferred).
 * Idempotent on (assessmentId, evidenceId).
 */
export function associateEvidenceToAssessment(
  assessmentId: string,
  evidenceId: string,
  note?: string
): AssessmentEvidenceAssociation {
  const store = loadAnnotationStore();
  const existing = store.associations.find(
    (a) => a.assessmentId === assessmentId && a.evidenceId === evidenceId
  );
  if (existing) {
    if (note !== undefined && note !== existing.note) {
      const updated = { ...existing, note: note.trim() || undefined };
      store.associations = store.associations.map((a) =>
        a.id === existing.id ? updated : a
      );
      saveAnnotationStore(store);
      return updated;
    }
    return existing;
  }
  const link: AssessmentEvidenceAssociation = {
    id: newId("lnk"),
    assessmentId,
    evidenceId,
    linkKind: "associated",
    supportIntent: DEFAULT_SUPPORT_INTENT,
    note: note?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  store.associations = [...store.associations, link];
  // Mirror assessment id onto annotation record when evidence is an annotation
  store.annotations = store.annotations.map((ann) =>
    ann.id === evidenceId && !ann.assessmentIds.includes(assessmentId)
      ? { ...ann, assessmentIds: [...ann.assessmentIds, assessmentId], updatedAt: link.createdAt }
      : ann
  );
  saveAnnotationStore(store);
  return link;
}

/**
 * Explicitly set support intent. Required for any non-"none" value.
 * Does not change evidence origin, classification, or verification status.
 */
export function setAssociationSupportIntent(
  assessmentId: string,
  evidenceId: string,
  supportIntent: EvidenceSupportIntent
): AssessmentEvidenceAssociation | undefined {
  const store = loadAnnotationStore();
  const existing = store.associations.find(
    (a) => a.assessmentId === assessmentId && a.evidenceId === evidenceId
  );
  if (!existing) return undefined;
  const updated: AssessmentEvidenceAssociation = {
    ...existing,
    linkKind: "associated",
    supportIntent,
    supportIntentUpdatedAt: new Date().toISOString(),
  };
  store.associations = store.associations.map((a) => (a.id === existing.id ? updated : a));
  saveAnnotationStore(store);
  return updated;
}

/** Remove association only — underlying evidence / annotation is retained. */
export function disassociateEvidenceFromAssessment(
  assessmentId: string,
  evidenceId: string
): boolean {
  const store = loadAnnotationStore();
  const before = store.associations.length;
  store.associations = store.associations.filter(
    (a) => !(a.assessmentId === assessmentId && a.evidenceId === evidenceId)
  );
  if (store.associations.length === before) return false;
  store.annotations = store.annotations.map((ann) =>
    ann.id === evidenceId
      ? {
          ...ann,
          assessmentIds: ann.assessmentIds.filter((x) => x !== assessmentId),
          updatedAt: new Date().toISOString(),
        }
      : ann
  );
  saveAnnotationStore(store);
  return true;
}
