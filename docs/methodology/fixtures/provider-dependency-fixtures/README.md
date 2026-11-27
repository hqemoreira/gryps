# Provider dependency research fixtures

Research-only fixtures for Sprint 9. **Not** imported by the scoring engine or production application.

Schema version: `gryps-dependency-fixture-v0.1`

Canonical terminology (Sprint 9):

| Concept | Required term |
| --- | --- |
| v0.4 scoring component (`provider_confidence`) | Catalogue confidence |
| Distinct selected catalogue provider ids | Provider diversity |
| `hasOrbitMix` catalogue orbit/class combination | Catalogue-based orbit mix |
| Evidenced infrastructure independence | Only with sufficient evidence |
| Missing dependency information | Unknown |

Fixtures never include a Resilience Signature, grade, weight, or failure probability.

| Id | Purpose |
| --- | --- |
| A | Starlink + OneWeb architecture-class contrast; independence UNKNOWN |
| B | Starlink + Iridium catalogue orbit mix; independence UNKNOWN |
| C | Synthetic shared landing |
| D | Synthetic scoped positive separation |
| E | Synthetic contradictory / temporal evidence |
