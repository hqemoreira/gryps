# Phase 6 — Target research-platform architecture

**Document version:** `gryps-phase-6-target-architecture-v0`  
**Sprint:** P6-S1 (specification only)  
**Recorded:** 2026-11-27  
**Companion audit:** `phase-6-research-platform-architecture-audit.md`

## Posture

GRYPS is a non-commercial research prototype. This architecture supports **methodological research workflows**. It does not claim operational validation or independent certification.

---

## 1. End-to-end research workflow

```text
Site → Scenario → Infrastructure Dependencies → Evidence → Assessment → Comparison → Reproducible Report
```

| Stage | Responsibility | Must not |
| --- | --- | --- |
| **Site** | Define a research site (location envelope, sector, ownership of claims) | Invent serving paths or satellite brands |
| **Scenario** | Versioned operating context (autonomy, criticality, equipment class, time window) | Silently replace historical assessments |
| **Infrastructure Dependencies** | Model providers, facilities, shared failure domains, UNKNOWN edges | Equate catalog diversity with independence |
| **Evidence** | Attach sources with maturity, access class, provenance, contradictions | Treat interviews as technical proof |
| **Assessment** | Run Model v0.4 (or a future approved model) on **declared inputs only** | Let fixtures/evidence rewrite Signature inputs without explicit mapping |
| **Comparison** | Diff scenarios, historical vs current engine, evidence maturity | Present score deltas as measured resilience change |
| **Reproducible Report** | Export inputs, evidence IDs, model version, test hashes, unknowns | Imply certification or endorsement |

---

## 2. Separated layers

### Layer 1 — Assessment engine

| Owns | Boundary |
| --- | --- |
| `scoreDeterministic` / Advisor scoring, constants, caps, grades | Frozen Model v0.4 until explicit human-approved model change |
| Homepage regression **83 · B** | Protected regression, not a field measurement |
| D-01–D-13 as open findings | Engine review ≠ evidence review |

**Forbidden:** Research fixtures, synthetic scenarios, or unverified evidence silently altering Signature arithmetic or inputs.

### Layer 2 — Research and dependency model

| Owns | Boundary |
| --- | --- |
| Entities, relationships, layers, shared failure domains | Lab / research UI |
| Synthetic fixtures A–E; geographic envelopes | Clearly labelled synthetic / public |
| Terminology: catalogue confidence ≠ provider diversity ≠ infrastructure independence | Glossary enforced in UX copy |

**Forbidden:** Writing dependency conclusions into Neon Signature rows as if measured.

### Layer 3 — Evidence and provenance

| Owns | Boundary |
| --- | --- |
| Intake lifecycle (P5-S5), maturity L1–L5, access class | Research modules |
| Pack immutability (P5-S2 v0); future versions only | No silent pack mutation |
| Contradiction retention | No newer-wins erasure |

**Forbidden:** Promoting participant statements to site-confirmed without gates.

### Layer 4 — Validation and measurement

| Owns | Boundary |
| --- | --- |
| Field protocol, industrial discovery, provider requests | External; gated |
| Operational measurements | Explicit consent only |
| Independent technical review (Phase 3) | Separate track from industrial participants |

**Forbidden:** Treating validation as complete without human approval; mixing Phase 3 and P5 roles without disclosure.

### Layer 5 — Presentation and reporting

| Owns | Boundary |
| --- | --- |
| Research Library, Lab, Workspace, methodology pages | UX |
| Disclaimers, UNKNOWN visibility, historical labels | Always visible where scores appear |
| Future export packages | Hash inputs + model id + evidence ids |

**Forbidden:** Homepage or public copy that implies certification, commercial procurement advice, or field-validated Model v0.4.

---

## 3. Data flow rules

1. **Assessment inputs** are explicit structures (`AssessmentInputs` / hero demo / user Advisor form).  
2. **Dependency Lab scenarios** are parallel research objects; they may **display** the homepage Signature as a reference lock, not recompute a new “validated” score from fixtures.  
3. **Evidence** attaches to dependency claims or research sites — not as a silent multiplier on v0.4.  
4. **Historical stored assessments** remain labelled historical; recomputation uses comparison tools, not overwrite.  
5. **Exports** must include model version, engine id, input snapshot, evidence IDs, and open unknowns.

---

## 4. Target components (build toward)

| Component | Today | Target |
| --- | --- | --- |
| Research site registry | Partial (library + Neon seeds) | First-class research-site objects with claim ownership |
| Scenario versioning | Content pages | Versioned scenario records linked to sites |
| Dependency graph UI | Lab (partial) | Stable Lab in nav + CI |
| Evidence binder | Intake lib (synthetic) | UI for public/synthetic; gated restricted path later |
| Assessment runner | Advisor | Unchanged engine; optional “inputs from scenario” with audit trail |
| Comparison bench | Script only | UI + script; exportable diffs |
| Report exporter | Missing | Deterministic package (JSON/Markdown) with hashes |

---

## 5. Future scenario simulation

Allowed as a **research** capability: vary inputs / dependency assumptions and show Signature **sensitivity** under Model v0.4.

Required disclosures:

- Simulated ≠ measured.  
- Diversity assumptions ≠ independence.  
- UNKNOWN remains first-class when evidence is absent.

---

## 6. External dependencies (architecture)

| Track | Architecture slot |
| --- | --- |
| Phase 3 reviewers | Layer 4 — engine critique |
| P5 providers (T-xx) | Layer 3/4 — architecture evidence |
| Industrial participants (I-xx) | Layer 4 — site operational truth |
| Neon | Persistence for Signature library / advisor — not evidence vault by default |

---

## 7. Success criteria for the target platform

- A researcher can define site → scenario → dependencies → evidence → assessment → comparison → report **without** confusing layers.  
- Every score shows model version and disclaimer.  
- Every dependency claim shows maturity and unknowns.  
- Every change passes Phase 6 quality gates.  
- No path lets synthetic or unverified evidence mutate Model v0.4.
