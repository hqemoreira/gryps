# GRYPS

Non-commercial R&D / research prototype — assessment-first **Resilience Signature** scoring for satellite connectivity resilience in Nordic / Arctic industrial contexts.

Scores and documents site dependency and redundancy gaps. Does **not** live-monitor links, sell airtime, or operate a NOC.

**Live:** [gryps.vercel.app](https://gryps.vercel.app)  
**Posture:** Research · Prototype · Experimental — open via the live URL (not a SaaS storefront).

## Golden demo

Homepage sample Signature (forestry · 68.2°N · Starlink · autonomous · high criticality):

**Score 47 · Grade D** — Model v0.3 (`lib/hero-demo.ts` + `lib/deterministic-score.ts`).

## Surfaces

| Path                                                             | Purpose                                             |
| ---------------------------------------------------------------- | --------------------------------------------------- |
| `/`                                                              | Ops-console landing + Generate Resilience Signature |
| `/case-study`                                                    | Portfolio case study                                |
| `/research-prototype`                                            | Research & Prototype posture                        |
| `/methodology`                                                   | Research methodology (EN/FI)                        |
| `/data-sources` · `/assumptions` · `/limitations` · `/changelog` | Research quality docs                               |
| `/research`                                                      | Research Library                                    |
| `/scenarios`                                                     | Mission scenarios                                   |
| `/workspace`                                                     | Local Research Workspace (Assessments)              |
| `/providers`                                                     | Provider catalog                                    |
| `/map`                                                           | Explore Connectivity Intelligence                   |
| `/knowledge`                                                     | Evidence notes                                      |
| `/about`                                                         | About                                               |
| `/terms` · `/privacy`                                            | Non-commercial R&D notices                          |

## Stack

Technologies this repo actually uses:

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **CSS custom properties** + Tailwind CSS v4 (PostCSS layer)
- Deterministic Signature engine **v0.3** (`lib/deterministic-score.ts`)
- **MapLibre GL** (+ Leaflet on legacy signatures map) · key-free Esri raster basemap
- **Neon** Postgres (EU) · **Mistral** (optional recommendation prose) · **Resend** (unlock email)
- **Vercel** Analytics · deploy on Vercel

## Local development

```bash
npm install
cp .env.example .env.local   # fill placeholders — never commit secrets
npm run dev
```

Useful scripts:

| Script               | Purpose                           |
| -------------------- | --------------------------------- |
| `npm run lint`       | ESLint                            |
| `npm run typecheck`  | TypeScript                        |
| `npm run build`      | Production build                  |
| `npm run test:score` | Deterministic engine sanity cases |

## Environment variables

Set via Vercel CLI / dashboard — never commit secrets. See [`.env.example`](./.env.example).

| Variable              | Purpose                                                |
| --------------------- | ------------------------------------------------------ |
| `NEON_DATABASE_URL`   | Postgres (signatures / submissions / contact / unlock) |
| `MISTRAL_API_KEY`     | Optional Advisor recommendation prose                  |
| `RESEND_API_KEY`      | Unlock / contact email                                 |
| `RESEND_FROM`         | Verified Resend from-address (optional)                |
| `NEXT_PUBLIC_APP_URL` | Canonical origin for magic links (optional)            |

## Docs

Architecture and house rules: [`CODEBOOK.md`](./CODEBOOK.md). Agent conventions: `AGENTS.md` / `CLAUDE.md`. Security: [`SECURITY.md`](./SECURITY.md).

## License

Proprietary — see [`LICENSE`](./LICENSE). All rights reserved.

## Contact

Henrique Moreira · Espoo, Finland  
Email: hqe.moreira@gmail.com · Web: [henriquemoreira.eu](https://henriquemoreira.eu) · GitHub: [hqemoreira](https://github.com/hqemoreira)
