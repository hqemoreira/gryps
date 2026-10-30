# GRYPS is a 60-second hiring proof for Nordic / Arctic connectivity resilience {#conclusion}

Open the Advisor, enter a remote site profile, and get a **Resilience Signature** — score, grade, top risk, and ranked options — from deterministic Model v0.4. Optional AI prose never changes the numbers. It is a non-commercial research prototype, not a SaaS or compliance product.

- The Signature is reproducible for identical inputs (Model `gryps-signature-v0.4`).
- Site Conditions + Mitigation layers explain the score in the teaser UI.
- Stack: Next.js, Neon, MapLibre, optional Mistral for wording only.

@answer scope="Hiring proof · Advisor · Model v0.4 · non-commercial"
@meta locale=en

## 60-second path {#path}

@steps id=advisor-path
| open | Open Advisor | Go to `/#advisor` (or https://gryps.vercel.app/#advisor). | | |
| profile | Enter profile | Latitude/longitude, sector, providers, autonomy, criticality. | | |
| generate | Generate | POST `/api/advise` → `scoreSite` → Model v0.4. | | |
| read | Read Signature | Score, grade, layers, recommended path, top risks. | | |

## Deterministic vs AI {#authority}

| Concern | Owner | Notes |
| --- | --- | --- |
| Score / grade / ranks | Model v0.4 {good:Authoritative} | `lib/deterministic-score.ts` |
| Recommendation wording | Optional Mistral {caution:Opt-in} | Never overrides numeric fields |
| Live RF / SLA | Out of scope {caution:Not claimed} | Catalog and Traficom refs are context only |

## Stack {#stack}

@list id=stack-bits
| Next.js — App Router UI and API routes |
| Neon — Advisor submissions and rate limit |
| MapLibre — Map and geography surfaces |
| Mistral — Optional interpretation prose only |

## What it is not {#limits}

@list id=not-this
| Not customer deployments or SLAs |
| Not live RF monitoring |
| Not procurement or compliance advice |
| Not a commercial SaaS storefront |
