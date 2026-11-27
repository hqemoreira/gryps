# Phase 6 — Research workflow integration (P6-S3)

**Document version:** `gryps-research-workflow-integration-v0`  
**Recorded:** 2026-11-27  
**Baseline:** `development/phase-4-evidence-integrity` @ `dc73abc`

## Gap analysis (pre-change)

| Gap                 | Finding                                                                          |
| ------------------- | -------------------------------------------------------------------------------- |
| Fragmented entry    | Advisor (`/#advisor`), Workspace, Research Library, Dependency Lab were separate |
| Re-entry            | Site/scenario not shared; users retyped lat/lng/providers                        |
| Lab orphaned        | `/research/dependency-lab` existed but was absent from IA nav                    |
| Stage honesty       | No stage tracker; opening a page looked like progress                            |
| Comparison / report | Workspace compare + markdown export already existed — not a new engine           |
| Neon                | Not appropriate for ephemeral research session                                   |

## Implemented journey

Route: **`/research/workflow`**

```text
Site → Scenario → Dependencies → Evidence → Assessment → Comparison → Report
```

| Stage           | Integration                                                         |
| --------------- | ------------------------------------------------------------------- |
| Site / Scenario | Local session form (`lib/research/workflow-context.ts`)             |
| Dependencies    | Deep-link Dependency Lab with context banner + preferred fixture    |
| Evidence        | Links to Research Library, Knowledge, Methodology                   |
| Assessment      | Advisor URL with session query params (existing homepage hydration) |
| Comparison      | Workspace `?mode=compare` (existing compare UI)                     |
| Report          | Workspace export (existing markdown download)                       |

**Completion rule:** stages complete only via explicit acknowledgement or “Save site · scenario” / “Link latest saved assessment” — not merely by opening a link.

## Data flow

- Storage: `localStorage` key `gryps-research-workflow-v0`
- Does not mutate `gryps-research-workspace-v1` except reading assessments to link/count
- No Neon writes
- Empty provider list = **UNKNOWN** (not invented)

## Deferred

- Multi-agent QA orchestrator
- New dependency graph engine
- New evidence ingestion platform
- New comparison engine / reproducible report package
- Model v0.5

## Safeguards

Model v0.4 unchanged · P5-S2 pack untouched · REVIEW/LICENSE untouched · disclaimer on workflow page · Lab remains non-scoring
