# P6-S10 — Persistent Evidence Annotations and Assessment Traceability

**Status:** Implemented (local uncommitted work)  
**Builds on:** P6-S9 Evidence Binder  
**Live AI:** Remains paused  
**Does not:** alter Model v0.4, mutate P5-S2 pack, write Neon, claim certification

## Purpose

Make USER_SUPPLIED evidence annotations and assessment↔evidence associations survive local saves, reloads, and exports — without a second evidence library or backend.

## Architecture before / after

| Before (P6-S9) | After (P6-S10) |
| --- | --- |
| Derived binder catalog only | Catalog + local USER_SUPPLIED annotations in same binder |
| `associateEvidenceWithAssessment` non-persisting | Durable association store (`linkKind: associated`) |
| Export used lab/catalog heuristics | Export prefers persisted associations when present |

## Persistence model

Workspace assessments remain `gryps-research-workspace-v1` — a **plain array** (no versioned envelope).

Smallest safe compatibility approach: sibling versioned store

- Key: `gryps-evidence-annotation-store-v0`
- Schema: `{ schema, annotations[], associations[], updatedAt }`
- Never rewrites assessment array accidentally
- Malformed / unknown schema / bare arrays → empty store (non-destructive)
- Deduplicates by annotation id and `(assessmentId, evidenceId)`
- Node tests use in-memory fallback (same API)

## Annotation lifecycle

Create → edit (history snapshots of title/description) → remove (explicit `confirm: true`)  
Origin always `USER_SUPPLIED`; verification stays `unverified` unless architecture later justifies otherwise (not in this phase).  
Optional fields omitted when unspecified — never invented.

## Assessment association model

`AssessmentEvidenceAssociation { id, assessmentId, evidenceId, linkKind: "associated", note?, createdAt }`

- Association ≠ support claim
- Many evidence ↔ many assessments
- Disassociate removes link only
- Missing evidence ids remain visible as UNKNOWN placeholders

## Export behaviour

Assessment markdown and evidence companion include:

1. Persisted associated evidence  
2. Evidence-supported (PUBLIC documented/indirect)  
3. USER_SUPPLIED  
4. SYNTHETIC  
5. Assumptions  
6. Missing evidence  
7. UNKNOWN  
8. Conflicts  
9. Non-independence disclaimer  

Reflects saved annotation-store state after reload.

## UI

- `EvidenceAnnotationPanel` on assessment detail + Research Library binder context
- Create / edit / confirm-remove / associate / disassociate
- Saved flash messages; does not mark workflow stages complete

## Tests

```bash
npm run test:evidence-annotations
```

Plus regression suite listed in the completion report.

## Protected boundaries

Unchanged: Model v0.4, homepage 83 · B, P5-S2 pack, REVIEW-01/02, LICENSE, Neon, no live AI.
