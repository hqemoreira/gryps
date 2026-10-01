/**
 * Orbital G — geometric G whose aperture opens toward a tapered signal line.
 * The line pierces the lower-left of the bowl, exits through the opening and
 * ends in a terminus node. Geometry lives in a 38×30 artboard.
 */

export type GrypsMarkVariant = "micro" | "core" | "display";

type MarkTone = "screen" | "print";

function resolveVariant(size: number, variant?: GrypsMarkVariant): GrypsMarkVariant {
  if (variant) return variant;
  if (size <= 24) return "micro";
  if (size >= 40) return "display";
  return "core";
}

const ARTBOARD_W = 38;
const ARTBOARD_H = 30;
/** Square crop used by favicons / app icons. */
export const SQUARE_VIEWBOX = { x: 5, y: -1, size: 32 } as const;

const CX = 19.5;
const CY = 15;
const RO = 11;
const RI = 8.3;

const f = (n: number) => n.toFixed(2);

function polar(r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

const rel = (x: number, y: number): [number, number] => [CX + x, CY + y];

const OUTER_TOP = polar(RO, -41.5);
const INNER_TOP = polar(RI, -46);
const BAR_TIP = polar(RO, -3);
const BAR_TOP_IN = rel(6.3, -0.2);
const BAR_TOP_LEFT = rel(4.8, 0.2);
const BAR_BOTTOM = 1.85;
const BAR_LOW_LEFT = rel(5.35, BAR_BOTTOM);
const BAR_JOIN = rel(Math.sqrt(RI * RI - BAR_BOTTOM * BAR_BOTTOM), BAR_BOTTOM);
const BAR_OUTER_LOW = polar(RO, (Math.asin(BAR_BOTTOM / RO) * 180) / Math.PI);

const pt = ([x, y]: [number, number]) => `${f(x)} ${f(y)}`;

/** Ring + crossbar: terminal cut parallel to the signal, bar bevelled toward the bowl. */
export const G_PATH = [
  `M${pt(OUTER_TOP)}`,
  `A${RO} ${RO} 0 1 0 ${pt(BAR_TIP)}`,
  `L${pt(BAR_TOP_IN)}`,
  `L${pt(BAR_TOP_LEFT)}`,
  `L${pt(BAR_LOW_LEFT)}`,
  `L${pt(BAR_JOIN)}`,
  `A${RI} ${RI} 0 1 1 ${pt(INNER_TOP)}`,
  "Z",
].join(" ");

/** Crossbar slab drawn over the ring in its own lighter gradient. */
export const BAR_PATH = [
  `M${pt(BAR_TIP)}`,
  `L${pt(BAR_TOP_IN)}`,
  `L${pt(BAR_TOP_LEFT)}`,
  `L${pt(BAR_LOW_LEFT)}`,
  `L${pt(BAR_OUTER_LOW)}`,
  "Z",
].join(" ");

/** Ring shading: highlight at the upper-left, saturated blue in the lower bowl. */
export const G_GRADIENT = { cx: CX - 4.5, cy: CY - 9.1, r: 20 } as const;
export const BAR_GRADIENT = { x1: CX + 4.8, x2: CX + RO } as const;

/** Signal line: fine tip (lower-left) → terminus node (upper-right), ~29.5°. */
export const SIGNAL = (() => {
  const x2 = CX + 14.23;
  const y2 = CY - 6.6;
  const x1 = CX - 19;
  const y1 = y2 + (x2 - x1) * 0.565;
  return { x1, y1, x2, y2 };
})();

const SIGNAL_KNEE = 0.55;

function signalFrame() {
  const { x1, y1, x2, y2 } = SIGNAL;
  const len = Math.hypot(x2 - x1, y2 - y1);
  return { x1, y1, dx: x2 - x1, dy: y2 - y1, px: -(y2 - y1) / len, py: (x2 - x1) / len };
}

/** Line silhouette: `tail` half-width at the tip, widening to `body` by the knee. */
export function taperPoints(tail: number, body: number): [number, number][] {
  const { x1, y1, dx, dy, px, py } = signalFrame();
  const at = (t: number, w: number): [number, number] => [x1 + dx * t + px * w, y1 + dy * t + py * w];
  return [
    at(0, tail),
    at(SIGNAL_KNEE, body),
    at(1, body),
    at(1, -body),
    at(SIGNAL_KNEE, -body),
    at(0, -tail),
  ];
}

/** Full-length band offset `above` / `below` the signal axis. */
export function stripPoints(above: number, below: number): [number, number][] {
  const { x1, y1, dx, dy, px, py } = signalFrame();
  return [
    [x1 - px * above, y1 - py * above],
    [x1 + dx - px * above, y1 + dy - py * above],
    [x1 + dx + px * below, y1 + dy + py * below],
    [x1 + px * below, y1 + py * below],
  ];
}

/** Gap cut into the bowl where the line crosses it (wider on the lower side). */
export const PIERCE = { above: 0.8, below: 1.15 } as const;

export function signalDims(variant: GrypsMarkVariant) {
  if (variant === "micro") return { core: [0.06, 0.48], glow: [0.1, 0.75], node: 1.5 } as const;
  if (variant === "display") return { core: [0.02, 0.37], glow: [0.04, 0.6], node: 1.3 } as const;
  return { core: [0.03, 0.4], glow: [0.05, 0.65], node: 1.35 } as const;
}

/** Resting position of the white flash along the line (0 = tip, 1 = node). */
export const FLASH_REST = 0.69;
export const FLASH_SPREAD = { before: 0.16, after: 0.12 } as const;

export const MARK_PALETTE = {
  gTop: "#FFFFFF",
  gHi: "#E4EEFA",
  gMid: "#B3D1F8",
  gBot: "#5A9FFD",
  gRim: "#6CAAFD",
  barL: "#D6E9FF",
  barR: "#98C5FC",
  line: "#4995ED",
  lineMid: "#6FC2F7",
  lineHead: "#9FE2FD",
  flash: "#E6F7FF",
  nodeCore: "#E0F6FC",
  nodeMid: "#8FDCFD",
  nodeEdge: "#74C0FB",
  print: "#0B1220",
  printLine: "#0B5FBF",
} as const;

const toPoints = (pts: [number, number][]) => pts.map(([x, y]) => `${f(x)},${f(y)}`).join(" ");

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Flash travels tip → node over the first 72% of the cycle, then rests off-line. */
function flashOffsets(shift: number) {
  const centres = [-0.2, 1.1, 1.1];
  return centres.map((c) => f(clamp01(c + shift))).join(";");
}

function OrbitalG({
  variant,
  tone,
  animate,
  uid,
}: {
  variant: GrypsMarkVariant;
  tone: MarkTone;
  animate: boolean;
  uid: string;
}) {
  const p = MARK_PALETTE;
  const isPrint = tone === "print";
  const v = (name: string, fallback: string) => (isPrint ? p.print : `var(--mark-${name}, ${fallback})`);
  const lv = (name: string, fallback: string) => (isPrint ? p.printLine : `var(--mark-${name}, ${fallback})`);
  const line = lv("line", p.line);
  const lineMid = lv("line-mid", p.lineMid);
  const lineHead = lv("line-head", p.lineHead);
  const flash = lv("flash", p.flash);
  const dims = signalDims(variant);
  const { x1, y1, x2, y2 } = SIGNAL;
  const gg = G_GRADIENT;
  const bg = BAR_GRADIENT;
  const fr = FLASH_REST;
  const fs = FLASH_SPREAD;

  return (
    <>
      <defs>
        <radialGradient id={`${uid}-g`} cx={gg.cx} cy={gg.cy} r={gg.r} gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: v("g-top", p.gTop) }} />
          <stop offset="0.3" style={{ stopColor: v("g-hi", p.gHi) }} />
          <stop offset="0.45" style={{ stopColor: v("g-mid", p.gMid) }} />
          <stop offset="0.65" style={{ stopColor: v("g-bot", p.gBot) }} />
          <stop offset="1" style={{ stopColor: v("g-rim", p.gRim) }} />
        </radialGradient>
        <linearGradient id={`${uid}-b`} x1={bg.x1} y1="0" x2={bg.x2} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: v("bar-l", p.barL) }} />
          <stop offset="1" style={{ stopColor: v("bar-r", p.barR) }} />
        </linearGradient>
        <linearGradient id={`${uid}-l`} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: line, stopOpacity: 0 }} />
          <stop offset="0.1" style={{ stopColor: line, stopOpacity: 0.7 }} />
          <stop offset="0.22" style={{ stopColor: line, stopOpacity: 1 }} />
          <stop offset="0.5" style={{ stopColor: lineMid }} />
          <stop offset="0.85" style={{ stopColor: lineMid }} />
          <stop offset="1" style={{ stopColor: lineHead }} />
        </linearGradient>
        <linearGradient id={`${uid}-lg`} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: line, stopOpacity: 0 }} />
          <stop offset="0.4" style={{ stopColor: line, stopOpacity: 0.08 }} />
          <stop offset="0.69" style={{ stopColor: lineMid, stopOpacity: 0.75 }} />
          <stop offset="0.86" style={{ stopColor: line, stopOpacity: 0.2 }} />
          <stop offset="1" style={{ stopColor: lineHead, stopOpacity: 0.4 }} />
        </linearGradient>
        <linearGradient id={`${uid}-f`} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
          <stop offset={fr - fs.before} style={{ stopColor: flash, stopOpacity: 0 }} />
          <stop offset={fr} style={{ stopColor: flash, stopOpacity: 0.95 }} />
          <stop offset={fr + fs.after} style={{ stopColor: flash, stopOpacity: 0 }} />
        </linearGradient>
        {animate && (
          <linearGradient id={`${uid}-fa`} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: flash, stopOpacity: 0 }}>
              <FlashAnim shift={-fs.before} />
            </stop>
            <stop offset="0" style={{ stopColor: flash, stopOpacity: 0.95 }}>
              <FlashAnim shift={0} />
            </stop>
            <stop offset="0" style={{ stopColor: flash, stopOpacity: 0 }}>
              <FlashAnim shift={fs.after} />
            </stop>
          </linearGradient>
        )}
        <radialGradient id={`${uid}-n`} cx="0.42" cy="0.3" r="0.75">
          <stop offset="0" style={{ stopColor: lv("node-core", p.nodeCore) }} />
          <stop offset="0.5" style={{ stopColor: lv("node-mid", p.nodeMid) }} />
          <stop offset="1" style={{ stopColor: lv("node-edge", p.nodeEdge) }} />
        </radialGradient>
        <radialGradient id={`${uid}-h`}>
          <stop offset="0" style={{ stopColor: lineHead, stopOpacity: 0.35 }} />
          <stop offset="0.5" style={{ stopColor: line, stopOpacity: 0.1 }} />
          <stop offset="1" style={{ stopColor: line, stopOpacity: 0 }} />
        </radialGradient>
        <filter id={`${uid}-bl`} x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
        <mask id={`${uid}-m`} maskUnits="userSpaceOnUse" x="-4" y="-4" width="46" height="40">
          <rect x="-4" y="-4" width="46" height="40" fill="white" />
          <polygon points={toPoints(stripPoints(PIERCE.above, PIERCE.below))} fill="black" />
        </mask>
      </defs>

      <path d={G_PATH} fill={`url(#${uid}-g)`} mask={`url(#${uid}-m)`} />
      <path d={BAR_PATH} fill={`url(#${uid}-b)`} />

      {!isPrint && (
        <polygon
          points={toPoints(taperPoints(dims.glow[0], dims.glow[1]))}
          fill={`url(#${uid}-lg)`}
          filter={`url(#${uid}-bl)`}
          className={animate ? "gryps-signal-glow" : undefined}
        />
      )}
      <polygon points={toPoints(taperPoints(dims.core[0], dims.core[1]))} fill={`url(#${uid}-l)`} />
      {!isPrint && (
        <polygon
          points={toPoints(taperPoints(dims.core[0], dims.core[1]))}
          fill={`url(#${uid}-f)`}
          className={animate ? "gryps-signal-flash-rest" : undefined}
        />
      )}
      {animate && (
        <polygon
          points={toPoints(taperPoints(dims.core[0], dims.core[1]))}
          fill={`url(#${uid}-fa)`}
          className="gryps-signal-flash"
        />
      )}

      {!isPrint && (
        <circle cx={x2} cy={y2} r={dims.node * 1.9} fill={`url(#${uid}-h)`} className={animate ? "gryps-signal-halo" : undefined} />
      )}
      <circle cx={x2} cy={y2} r={dims.node} fill={`url(#${uid}-n)`} className={animate ? "gryps-signal-node" : undefined} />

      {animate && (
        <style>{`
          @keyframes gryps-signal-glow { 0% { opacity: 0.8; } 50%, 72% { opacity: 1; } 100% { opacity: 0.8; } }
          @keyframes gryps-signal-node { 0%, 60% { opacity: 0.85; } 74% { opacity: 1; } 100% { opacity: 0.85; } }
          @keyframes gryps-signal-halo { 0%, 60% { opacity: 0.6; } 76% { opacity: 1; } 100% { opacity: 0.6; } }
          .gryps-signal-glow { animation: gryps-signal-glow 2.4s ease-in-out infinite; }
          .gryps-signal-node { animation: gryps-signal-node 2.4s ease-in-out infinite; }
          .gryps-signal-halo { animation: gryps-signal-halo 2.4s ease-in-out infinite; }
          .gryps-signal-flash-rest { display: none; }
          @media (prefers-reduced-motion: reduce) {
            .gryps-signal-glow, .gryps-signal-node, .gryps-signal-halo { animation: none !important; }
            .gryps-signal-flash { display: none; }
            .gryps-signal-flash-rest { display: inline; }
          }
        `}</style>
      )}
    </>
  );
}

function FlashAnim({ shift }: { shift: number }) {
  return (
    <animate
      attributeName="offset"
      values={flashOffsets(shift)}
      keyTimes="0;0.72;1"
      dur="2.4s"
      repeatCount="indefinite"
      calcMode="linear"
    />
  );
}

/** On-screen brand mark (nav / footer / CTA). `size` is the mark height. */
export function GrypsMark({
  size = 36,
  animate = false,
  variant,
}: {
  size?: number;
  animate?: boolean;
  variant?: GrypsMarkVariant;
}) {
  const v = resolveVariant(size, variant);
  const uid = `og-${v}-${Math.round(size)}-${animate ? "a" : "s"}`;
  return (
    <svg
      width={Math.round((size * ARTBOARD_W) / ARTBOARD_H)}
      height={size}
      viewBox={`0 0 ${ARTBOARD_W} ${ARTBOARD_H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="gryps-mark"
      style={{ display: "block", flexShrink: 0, overflow: "visible" }}
    >
      <OrbitalG variant={v} tone="screen" animate={animate} uid={uid} />
    </svg>
  );
}

function GrypsMarkPrint({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={Math.round((size * ARTBOARD_W) / ARTBOARD_H)}
      height={size}
      viewBox={`0 0 ${ARTBOARD_W} ${ARTBOARD_H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <OrbitalG variant="core" tone="print" animate={false} uid="og-print" />
    </svg>
  );
}

/**
 * Company-document letterhead for Save as PDF / print.
 * Hidden on screen; in-flow top-left brand on the first printed page.
 */
export function GrypsPrintBrand({ subtitle = "Connectivity Intelligence" }: { subtitle?: string }) {
  return (
    <div className="gryps-print-letterhead" aria-hidden="true">
      <GrypsMarkPrint size={24} />
      <div className="gryps-print-letterhead-text">
        <span className="gryps-print-letterhead-wordmark">GRYPS</span>
        <span className="gryps-print-letterhead-sub">{subtitle}</span>
      </div>
    </div>
  );
}

/**
 * Static square mark for ImageResponse (favicon, apple icon, OG).
 * The pierce gap is painted in `bg` rather than masked, for renderer safety.
 */
export function OrbitalGIconSvg({ size = 24, bg = "#070B12" }: { size?: number; bg?: string }) {
  const p = MARK_PALETTE;
  const dims = signalDims(size <= 40 ? "micro" : "core");
  const { x1, y1, x2, y2 } = SIGNAL;
  const uid = `og-icon-${Math.round(size)}`;
  const vb = SQUARE_VIEWBOX;
  const gg = G_GRADIENT;
  const bgr = BAR_GRADIENT;
  const fr = FLASH_REST;
  const fs = FLASH_SPREAD;
  const core = toPoints(taperPoints(dims.core[0], dims.core[1]));
  return (
    <svg width={size} height={size} viewBox={`${vb.x} ${vb.y} ${vb.size} ${vb.size}`} fill="none">
      <defs>
        <radialGradient id={`${uid}-g`} cx={gg.cx} cy={gg.cy} r={gg.r} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.gTop} />
          <stop offset="0.3" stopColor={p.gHi} />
          <stop offset="0.45" stopColor={p.gMid} />
          <stop offset="0.65" stopColor={p.gBot} />
          <stop offset="1" stopColor={p.gRim} />
        </radialGradient>
        <linearGradient id={`${uid}-b`} x1={bgr.x1} y1="0" x2={bgr.x2} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.barL} />
          <stop offset="1" stopColor={p.barR} />
        </linearGradient>
        <linearGradient id={`${uid}-l`} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.line} stopOpacity="0" />
          <stop offset="0.1" stopColor={p.line} stopOpacity="0.7" />
          <stop offset="0.22" stopColor={p.line} />
          <stop offset="0.5" stopColor={p.lineMid} />
          <stop offset="0.85" stopColor={p.lineMid} />
          <stop offset="1" stopColor={p.lineHead} />
        </linearGradient>
        <linearGradient id={`${uid}-lg`} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.line} stopOpacity="0" />
          <stop offset="0.4" stopColor={p.line} stopOpacity="0.06" />
          <stop offset="0.69" stopColor={p.lineMid} stopOpacity="0.4" />
          <stop offset="0.86" stopColor={p.line} stopOpacity="0.12" />
          <stop offset="1" stopColor={p.lineHead} stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id={`${uid}-f`} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
          <stop offset={fr - fs.before} stopColor={p.flash} stopOpacity="0" />
          <stop offset={fr} stopColor={p.flash} stopOpacity="0.95" />
          <stop offset={fr + fs.after} stopColor={p.flash} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${uid}-n`} cx="0.42" cy="0.3" r="0.75">
          <stop offset="0" stopColor={p.nodeCore} />
          <stop offset="0.5" stopColor={p.nodeMid} />
          <stop offset="1" stopColor={p.nodeEdge} />
        </radialGradient>
        <radialGradient id={`${uid}-h`}>
          <stop offset="0" stopColor={p.lineHead} stopOpacity="0.35" />
          <stop offset="0.5" stopColor={p.line} stopOpacity="0.1" />
          <stop offset="1" stopColor={p.line} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={G_PATH} fill={`url(#${uid}-g)`} />
      <polygon points={toPoints(stripPoints(PIERCE.above, PIERCE.below))} fill={bg} />
      <path d={BAR_PATH} fill={`url(#${uid}-b)`} />
      <polygon points={toPoints(taperPoints(dims.glow[0], dims.glow[1]))} fill={`url(#${uid}-lg)`} />
      <polygon points={core} fill={`url(#${uid}-l)`} />
      <polygon points={core} fill={`url(#${uid}-f)`} />
      <circle cx={x2} cy={y2} r={dims.node * 1.9} fill={`url(#${uid}-h)`} />
      <circle cx={x2} cy={y2} r={dims.node} fill={`url(#${uid}-n)`} />
    </svg>
  );
}
