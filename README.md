# GRYPS

Non-commercial R&D — assessment-first **Resilience Signature** scoring for satellite connectivity resilience in Nordic / Arctic industrial contexts. Scores and documents; does **not** live-monitor links or sell a NOC.

**Live:** [gryps.vercel.app](https://gryps.vercel.app)

## Surfaces

| Path | Purpose |
|------|---------|
| `/` | Ops-console landing + Signature |
| `/case-study` | Portfolio case study |
| `/roadmap` | Research roadmap · deferred commercial list |
| `/methodology` | Research methodology (EN/FI) |
| `/data-sources` · `/assumptions` · `/limitations` · `/changelog` | Research quality docs |
| `/research` | Research Library |
| `/scenarios` | Mission scenarios |
| `/workspace` | Local Research Workspace |
| `/providers` | Provider catalog |
| `/map` | Connectivity Intelligence map |
| `/about` | About |
| `/terms` · `/privacy` | Non-commercial R&D notices |

## Stack

- Next.js 16 App Router · TypeScript · CSS custom properties
- Deterministic Signature engine v0.3 (`lib/deterministic-score.ts`)
- MapLibre GL + key-free Esri raster basemap
- Neon Postgres (EU) · Mistral · Vercel Analytics

## Local development

```bash
npm install
npm run dev
```

## Environment variables

Set via Vercel CLI / dashboard — never commit secrets.

| Variable | Purpose |
|----------|---------|
| `NEON_DATABASE_URL` | Postgres (signatures / submissions) |
| `MISTRAL_API_KEY` | Advisor / scoring paths that call Mistral |

## Docs

Architecture and house rules: [`CODEBOOK.md`](./CODEBOOK.md). Also see `AGENTS.md` / `CLAUDE.md` for agent conventions.

## License

Proprietary — see [`LICENSE`](./LICENSE). All rights reserved.
