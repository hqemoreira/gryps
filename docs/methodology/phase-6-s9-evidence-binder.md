# P6-S9 — Evidence Binder and Research Traceability

**Status:** Implemented (local uncommitted work)  
**Scope:** Non-commercial research prototype · Live AI remains paused  
**Does not:** alter Model v0.4 scoring, mutate P5-S2 pack, write Neon, claim certification

## Purpose

Structured evidence binder connecting research sources to sites, scenarios, infrastructure dependencies, assessments and reports — improving transparency, traceability and reproducibility without inventing metadata or upgrading claims.

## Architecture

| Layer | Role |
| --- | --- |
| `lib/research/evidence-binder.ts` | Deterministic catalog + associations + export companion |
| `components/EvidenceBinderPanel.tsx` | Shared UI for binder records |
| Research Library / assessment / workflow / lab / workspace | Integration surfaces (same catalog — not a second library) |
| `scripts/verify-evidence-binder.ts` | Deterministic integrity checks |

### Record fields

Evidence id, title, description, source organisation, URL / document reference, publication / retrieval dates (omitted when unspecified), evidence type, origin (`PUBLIC` \| `SYNTHETIC` \| `USER_SUPPLIED`), support class, supported claim, limitations, verification status, provenance, associations, conflict links, UNKNOWN remainder.

### Classification

- `directly_documented` / `indirect` / `synthetic_demonstration` / `user_supplied` / `assumption` / `unknown`
- Synthetic always labelled; UNKNOWN stays UNKNOWN; conflicts retained; no silent overwrite
- Never `independently_validated` in this catalog

### Seeds (read-only)

1. Research Library `evidenceNotes` → `lib:{slug}:note:{i}` (PUBLIC; dates not invented)
2. Dependency fixtures A–E evidence → `fixture:{id}:{evId}`
3. Nordic Lapland pack evidence → `pack:{id}:{evId}` (read-only map; pack file untouched)
4. Explicit SYNTHETIC conflict pair for integrity tests

## Integrations

- **Research Library** — binder panel when `from=workflow` or `binder=1`; return banner
- **Assessment pages** — binder for library slug
- **Workflow** — binder counts, missing flags, deep-link `buildEvidenceBinderHref`
- **Dependency Lab** — link into library binder with `lab=` context
- **Assessment markdown export** — evidence-supported vs assumptions vs missing vs UNKNOWN vs conflicts
- **Export companion** — non-certifying markdown (`gryps-evidence-export-companion-v0`); no cryptographic package

## Tests

```bash
npm run test:evidence-binder
```

Covered: creation/retrieval, provenance, public vs synthetic, missing metadata, conflicts, dependency/assessment association, UNKNOWN preservation, report references, export companion, navigation deep-links, pack/Model boundaries.

## Boundaries preserved

- Homepage regression **83 · B**
- Model v0.4 / scoring engines untouched
- P5-S2 pack / REVIEW-01 / REVIEW-02 / LICENSE / Neon untouched
- No live AI; mock agents remain MOCK elsewhere
