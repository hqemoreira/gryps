/**
 * Orbital G — geometric G whose aperture opens toward a tapered signal line.
 * The line pierces the lower-left of the bowl, exits through the opening and
 * ends in a terminus node. Geometry lives in a 42×30 artboard.
 */

export type GrypsMarkVariant = "micro" | "core" | "display";

type MarkTone = "screen" | "print";

function resolveVariant(size: number, variant?: GrypsMarkVariant): GrypsMarkVariant {
  if (variant) return variant;
  if (size <= 24) return "micro";
  if (size >= 40) return "display";
  return "core";
}

const ARTBOARD_W = 42;
const ARTBOARD_H = 30;
/** Square crop used by favicons / app icons. */
export const SQUARE_VIEWBOX = { x: 3, y: -2, size: 34 } as const;

const CX = 17;
const CY = 15.5;
const RO = 11;
const RI = 7.5;
const BAR_TOP = 15.3;
const BAR_LEFT = 23.8;
const BAR_TIP_X = 29.3;

const f = (n: number) => n.toFixed(2);

function polar(r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

const [outerTopX, outerTopY] = polar(RO, -33);
const [innerTopX, innerTopY] = polar(RI, -43);
const [outerLowX, outerLowY] = polar(RO, 12);
const barJoinY = CY + Math.sqrt(RI * RI - (BAR_LEFT - CX) ** 2);

/** Bowl with slanted top terminal and a crossbar that ends in a forward point. */
export const G_PATH = [
  `M${f(outerTopX)} ${f(outerTopY)}`,
  `A${RO} ${RO} 0 1 0 ${f(outerLowX)} ${f(outerLowY)}`,
  `L${BAR_TIP_X} ${BAR_TOP}`,
  `L${BAR_LEFT} ${BAR_TOP}`,
  `L${BAR_LEFT} ${f(barJoinY)}`,
  `A${RI} ${RI} 0 1 1 ${f(innerTopX)} ${f(innerTopY)}`,
  "Z",
].join(" ");

/** Signal line: fine tip (lower-left) → terminus node (upper-right), ~29°. */
export const SIGNAL = (() => {
  const x2 = 33.8;
  const y2 = 6.5;
  const x1 = 1.2;
  const y1 = y2 + (x2 - x1) * 0.553;
  return { x1, y1, x2, y2 };
})();

export function taperPoints(w1: number, w2: number): [number, number][] {
  const { x1, y1, x2, y2 } = SIGNAL;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const px = -(y2 - y1) / len;
  const py = (x2 - x1) / len;
  return [
    [x1 + px * w1, y1 + py * w1],
    [x2 + px * w2, y2 + py * w2],
    [x2 - px * w2, y2 - py * w2],
    [x1 - px * w1, y1 - py * w1],
  ];
}

const toPoints = (pts: [number, number][]) => pts.map(([x, y]) => `${f(x)},${f(y)}`).join(" ");

export function signalDims(variant: GrypsMarkVariant) {
  if (variant === "micro") return { core: [0.06, 0.45], glow: [0.05, 1.2], node: 1.45 } as const;
  if (variant === "display") return { core: [0.03, 0.3], glow: [0.04, 0.95], node: 1.15 } as const;
  return { core: [0.04, 0.34], glow: [0.04, 1.0], node: 1.25 } as const;
}

/** Gap cut into the bowl where the line crosses it. */
export const PIERCE_HALF_WIDTH = 0.95;

export const MARK_PALETTE = {
  gTop: "#F2F7FF",
  gMid: "#CFE1FF",
  gBot: "#8FB9F7",
  line: "#3B8BFF",
  lineHead: "#8FD3FF",
  nodeCore: "#FFFFFF",
  nodeMid: "#A8DCFF",
  print: "#0B1220",
  printLine: "#0B5FBF",
} as const;

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
  const gTop = isPrint ? p.print : `var(--mark-g-top, ${p.gTop})`;
  const gMid = isPrint ? p.print : `var(--mark-g-mid, ${p.gMid})`;
  const gBot = isPrint ? p.print : `var(--mark-g-bot, ${p.gBot})`;
  const line = isPrint ? p.printLine : `var(--mark-line, ${p.line})`;
  const lineHead = isPrint ? p.printLine : `var(--mark-line-head, ${p.lineHead})`;
  const nodeCore = isPrint ? p.printLine : `var(--mark-node-core, ${p.nodeCore})`;
  const dims = signalDims(variant);
  const { x1, y1, x2, y2 } = SIGNAL;

  return (
    <>
      <defs>
        <linearGradient id={`${uid}-g`} x1="8" y1="4" x2="26" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: gTop }} />
          <stop offset="0.5" style={{ stopColor: gMid }} />
          <stop offset="1" style={{ stopColor: gBot }} />
        </linearGradient>
        <linearGradient id={`${uid}-l`} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: line, stopOpacity: 0 }} />
          <stop offset="0.35" style={{ stopColor: line, stopOpacity: 0.95 }} />
          <stop offset="1" style={{ stopColor: lineHead, stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id={`${uid}-lg`} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: line, stopOpacity: 0 }} />
          <stop offset="0.55" style={{ stopColor: line, stopOpacity: 0.12 }} />
          <stop offset="1" style={{ stopColor: lineHead, stopOpacity: 0.5 }} />
        </linearGradient>
        <radialGradient id={`${uid}-n`} cx="0.4" cy="0.4" r="0.6">
          <stop offset="0" style={{ stopColor: nodeCore }} />
          <stop offset="0.5" style={{ stopColor: lineHead }} />
          <stop offset="1" style={{ stopColor: line }} />
        </radialGradient>
        <radialGradient id={`${uid}-h`}>
          <stop offset="0" style={{ stopColor: lineHead, stopOpacity: 0.6 }} />
          <stop offset="0.45" style={{ stopColor: line, stopOpacity: 0.22 }} />
          <stop offset="1" style={{ stopColor: line, stopOpacity: 0 }} />
        </radialGradient>
        <mask id={`${uid}-m`} maskUnits="userSpaceOnUse" x="-4" y="-4" width="50" height="40">
          <rect x="-4" y="-4" width="50" height="40" fill="white" />
          <polygon points={toPoints(taperPoints(PIERCE_HALF_WIDTH, PIERCE_HALF_WIDTH))} fill="black" />
        </mask>
      </defs>

      <path d={G_PATH} fill={`url(#${uid}-g)`} mask={`url(#${uid}-m)`} />

      {!isPrint && (
        <polygon
          points={toPoints(taperPoints(dims.glow[0], dims.glow[1]))}
          fill={`url(#${uid}-lg)`}
          className={animate ? "gryps-signal-glow" : undefined}
        />
      )}
      <polygon
        points={toPoints(taperPoints(dims.core[0], dims.core[1]))}
        fill={`url(#${uid}-l)`}
        className={animate ? "gryps-signal-line" : undefined}
      />

      {!isPrint && (
        <circle cx={x2} cy={y2} r={dims.node * 3.2} fill={`url(#${uid}-h)`} className={animate ? "gryps-signal-halo" : undefined} />
      )}
      <circle cx={x2} cy={y2} r={dims.node} fill={`url(#${uid}-n)`} className={animate ? "gryps-signal-node" : undefined} />

      {animate && (
        <circle r={dims.node * 0.62} fill="#E6F6FF" opacity="0" className="gryps-signal-packet">
          <animateMotion path={`M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)}`} dur="2.4s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.72;1" calcMode="linear" />
          <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.2;0.68;0.74" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}

      {animate && (
        <style>{`
          @keyframes gryps-signal-line { 0% { opacity: 0.78; } 50%, 72% { opacity: 1; } 100% { opacity: 0.78; } }
          @keyframes gryps-signal-node { 0%, 55% { opacity: 0.8; } 72% { opacity: 1; } 100% { opacity: 0.8; } }
          @keyframes gryps-signal-halo { 0%, 55% { opacity: 0.55; } 74% { opacity: 1; } 100% { opacity: 0.55; } }
          .gryps-signal-line, .gryps-signal-glow { animation: gryps-signal-line 2.4s ease-in-out infinite; }
          .gryps-signal-node { animation: gryps-signal-node 2.4s ease-in-out infinite; }
          .gryps-signal-halo { animation: gryps-signal-halo 2.4s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            .gryps-signal-line, .gryps-signal-glow, .gryps-signal-node, .gryps-signal-halo { animation: none !important; }
            .gryps-signal-packet { display: none; }
          }
        `}</style>
      )}
    </>
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
  return (
    <svg width={size} height={size} viewBox={`${vb.x} ${vb.y} ${vb.size} ${vb.size}`} fill="none">
      <defs>
        <linearGradient id={`${uid}-g`} x1="8" y1="4" x2="26" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.gTop} />
          <stop offset="0.5" stopColor={p.gMid} />
          <stop offset="1" stopColor={p.gBot} />
        </linearGradient>
        <linearGradient id={`${uid}-l`} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.line} stopOpacity="0" />
          <stop offset="0.35" stopColor={p.line} stopOpacity="0.95" />
          <stop offset="1" stopColor={p.lineHead} />
        </linearGradient>
        <linearGradient id={`${uid}-lg`} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.line} stopOpacity="0" />
          <stop offset="0.55" stopColor={p.line} stopOpacity="0.12" />
          <stop offset="1" stopColor={p.lineHead} stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id={`${uid}-n`} cx="0.4" cy="0.4" r="0.6">
          <stop offset="0" stopColor={p.nodeCore} />
          <stop offset="0.5" stopColor={p.lineHead} />
          <stop offset="1" stopColor={p.line} />
        </radialGradient>
        <radialGradient id={`${uid}-h`}>
          <stop offset="0" stopColor={p.lineHead} stopOpacity="0.6" />
          <stop offset="0.45" stopColor={p.line} stopOpacity="0.22" />
          <stop offset="1" stopColor={p.line} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={G_PATH} fill={`url(#${uid}-g)`} />
      <polygon points={toPoints(taperPoints(PIERCE_HALF_WIDTH, PIERCE_HALF_WIDTH))} fill={bg} />
      <polygon points={toPoints(taperPoints(dims.glow[0], dims.glow[1]))} fill={`url(#${uid}-lg)`} />
      <polygon points={toPoints(taperPoints(dims.core[0], dims.core[1]))} fill={`url(#${uid}-l)`} />
      <circle cx={x2} cy={y2} r={dims.node * 3.2} fill={`url(#${uid}-h)`} />
      <circle cx={x2} cy={y2} r={dims.node} fill={`url(#${uid}-n)`} />
    </svg>
  );
}
