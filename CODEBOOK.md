# GRYPS — Codebook

> Non-commercial R&D — assessment-first satellite connectivity resilience scoring for Nordic/Arctic industrial contexts (Resilience Signature).
> Stack: Next.js 16 App Router · TypeScript · CSS custom properties · MapLibre GL · Neon (PostgreSQL) · Vercel

---

## Public posture

- **Indexed** product (with Portfolio). Scores and documents — does **not** live-monitor links or sell a NOC. Forge is private ops (noindex).
- **Object:** Resilience Signature (deterministic engine **v0.3**). Supporting surfaces: `/methodology`, `/providers`, `/signatures`, `/map` (Capacity), `/about`.
- **Landing:** Arctic ops-console composition — sticky Signature card, polar atmosphere around (not through) the Signature, GrypsMark footer lockup.
- **Legal chrome:** Terms/Privacy labeled non-commercial R&D — not multi-section commercial “Legal”.
- **Monitoring:** illustrative T0/T1 drift mock only. No freemium / free-trial CTAs.
- **SEO:** `Allow: /` + indexed metadata (unlike shelved portfolio prototypes). Ops loop (not public UI): Search Console + Keyword Planner scripts under `scripts/seo/` → `seo/*.json` → knowledge-page proposals for issue #3.
- **i18n:** EN + FI only; language preference persisted; natural Finnish (not calques).
- **GitHub front door:** public `README.md` (posture + stack + how to run); architecture stays in this codebook. Proprietary `LICENSE` harmonized with sibling portfolio repos.

### Changelog — 2026-09

- SEO ops scaffold: `npm run seo:gsc` / `seo:planner` / `seo:propose` (GSC first; Planner stub until Ads token). Local GSC setup helper: `npm run seo:setup-gsc` → credentials under `~/.config/gryps/` (never repo `.env*`).
- Advisor funnel: anonymous abbreviated Initial Assessment → email magic-link unlock → full report. No Google Sign-In.
- Public README shipped as GitHub front door (posture + stack + how to run); architecture stays in this codebook.
- Proprietary LICENSE harmonized across the portfolio (same wording family as sibling repos).
- Active/indexed: Portfolio + GRYPS only. Forge is private ops (noindex).
- Signature engine v0.3; MapLibre + Esri basemap; Arctic ops-console landing; FI mobile polish + language persistence.

---

## Stack decisions

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 App Router | Server components + API routes in one repo |
| Styling | CSS custom properties (no Tailwind) | Theme switching via `document.documentElement.style.setProperty` — zero runtime overhead |
| Fonts | `next/font/google` — Space Grotesk + JetBrains Mono | Eliminates render-blocking Google Fonts import |
| Maps | MapLibre GL + key-free Esri raster tiles | Ops console maps without a Carto/tile API key (`lib/basemap.ts`) |
| Scoring | Deterministic Signature engine v0.3 (`lib/deterministic-score.ts`) | Reproducible score / grade / risks / ranked providers |
| Database | Neon serverless PostgreSQL (EU Frankfurt) | EU data residency for Nordic operators |
| Analytics | Vercel Analytics | Cookieless, GDPR-compliant by default |
| Deployment | Vercel | ~30s deploys from git push |

---

## Theme system

Two static maps applied directly to `documentElement` CSS variables. No CSS-in-JS, no context.

```ts
const DARK: Record<string, string> = {
  "--bg": "#070B12", "--surface": "#0B1220", "--surface2": "#111827",
  "--border": "#1E293B", "--border2": "#253347",
  "--text": "#F7FAFC", "--text-muted": "#64748B", "--text-dim": "#334155",
}
const LIGHT: Record<string, string> = {
  "--bg": "#F4F6F9", "--surface": "#FFFFFF", "--surface2": "#EEF1F6",
  "--border": "#DDE2EC", "--border2": "#C8D0DE",
  "--text": "#0B1220", "--text-muted": "#5A6A84", "--text-dim": "#9AAABF",
}

// Applied in useEffect whenever dark state changes:
useEffect(() => {
  const vars = dark ? DARK : LIGHT
  Object.entries(vars).forEach(([k, v]) =>
    document.documentElement.style.setProperty(k, v)
  )
}, [dark])
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
  const cx = 200, cy = 195, maxR = 160
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let raf: number
    const start = performance.now()
    function loop(now: number) {
      setTick((now - start) / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Satellite position: r = orbital radius, speed = rad/sec, offset = phase
  function satPos(r: number, speed: number, offset: number) {
    const a = tick * speed + offset
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }

  // Convert geographic latitude to SVG radius
  function latToR(lat: number) { return ((90 - lat) / 50) * maxR }

  const starlink = satPos(latToR(67), 1.5, 0)   // LEO fast
  const oneweb   = satPos(latToR(71), 1.1, 2.4) // LEO medium
  const iridium  = satPos(latToR(74), 0.8, 4.7) // Polar
}
```

**ViewBox fix:** original `200×200` clipped the 50°N ring. Fixed to `viewBox="0 0 400 390"` with `cx=200, cy=195`.

---

## Demo reel — scene remounting pattern

SceneViz components hold internal animation state (typing timers, counting intervals). `key={scene}` forces React to fully unmount/remount the component tree on scene change, cleanly restarting all animations.

```tsx
function DemoReel({ t }: { t: typeof COPY.en }) {
  const [scene, setScene] = useState(0)
  const VIZS = [<SceneViz0 />, <SceneViz1 />, <SceneViz2 />, <SceneViz3 />, <SceneViz4 />]

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      {/* key forces remount — all internal state resets */}
      <div key={`viz-${scene}`}>{VIZS[scene]}</div>
      <div>
        <p>{t.demoScenes[scene].headline}</p>
        <p>{t.demoScenes[scene].body}</p>
      </div>
    </div>
  )
}
```

**Scene animation examples:**

```tsx
// SceneViz1 — coordinate typing at 75ms/char
useEffect(() => {
  let i = 0
  const id = setInterval(() => {
    setTyped(COORD.slice(0, ++i))
    if (i >= COORD.length) clearInterval(id)
  }, 75)
  return () => clearInterval(id)
}, [])

// SceneViz3 — score bars counting from 0 to target
useEffect(() => {
  const id = setInterval(() => {
    setScores(s => s.map((v, i) => Math.min(v + 2, TARGETS[i])))
  }, 25)
  return () => clearInterval(id)
}, [])
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
    fontFamily: "var(--font-data)", fontSize: 8, color: "var(--text-dim)",
    border: "1px solid var(--border)", borderRadius: 3, padding: "2px 5px",
    letterSpacing: "0.06em", cursor: "help",
  }}
>AI</span>
```

---

## Animated canvas favicon (AnimatedFavicon.tsx)

Runs a `requestAnimationFrame` loop on an offscreen `<canvas>`. On each frame, draws 3 orbital arcs with independent pulse rhythms, a scanning dot on the LEO arc, and an origin glow. Writes the result to `link[rel='icon']` via `canvas.toDataURL()`.

```tsx
useEffect(() => {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 64
  const ctx = canvas.getContext("2d")!
  let raf: number

  function draw(t: number) {
    ctx.clearRect(0, 0, 64, 64)
    // ... draw arcs, scanning dot, glow
    const link = document.querySelector("link[rel='icon']") as HTMLLinkElement
    if (link) link.href = canvas.toDataURL()
    raf = requestAnimationFrame(draw)
  }
  raf = requestAnimationFrame(draw)
  return () => cancelAnimationFrame(raf)
}, [])
```

---

## File structure

```
gryps/
├── app/
│   ├── layout.tsx              # Root layout — fonts, JSON-LD, AnimatedFavicon
│   ├── page.tsx                # Landing — ops-console hero + Signature
│   ├── about/                  # About
│   ├── methodology/            # Assessment methodology (EN/FI)
│   ├── providers/              # Provider catalog
│   ├── signatures/             # Versioned Signature list + [slug]
│   ├── map/                    # Capacity Map (MapLibre)
│   ├── icon.tsx                # Static PNG favicon (32×32) via ImageResponse
│   ├── legal/                  # Terms + Privacy (EN/FI)
│   └── api/                    # advise, contact, signatures, submissions
├── components/
│   ├── OpsConsoleMap.tsx       # Shared MapLibre ops map
│   ├── CapacityMap*.tsx        # Capacity map shell
│   ├── SignaturesMap.tsx       # Signatures map
│   ├── PolarAtmosphere.tsx     # Landing polar geometry
│   ├── GrypsMark.tsx           # Mark / lockup
│   └── Footer.tsx / Header.tsx
└── lib/
    ├── deterministic-score.ts  # Signature engine v0.3
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
codebase has no `/api/advise`-side concept of test vs. real traffic. Exclusion
from Forge's `/products` view is handled entirely on Forge's side, via its own
`TEST_EMAIL_PATTERN` filter (added separately in the forge repo) matching on
the `+test@` convention above. No code change is needed in this repo for that
filtering to work — using the address is the only requirement.

**Flagged, not fixed in this pass:** Forge's `product-users.ts` queries a
`gryps_waitlist` table, but no code in this repository creates or writes to a
table by that name (the only endpoint that ever did, `/api/waitlist`, was
removed — see git history). Whether `gryps_waitlist` still exists in this
product's Neon database is unconfirmed from this repo alone; if it does, it
either predates the current codebase or was created out-of-band. This is a
pre-existing discrepancy between Forge's assumptions and this repo, not
something addressed here.

---

## Environment variables

| Key | Used in | Purpose |
|---|---|---|
| `NEON_DATABASE_URL` | `api/advise/*`, `lib/signatures-db.ts`, `api/notify/verify` | Neon PostgreSQL connection string |
| `MISTRAL_API_KEY` | `lib/scoring.ts` | Optional Mistral recommendation prose |
| `RESEND_API_KEY` | `lib/mail.ts` | Send unlock confirmation emails (magic link) |
| `RESEND_FROM` | `lib/mail.ts` | From address on a **verified** Resend domain, e.g. `GRYPS <hello@gryps.eu>`. Until the domain is verified, Resend only delivers to the account owner (`hqe.moreira@gmail.com`) and rejects addresses like `henrique+test@…`. |
| `NEXT_PUBLIC_APP_URL` | `lib/mail.ts` | Canonical site origin for magic-link URLs (prefer over Vercel preview host) |

Set in: Vercel → gryps project → Settings → Environment Variables  
(or `vercel env add` for each key). Do not commit secrets.

When Resend rejects a send (unverified domain / test-mode recipient), `/api/advise/unlock` still returns `verifyUrl` so the UI can unlock without inbox delivery. After `gryps.eu` (or another domain) is verified at [resend.com/domains](https://resend.com/domains), set `RESEND_FROM` accordingly and test mail will reach `henrique+test@henriquemoreira.eu`.

### Advisor funnel (product)

- Anonymous `/api/advise` returns **abbreviated** result; full `output` JSON stays in `advisor_submissions`.
- Unlock: `POST /api/advise/unlock` → `notify_requests` row + Resend magic link → `GET /api/notify/verify?token=…` sets `verified_at` / `unlocked_at`.
- Soft anonymous budget: client tracks `gryps-anon-runs` for analytics only (no hard CTA block). IP rate limit is generous for prototype testing.
- Non-identifying feedback: `POST /api/advise/feedback` → `advisor_submissions.use_case`.
- Forge should prefer **verified** `notify_requests` (+ contact emails) as identified interest; raw anonymous runs stay Anonymous.

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

Privacy (`/legal/privacy`) and Terms (`/legal/terms`) are the required public
legal pages (footer-linked). Both locales must stay aligned on:

- Plain, short notices — not multi-section commercial T&Cs
- Operator: Henrique Moreira · Espoo, Finland · contact `hqe.moreira@gmail.com`
- Non-commercial research / demonstration prototype — no company, no revenue, no sale
- AI processing disclosed: **Mistral** (+ Vercel hosting) for demonstration Resilience Signature
- No marketing tracking / analytics cookies claimed in Privacy
- Optional email only when the user requests full-assessment unlock / save / updates; confirmation via magic link (Resend). Deletion via `hello@gryps.eu` or Terms contact form
- Point-of-exposure UI: `[AI]` badge remains on Advisor outputs; Terms link is `/legal/terms`

This is product copy/compliance alignment — not legal advice.

Footer copyright: `© {year} GRYPS · All rights reserved` (FI: `Kaikki oikeudet pidätetään`)
via `grypsCopyright()` in `components/Footer.tsx`.

---

## Capacity map (`/map`)

**Modeled Connectivity Intelligence Map** — dominant MapLibre view of
`signature_sites`, coloured by connectivity posture status. Filters: status,
sector, orbit. Site panel shows resilience / confidence / latency / provider
and deep-links to Advisor (`?lat&lng&sector…#advisor`). Not live RF.

| Status | Derived from |
|---|---|
| `ok` | Resilience Signature grade A or B (or score ≥ 70) |
| `degraded` | grade C or D (or score 30–69) |
| `down` | grade F (or score &lt; 30) |
| `unknown` | missing grade and score |

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

Implementation: `lib/capacity-status.ts`, `components/CapacityMap.tsx`,
`components/CapacityMapView.tsx`, `components/OpsConsoleMap.tsx`,
`components/SignaturesMap.tsx`, `app/map/page.tsx` (`force-dynamic`).

---

## Cookies & ePrivacy

**Banner required: No.** No HTTP cookies. Theme preference in localStorage (`gryps-theme`) + cookieless Vercel Analytics. Privacy §09 states no consent banner for Vercel Analytics; theme storage disclosed (no false sessionStorage claim).

| Key | Type | Class |
|---|---|---|
| `gryps-theme` | localStorage | Functional UI preference |
| `gryps-lang` | localStorage | Language preference (EN/FI) |
| `gryps-anon-runs` | localStorage | Soft count of Advisor runs (analytics; not a hard gate) |
| Vercel Analytics (`@vercel/analytics`) | — | Cookieless |

No advertising trackers.