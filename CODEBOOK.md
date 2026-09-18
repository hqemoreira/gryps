# GRYPS — Codebook

> Non-commercial R&D — assessment-first satellite connectivity resilience scoring for Nordic/Arctic industrial contexts (Resilience Signature).
> Stack: Next.js 16 App Router · TypeScript · CSS custom properties + Tailwind CSS v4 (PostCSS) · MapLibre GL · Neon (PostgreSQL) · Vercel

---

## Public posture

- **Indexed** product (with Portfolio). Scores and documents — does **not** live-monitor links or sell a NOC. Private ops tooling (if any) stays private — do not discuss or couple product UI to it.
- **Phase goal (product):** experimental research prototype for Connectivity Intelligence — commercialization and monetization are outside the current scope. Public posture: `/research-prototype`. Portfolio demonstration (career narrative): `/case-study`. Do not mix personal administrative / benefit notes into the product UI.
- **Object:** Resilience Signature (deterministic engine **v0.3**). Product vocabulary: Connectivity Intelligence → Advisor action **Generate Resilience Signature** → output **Resilience Signature** → map **Explore Connectivity Intelligence**. Supporting surfaces: `/methodology`, `/providers`, `/research` (Research Library), `/map`, `/about`, `/knowledge`, `/case-study`, `/research-prototype`, research docs (`/data-sources`, `/assumptions`, `/limitations`, `/changelog`). Thin `/signatures/[slug]` Site XX pages are **noindex** and excluded from the sitemap (kept for map/dev).
- **Golden demo:** Homepage sample Signature is **Score 47 · Grade D** (forestry · 68.2°N · Starlink · autonomous · high). Single source: `lib/hero-demo.ts` (also drives OG / social previews). Verify with `npm run test:score`.
- **Landing:** Arctic ops-console composition — sticky Signature card, polar atmosphere around (not through) the Signature, GrypsMark footer lockup.
- **Legal chrome:** Terms/Privacy at `/terms` and `/privacy` — labeled non-commercial R&D — not multi-section commercial “Legal”.
- **Monitoring:** versioning fields support future T0/T1 comparison; live drift alerting is **not** productized. No freemium / free-trial CTAs. Prototype line: Research prototype · Non-commercial · Model-based analysis.
- **Claims:** Confidence = assessment/data-basis confidence (not availability %). Provider orbital notes = reference / model commentary (not SLA). Optional Mistral prose must not invent availability %, precise latency SLAs, or live telemetry.
- **Research Library:** Curated 8–12 named assessments at `/research` — not customer cases. Catalog in `lib/research-library.ts`.
- **Language:** Prefer Research / Prototype / Experimental / Assessment / Methodology / Evidence / Scenario / Intelligence. Avoid Buy / Get a quote / For customers / Our solution / Book a consultation / Enterprise plans.
- **Deferred commercial (internal — do not build now; do not publish as a public checklist):** payments, subscriptions, customer billing, sales CRM, commercial lead capture, customer contracts, paid reports, customer onboarding, team collaboration, commercial API, marketplace, advertising.
- **SEO:** `Allow: /` + indexed metadata; `Disallow: /signatures/`. Ops loop (not public UI): Search Console + Keyword Planner scripts under `scripts/seo/` → `seo/*.json` → `/knowledge` notes for issue #3.
- **i18n:** EN + FI only; language preference persisted; natural Finnish (not calques).
- **GitHub front door:** public `README.md` (posture + stack + how to run); architecture stays in this codebook. Proprietary `LICENSE` harmonized with sibling portfolio repos.

## UX architecture — Explore · Assess · Research

GRYPS does **not** need a visual redesign. It needs information architecture and progressive disclosure so visitors always know the next step.

### Primary modes (header)

| Mode         | Purpose                     | Children                                                                                                   |
| ------------ | --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Explore**  | Connectivity landscape      | `/map`, `/providers`, `/research`, `/scenarios`                                                            |
| **Assess**   | Run the intelligence engine | `/#advisor`, `/workspace` (UI: Assessments)                                                                |
| **Research** | Understand the model        | `/methodology`, `/knowledge` (UI: Evidence), `/data-sources`, `/assumptions`, `/limitations`, `/changelog` |

Source of truth: `lib/ia-nav.ts` (Header, Footer, DocShell).

### Secondary / reference (footer, not peer nav)

`/about`, `/research-prototype`, `/case-study` · Legal: `/terms`, `/privacy`

### Thin / noindex

`/signatures/[slug]` Site XX — map/dev only; not primary nav.

### Homepage role

Orientation + routing — not a catalogue. Hero + Signature sample (Score 47 · Grade D) → mental model → three modes → research dataset strip → example Signatures → Research & Prototype link. Heavy map/ops/methodology prose moves to child routes.

### Signature UX

Progressive disclosure on output: Overview · Risks · Options · Evidence · Method · Compliance (+ drawers for “Why?”). Evidence chips (same meaning everywhere): MODELLED · MEASURED · RESEARCH · ILLUSTRATIVE · DERIVED — see `lib/evidence-kinds.ts` / `TypeLabel`. Map scope “Library sites on map” counts pins with a Library write-up (may be fewer than `RESEARCH_LIBRARY_COUNT` assessments).

### Terminology

| Prefer                      | Avoid as peer destinations         |
| --------------------------- | ---------------------------------- |
| Explore · Assess · Research | Flat list of 8+ equal links        |
| Evidence (was Knowledge)    | Vague “Knowledge” as top-level     |
| Assessments (was Workspace) | “Workspace” as SaaS collab cue     |
| Generate Signature (chrome) | Competing secondary CTAs in header |

### Homepage content moves

See `HOMEPAGE_CONTENT_MOVES` in `lib/ia-nav.ts`.

### Changelog — 2026-09

- **2026-09-18 (Forge s22):** Confirmed dual-home sync with Forge journals (gryps-s14 still latest product work). Next: verify Resend domain delivery + watch Vercel Analytics funnel events.
- **2026-09-18 (professional cleanup):** Removed unused Next.js scaffold assets and unmounted drift demo; synced `NEON_DATABASE_URL` across `.env.example` / CI / docs; Dependabot commit-prefix hygiene; README / SECURITY / LICENSE / CODEBOOK aligned to live product (Score 47 · Grade D golden demo); hero card uses `lib/hero-demo.ts` only.
- **2026-09-18:** Advisor funnel polish — Save vs Unlock vs Get updates clarified; `intent` derived from topics; non-identifying Vercel Analytics events (`advise_run`, `unlock_request`, `unlock_verify`, `use_case_pick`, `save_local`); unlock error banners red; Analyse another clears `sid`. GitHub owner URLs → `hqemoreira`.
- UX architecture: Explore · Assess · Research modes; shared `lib/ia-nav.ts`; homepage as orientation layer; Signature progressive disclosure.
- Research & Prototype (`/research-prototype`): public product posture only; `/roadmap` redirects away. Career objectives and personal benefit notes stay out of the product UI.
- Portfolio case study (`/case-study`); Methodology v0.5 demonstration layer.
- Research quality docs: `/data-sources`, `/assumptions`, `/limitations`, `/changelog` (Methodology v0.4).
- Research Library (`/research`): curated 12 named assessments from existing examples + seeds; thin Site XX noindex + removed from sitemap; `/signatures` redirects to `/research`.
- Map productization (`/map`): Explore Connectivity Intelligence — Region · Vertical · Priority filters; site panel → Generate Resilience Signature (prefill) + Research Library link; no live tracking.
- Product language + claim hygiene: canonical CTA **Generate Resilience Signature**; confidence ≠ availability; provenance labels on Signature output.
- Knowledge notes at `/knowledge` (EN+FI, FAQ JSON-LD) seeded from early GSC + issue #3 backlog; `seo:propose` early-stage fallback; weekly GitHub Action `.github/workflows/seo-weekly.yml` (needs `GSC_SERVICE_ACCOUNT_JSON` secret).
- SEO ops scaffold: `npm run seo:gsc` / `seo:planner` / `seo:propose` (GSC first; Planner stub until Ads token). Local GSC setup helper: `npm run seo:setup-gsc` → credentials under `~/.config/gryps/` (never repo `.env*`).
- Advisor funnel: anonymous abbreviated Initial Assessment → email magic-link unlock → full report. No Google Sign-In.
- Public README shipped as GitHub front door (posture + stack + how to run); architecture stays in this codebook.
- Proprietary LICENSE harmonized across the portfolio (same wording family as sibling repos).
- Signature engine v0.3; MapLibre + Esri basemap; Arctic ops-console landing; FI mobile polish + language persistence.

---

## Stack decisions

| Concern    | Choice                                                             | Why                                                                                      |
| ---------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Framework  | Next.js 16 App Router                                              | Server components + API routes in one repo                                               |
| Styling    | CSS custom properties + Tailwind CSS v4 (PostCSS `@import`)        | Theme via CSS variables; Tailwind as build-time utility layer — product UI mostly custom |
| Fonts      | `next/font/google` — Space Grotesk + JetBrains Mono                | Eliminates render-blocking Google Fonts import                                           |
| Maps       | MapLibre GL + key-free Esri raster tiles                           | Ops console maps without a Carto/tile API key (`lib/basemap.ts`)                         |
| Scoring    | Deterministic Signature engine v0.3 (`lib/deterministic-score.ts`) | Reproducible score / grade / risks / ranked providers                                    |
| Database   | Neon serverless PostgreSQL (EU Frankfurt)                          | EU data residency for Nordic operators                                                   |
| Analytics  | Vercel Analytics                                                   | Cookieless, GDPR-compliant by default                                                    |
| Deployment | Vercel                                                             | ~30s deploys from git push                                                               |

---

## Theme system

Two static maps applied directly to `documentElement` CSS variables. No CSS-in-JS, no context.

```ts
const DARK: Record<string, string> = {
  "--bg": "#070B12",
  "--surface": "#0B1220",
  "--surface2": "#111827",
  "--border": "#1E293B",
  "--border2": "#253347",
  "--text": "#F7FAFC",
  "--text-muted": "#64748B",
  "--text-dim": "#334155",
};
const LIGHT: Record<string, string> = {
  "--bg": "#F4F6F9",
  "--surface": "#FFFFFF",
  "--surface2": "#EEF1F6",
  "--border": "#DDE2EC",
  "--border2": "#C8D0DE",
  "--text": "#0B1220",
  "--text-muted": "#5A6A84",
  "--text-dim": "#9AAABF",
};

// Applied in useEffect whenever dark state changes:
useEffect(() => {
  const vars = dark ? DARK : LIGHT;
  Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
}, [dark]);
```

---

## i18n — prop drilling, no Context

All translatable components accept `t: typeof COPY.en` as a prop. `COPY` is a module-level const with `.en` and `.fi` keys. `lang` state lives in the root `HomePage` component; `t = COPY[lang]` is derived at render time and passed down.

```ts
const COPY = {
  en: {
    tag: "Satellite connectivity resilience",
    // advisory / assessment copy — no pricing tiers or freemium CTAs
    // ... all strings
  },
  fi: {
    // 100% Finnish equivalent of every key
  }
}

// In HomePage:
const [lang, setLang] = useState<"en" | "fi">("en")
const t = COPY[lang]

// Passed to every component:
<TelemetryStream t={t} />
<PolarMap t={t} />
```

Do not reintroduce `PricingTiers` or paid ladder copy. Assessment surfaces: `app/methodology/page.tsx`, `app/providers/page.tsx`, versioned Signature metadata in `lib/signature-meta.ts`.

---

## Polar atmosphere (landing)

Landing polar geometry is an **ops / methodology instrument**, not a live constellation feed. Atmosphere and aurora motifs support the Signature card — they must not replace it or bleed through the score surface. Sticky mobile CTA hides when the footer enters view so copyright stays readable. Implementation: `components/PolarAtmosphere.tsx`, hero composition in `app/page.tsx`.

---

## Animated polar map (requestAnimationFrame loop)

Key insight: store elapsed seconds in `tick` state. All satellite positions are pure functions of `tick` — no imperative animation logic.

```tsx
function PolarMap({ t }: { t: typeof COPY.en }) {
  const cx = 200,
    cy = 195,
    maxR = 160;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    function loop(now: number) {
      setTick((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Satellite position: r = orbital radius, speed = rad/sec, offset = phase
  function satPos(r: number, speed: number, offset: number) {
    const a = tick * speed + offset;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  // Convert geographic latitude to SVG radius
  function latToR(lat: number) {
    return ((90 - lat) / 50) * maxR;
  }

  const starlink = satPos(latToR(67), 1.5, 0); // LEO fast
  const oneweb = satPos(latToR(71), 1.1, 2.4); // LEO medium
  const iridium = satPos(latToR(74), 0.8, 4.7); // Polar
}
```

**ViewBox fix:** original `200×200` clipped the 50°N ring. Fixed to `viewBox="0 0 400 390"` with `cx=200, cy=195`.

---

## Demo reel — scene remounting pattern

SceneViz components hold internal animation state (typing timers, counting intervals). `key={scene}` forces React to fully unmount/remount the component tree on scene change, cleanly restarting all animations.

```tsx
function DemoReel({ t }: { t: typeof COPY.en }) {
  const [scene, setScene] = useState(0);
  const VIZS = [<SceneViz0 />, <SceneViz1 />, <SceneViz2 />, <SceneViz3 />, <SceneViz4 />];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      {/* key forces remount — all internal state resets */}
      <div key={`viz-${scene}`}>{VIZS[scene]}</div>
      <div>
        <p>{t.demoScenes[scene].headline}</p>
        <p>{t.demoScenes[scene].body}</p>
      </div>
    </div>
  );
}
```

**Scene animation examples:**

```tsx
// SceneViz1 — coordinate typing at 75ms/char
useEffect(() => {
  let i = 0;
  const id = setInterval(() => {
    setTyped(COORD.slice(0, ++i));
    if (i >= COORD.length) clearInterval(id);
  }, 75);
  return () => clearInterval(id);
}, []);

// SceneViz3 — score bars counting from 0 to target
useEffect(() => {
  const id = setInterval(() => {
    setScores((s) => s.map((v, i) => Math.min(v + 2, TARGETS[i])));
  }, 25);
  return () => clearInterval(id);
}, []);
```

---

## Telemetry stream

Cycles through 8 lines, one every 900ms. Only the current line is fully opaque — previous lines fade to 45%.

```tsx
const [visible, setVisible] = useState(1)

useEffect(() => {
  const id = setInterval(() => {
    setVisible(v => v < TELEMETRY_LINES.length ? v + 1 : 1)
  }, 900)
  return () => clearInterval(id)
}, [])

// In render:
opacity: i < visible ? (i === visible - 1 ? 1 : 0.45) : 0,
transition: "opacity 0.4s ease",
```

---

## Scroll anchor behind fixed header

Fixed header is 72px tall. Without `scrollMarginTop`, clicking a nav link scrolls the target element to the top of the viewport, hiding it behind the header.

```tsx
<div id="advisor" style={{ scrollMarginTop: 72 }}>
```

---

## EU AI Act Article 50 — AI badge

Inline `[AI]` badge on every AI-generated analytical summary (Advisor /
Resilience Signature caveats). Tooltip discloses limited-risk classification,
Mistral-only provider, human oversight, and Art. 50. Must stay aligned with
Terms §04 and Privacy §05 — see Legal coupling above.

```tsx
<span
  title="EU AI Act Art. 50 — AI-generated analytical summary (Mistral). Limited-risk system. …"
  style={{
    fontFamily: "var(--font-data)",
    fontSize: 8,
    color: "var(--text-dim)",
    border: "1px solid var(--border)",
    borderRadius: 3,
    padding: "2px 5px",
    letterSpacing: "0.06em",
    cursor: "help",
  }}
>
  AI
</span>
```

---

## Animated canvas favicon (AnimatedFavicon.tsx)

Runs a `requestAnimationFrame` loop on an offscreen `<canvas>`. On each frame, draws 3 orbital arcs with independent pulse rhythms, a scanning dot on the LEO arc, and an origin glow. Writes the result to `link[rel='icon']` via `canvas.toDataURL()`.

```tsx
useEffect(() => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  let raf: number;

  function draw(t: number) {
    ctx.clearRect(0, 0, 64, 64);
    // ... draw arcs, scanning dot, glow
    const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (link) link.href = canvas.toDataURL();
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(raf);
}, []);
```

---

## File structure

```
gryps/
├── app/
│   ├── layout.tsx              # Root layout — fonts, JSON-LD, AnimatedFavicon
│   ├── page.tsx                # Landing — ops-console hero + Signature (Score 47 · D)
│   ├── about/                  # About
│   ├── methodology/            # Assessment methodology (EN/FI)
│   ├── providers/              # Provider catalog
│   ├── signatures/             # Versioned Signature list + [slug] (noindex)
│   ├── map/                    # Connectivity Intelligence map (MapLibre)
│   ├── (prototype)/            # /terms · /privacy
│   ├── icon.tsx                # Static PNG favicon (32×32) via ImageResponse
│   └── api/                    # advise, contact, signatures, submissions, notify
├── components/
│   ├── OpsConsoleMap.tsx       # Shared MapLibre ops map
│   ├── CapacityMap*.tsx        # Capacity map shell
│   ├── SignaturesMap.tsx       # Signatures map (Leaflet)
│   ├── PolarAtmosphere.tsx     # Landing polar geometry
│   ├── GrypsMark.tsx           # Mark / lockup
│   └── Footer.tsx / Header.tsx
└── lib/
    ├── deterministic-score.ts  # Signature engine v0.3
    ├── hero-demo.ts            # Golden demo Score 47 · Grade D
    ├── basemap.ts              # Esri raster tile URLs
    ├── ops-map-style.ts        # Shared MapLibre style
    └── scoring.ts / signatures-db.ts / …
```

---

## Testing convention

Manual test submissions against the live Advisor (or any form that captures an
email) should use the shared portfolio-wide address
`henrique+test@henriquemoreira.eu`, not a personal or throwaway address.

There is no write-time tagging of test submissions in this repo —
`advisor_submissions` has no generic "source" column suited to that, and this
codebase has no `/api/advise`-side concept of test vs. real traffic. Prefer the
`+test@` address convention so private ops views can filter test rows without
changes in this product repo.

---

## Environment variables

| Key                   | Used in                                                                    | Purpose                                                                                                                                                                                                                      |
| --------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEON_DATABASE_URL`   | `api/advise/*`, `lib/signatures-db.ts`, `api/notify/verify`, `api/contact` | Neon PostgreSQL connection string                                                                                                                                                                                            |
| `MISTRAL_API_KEY`     | `lib/scoring.ts`                                                           | Optional Mistral recommendation prose                                                                                                                                                                                        |
| `RESEND_API_KEY`      | `lib/mail.ts`                                                              | Send unlock confirmation emails (magic link)                                                                                                                                                                                 |
| `RESEND_FROM`         | `lib/mail.ts`                                                              | From address on a **verified** Resend domain, e.g. `GRYPS <hello@gryps.eu>`. Until the domain is verified, Resend only delivers to the account owner (`hqe.moreira@gmail.com`) and rejects addresses like `henrique+test@…`. |
| `NEXT_PUBLIC_APP_URL` | `lib/mail.ts`                                                              | Canonical site origin for magic-link URLs (prefer over Vercel preview host)                                                                                                                                                  |

Set in: Vercel → gryps project → Settings → Environment Variables  
(or `vercel env add` for each key). Do not commit secrets. Placeholders: `.env.example`.

When Resend rejects a send (unverified domain / test-mode recipient), `/api/advise/unlock` still returns `verifyUrl` so the UI can unlock without inbox delivery. After `gryps.eu` (or another domain) is verified at [resend.com/domains](https://resend.com/domains), set `RESEND_FROM` accordingly and test mail will reach `henrique+test@henriquemoreira.eu`.

### Advisor funnel (product)

- Anonymous `/api/advise` returns **abbreviated** result; full `output` JSON stays in `advisor_submissions`.
- Unlock: `POST /api/advise/unlock` → `notify_requests` row + Resend magic link → `GET /api/notify/verify?token=…` sets `verified_at` / `unlocked_at`.
- Topics drive `intent`: `unlock` · `notify` · `both` (full_assessment vs reports_launch/monitoring).
- Soft anonymous budget: client tracks `gryps-anon-runs` for soft UX only; funnel signal uses Vercel Analytics custom events (no email/PII) via `lib/funnel-analytics.ts`.
- Non-identifying feedback: `POST /api/advise/feedback` → `advisor_submissions.use_case`.
- Local **Save to Assessments** is browser-only teaser/full workspace storage — not the email unlock path.
- Prefer **verified** `notify_requests` (+ contact emails) as identified interest; raw anonymous runs stay anonymous.

Manual unlock tests: prefer `hqe.moreira@gmail.com` until the domain is verified; otherwise use the on-page verify link.

---

## Dash house rules (EN + FI)

- Use a typographic em dash (`—`) for parenthetical breaks and paired asides in
  both EN and FI product copy. Do not use ASCII `--` or spaced hyphen pairs.
- Keep product and feature names in English in both locales when intentional
  (GRYPS, Resilience Signature, Connectivity Advisor, Capacity Map, Mistral).
- UI languages are **EN and FI only** — no third language.
- Prefer natural Finnish over calques (e.g. `alusta` / `palvelu`, not `platformin`).

---

## Legal coupling (plain prototype notices)

Privacy (`/privacy`) and Terms (`/terms`) are the required public
legal pages (footer-linked; route group `app/(prototype)/`). Both locales must stay aligned on:

- Plain, short notices — not multi-section commercial T&Cs
- Operator: Henrique Moreira · Espoo, Finland · contact `hqe.moreira@gmail.com`
- Non-commercial research / demonstration prototype — no company, no revenue, no sale
- AI processing disclosed: **Mistral** (+ Vercel hosting) for demonstration Resilience Signature
- No marketing tracking / analytics cookies claimed in Privacy
- Optional email only when the user requests full-assessment unlock / save / updates; confirmation via magic link (Resend). Deletion via `hello@gryps.eu` or Terms contact form
- Point-of-exposure UI: `[AI]` badge remains on Advisor outputs; Terms link is `/terms`

This is product copy/compliance alignment — not legal advice.

Footer copyright: `© {year} GRYPS · All rights reserved` (FI: `Kaikki oikeudet pidätetään`)
via `grypsCopyright()` in `components/Footer.tsx`.

---

## Connectivity Intelligence map (`/map`)

**Explore Connectivity Intelligence** — dominant MapLibre view of
`signature_sites`. Product flow: region / vertical / priority → site panel →
**Generate Resilience Signature** (Advisor prefill) and optional **Research
Library** assessment. Not live RF / tracking / 3D globe.

| Filter   | Values                                                       |
| -------- | ------------------------------------------------------------ |
| Region   | All · Nordics · Arctic · Iceland                             |
| Vertical | All · Forestry · Mining · Maritime · Arctic · Infrastructure |
| Priority | All · Standard · High · Safety-critical                      |
| Scope    | All modeled sites · Research Library only                    |

Site panel shows modeled resilience band, assessment confidence, orbit
architectures (LEO / MEO / GEO / Polar), and curated display names when the
site is in the Research Library.

| Status     | Derived from                                      |
| ---------- | ------------------------------------------------- |
| `ok`       | Resilience Signature grade A or B (or score ≥ 70) |
| `degraded` | grade C or D (or score 30–69)                     |
| `down`     | grade F (or score &lt; 30)                        |
| `unknown`  | missing grade and score                           |

**Data limits (honest):**

- Source table is `signature_sites` only. `advisor_submissions` are anonymous
  one-off analyses without stable site identity — not plotted.
- There is **no** live link-monitoring, SNMP, or capacity-telemetry table in
  this product. Status is model-derived from the stored Resilience Signature,
  not real-time “link up/down.”
- Optional side-panel fields (`real_data_score`, terrain, Bittimittari gap) are
  enrichment already on the row; null when unavailable (e.g. non-FI sites).
- Map tiles: **MapLibre GL** + key-free **Esri** imagery / dark raster basemap
  (`lib/basemap.ts`, `lib/ops-map-style.ts`). Carto free styles now require an
  API key — do not revert to them. Keep Esri attribution badge visible.
  Still no paid map SaaS contract and **no** live link monitoring.

Implementation: `lib/capacity-status.ts`, `lib/research-library.ts`,
`components/CapacityMap.tsx`, `components/CapacityMapView.tsx`,
`components/OpsConsoleMap.tsx`, `app/map/page.tsx` (`force-dynamic`).

---

## Cookies & ePrivacy

**Banner required: No.** No HTTP cookies. Theme preference in localStorage (`gryps-theme`) + cookieless Vercel Analytics. Privacy §09 states no consent banner for Vercel Analytics; theme storage disclosed (no false sessionStorage claim).

| Key                                    | Type         | Class                                                   |
| -------------------------------------- | ------------ | ------------------------------------------------------- |
| `gryps-theme`                          | localStorage | Functional UI preference                                |
| `gryps-lang`                           | localStorage | Language preference (EN/FI)                             |
| `gryps-anon-runs`                      | localStorage | Soft count of Advisor runs (analytics; not a hard gate) |
| Vercel Analytics (`@vercel/analytics`) | —            | Cookieless                                              |

No advertising trackers.
