# GRYPS — Codebook

> Satellite connectivity intelligence platform for Nordic/Arctic industrial operators.
> Stack: Next.js 16 App Router · TypeScript · CSS custom properties · Neon (PostgreSQL) · Resend · Vercel

---

## Stack decisions

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 App Router | Server components + API routes in one repo |
| Styling | CSS custom properties (no Tailwind) | Theme switching via `document.documentElement.style.setProperty` — zero runtime overhead |
| Fonts | `next/font/google` — Space Grotesk + JetBrains Mono | Eliminates render-blocking Google Fonts import |
| Database | Neon serverless PostgreSQL (EU Frankfurt) | EU data residency for Nordic operators |
| Email | Resend | Transactional notifications, lazy instantiation avoids build-time key errors |
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
    tag: "Satellite connectivity intelligence",
    h1: ["Know which satellite", "network to deploy.", "Before you deploy."],
    tiers: [
      { name: "Report", price: "€550", unit: "per analysis", ... },
      ...
    ],
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
<PricingTiers t={t} />
```

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

## Waitlist API route (Neon + Resend)

```ts
// app/api/waitlist/route.ts
export async function POST(req: NextRequest) {
  const { email, vertical } = await req.json()

  // Neon — idempotent upsert
  const sql = neon(process.env.DATABASE_URL!)
  await sql`
    CREATE TABLE IF NOT EXISTS gryps_waitlist (
      id SERIAL PRIMARY KEY, email TEXT NOT NULL,
      vertical TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    INSERT INTO gryps_waitlist (email, vertical)
    VALUES (${email}, ${vertical})
    ON CONFLICT DO NOTHING
  `

  // Resend — lazy instantiation (avoids build-time key error)
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({ from: "GRYPS <noreply@henriquemoreira.eu>", to: "hqe.moreira@gmail.com", ... })

  // Always return ok — submission saved even if email fails
  return NextResponse.json({ ok: true, warnings: errors })
}
```

---

## Scroll anchor behind fixed header

Fixed header is 72px tall. Without `scrollMarginTop`, clicking a nav link scrolls the target element to the top of the viewport, hiding it behind the header.

```tsx
<div id="waitlist" style={{ scrollMarginTop: 72 }}>
```

---

## EU AI Act Article 50 — AI badge

Inline `[AI]` badge on every AI-generated rationale. Non-intrusive: 8px, dimmed colour, `cursor:help`, tooltip with the full Article 50 disclosure.

```tsx
<span
  title="EU AI Act Art. 50 — AI-generated analytical summary. Not a guarantee of network availability."
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
│   ├── page.tsx                # Entire landing page — all components in one file
│   ├── icon.tsx                # Static PNG favicon (32×32) via ImageResponse
│   ├── api/
│   │   └── waitlist/route.ts   # POST — Neon insert + Resend notification
│   └── legal/
│       ├── layout.tsx          # Shared legal nav + footer
│       ├── terms/page.tsx      # T&C — 10 sections, EN/FI
│       └── privacy/page.tsx    # Privacy Policy — 11 sections, EN/FI
└── components/
    └── AnimatedFavicon.tsx     # Canvas RAF favicon
```

---

## Environment variables

| Key | Used in | Purpose |
|---|---|---|
| `DATABASE_URL` | `api/waitlist/route.ts` | Neon PostgreSQL connection string |
| `RESEND_API_KEY` | `api/waitlist/route.ts` | Resend transactional email |

Set in: Vercel → gryps project → Settings → Environment Variables
