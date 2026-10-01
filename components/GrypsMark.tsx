/** Orbital G — identity artwork: gradient typographic G, pierce-cut, tapered signal + node. */

export type GrypsMarkVariant = "micro" | "core" | "display";

type MarkTone = "screen" | "print";

function resolveVariant(size: number, variant?: GrypsMarkVariant): GrypsMarkVariant {
  if (variant) return variant;
  if (size <= 24) return "micro";
  if (size >= 40) return "display";
  return "core";
}

/** Artwork palette (dark presentation). Light theme via --mark-* from ThemeContext. */
const ART = {
  gTop: "#E6F2FF",
  gMid: "#B8D9FF",
  gBot: "#7BB5FF",
  line: "#99DFFF",
  lineDeep: "#5BB8FF",
  nodeCore: "#E8F7FF",
  printG: "#0B1220",
  printLine: "#0B5FBF",
} as const;

/** Diagonal tip (BL) → node (TR). */
const DX1 = 3.9;
const DY1 = 31.4;
const DX2 = 31.1;
const DY2 = 5.85;
const NODE_R = 1.95;

function taperPolygon(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  w1: number,
  w2: number
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  return [
    `${(x1 + px * w1).toFixed(2)} ${(y1 + py * w1).toFixed(2)}`,
    `${(x2 + px * w2).toFixed(2)} ${(y2 + py * w2).toFixed(2)}`,
    `${(x2 - px * w2).toFixed(2)} ${(y2 - py * w2).toFixed(2)}`,
    `${(x1 - px * w1).toFixed(2)} ${(y1 - py * w1).toFixed(2)}`,
  ].join(" ");
}

const DIAG_CORE = taperPolygon(DX1, DY1, DX2, DY2, 0.06, 0.68);
const DIAG_GLOW = taperPolygon(DX1, DY1, DX2, DY2, 0.4, 1.65);
const DIAG_FRONT = taperPolygon(14.8, 20.6, DX2, DY2, 0.42, 0.68);

/**
 * Annular G — opening on the right.
 * Top terminals joined by a slight inward-sloping cut (artwork).
 */
const G_RING =
  "M28.2 10.2 A13.25 13.25 0 1 0 28.4 23.2 L22.95 21.6 A8.35 8.35 0 1 1 22.7 10.65 Z";

/**
 * Inward spur with downward-faceted tip (classic G bar into the bowl).
 */
const G_SPUR = "M21.6 15.75 L26.85 15.75 L27.7 18.35 L26.85 20.95 L21.6 20.95 L17.55 18.35 Z";

/** Pierce slot through lower-left stem — line passes through the letter. */
const PIERCE_SLOT = taperPolygon(8.55, 26.4, 13.4, 21.95, 0.92, 0.92);

function OrbitalGPaths({
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
  const isPrint = tone === "print";
  const gTop = isPrint ? ART.printG : `var(--mark-g-top, ${ART.gTop})`;
  const gMid = isPrint ? ART.printG : `var(--mark-g-mid, ${ART.gMid})`;
  const gBot = isPrint ? ART.printG : `var(--mark-g-bot, ${ART.gBot})`;
  const line = isPrint ? ART.printLine : `var(--mark-line, ${ART.line})`;
  const lineDeep = isPrint ? ART.printLine : `var(--mark-line-deep, ${ART.lineDeep})`;
  const nodeCore = isPrint ? "#3B82F6" : `var(--mark-node-core, ${ART.nodeCore})`;
  const nodeR = variant === "micro" ? NODE_R * 1.15 : NODE_R;
  const glowOp = variant === "micro" ? 0.22 : 0.32;

  return (
    <>
      <defs>
        <linearGradient id={`${uid}-g`} x1="18" y1="5" x2="18" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={gTop} />
          <stop offset="50%" stopColor={gMid} />
          <stop offset="100%" stopColor={gBot} />
        </linearGradient>
        <radialGradient id={`${uid}-node`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor={nodeCore} />
          <stop offset="55%" stopColor={line} />
          <stop offset="100%" stopColor={lineDeep} />
        </radialGradient>
        <mask id={`${uid}-pierce`} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect width="36" height="36" fill="white" />
          <polygon points={PIERCE_SLOT} fill="black" />
        </mask>
      </defs>

      {variant !== "micro" && !isPrint && (
        <circle cx="18" cy="18" r="16.2" fill={lineDeep} opacity="0.07" />
      )}

      <polygon
        points={DIAG_GLOW}
        fill={lineDeep}
        opacity={glowOp}
        className={animate ? "gryps-signal-glow" : undefined}
      />
      <polygon
        points={DIAG_CORE}
        fill={line}
        className={animate ? "gryps-signal-line" : undefined}
        opacity={animate ? undefined : 0.98}
      />

      <g mask={`url(#${uid}-pierce)`}>
        <path d={G_RING} fill={isPrint ? ART.printG : `url(#${uid}-g)`} />
        <path d={G_SPUR} fill={isPrint ? ART.printG : `url(#${uid}-g)`} />
      </g>

      <polygon
        points={DIAG_FRONT}
        fill={line}
        className={animate ? "gryps-signal-line" : undefined}
        opacity={animate ? undefined : 0.98}
      />
      <circle
        cx={DX2}
        cy={DY2}
        r={nodeR * 2.35}
        fill={lineDeep}
        opacity={glowOp}
        className={animate ? "gryps-signal-node-glow" : undefined}
      />
      <circle
        cx={DX2}
        cy={DY2}
        r={nodeR}
        fill={`url(#${uid}-node)`}
        className={animate ? "gryps-signal-node" : undefined}
      />

      {animate && (
        <style>{`
          @keyframes gryps-signal-travel {
            0% { opacity: 0.4; }
            48% { opacity: 1; }
            72% { opacity: 1; }
            100% { opacity: 0.55; }
          }
          @keyframes gryps-signal-node {
            0%, 48% { opacity: 0.55; }
            72% { opacity: 1; filter: drop-shadow(0 0 4px ${isPrint ? ART.printLine : "#99DFFF"}); }
            100% { opacity: 0.75; }
          }
          @keyframes gryps-signal-node-glow {
            0%, 48% { opacity: 0.14; }
            72% { opacity: 0.42; }
            100% { opacity: 0.2; }
          }
          .gryps-signal-line,
          .gryps-signal-glow {
            animation: gryps-signal-travel 2.4s ease-in-out infinite;
          }
          .gryps-signal-node {
            animation: gryps-signal-node 2.4s ease-in-out infinite;
          }
          .gryps-signal-node-glow {
            animation: gryps-signal-node-glow 2.4s ease-in-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .gryps-signal-line,
            .gryps-signal-glow,
            .gryps-signal-node,
            .gryps-signal-node-glow {
              animation: none !important;
              opacity: 1 !important;
              filter: none !important;
            }
            .gryps-signal-glow { opacity: ${glowOp} !important; }
            .gryps-signal-node-glow { opacity: ${glowOp} !important; }
          }
        `}</style>
      )}
    </>
  );
}

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
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="gryps-mark"
      style={{ display: "block", flexShrink: 0 }}
    >
      <OrbitalGPaths variant={v} tone="screen" animate={animate} uid={uid} />
    </svg>
  );
}

function GrypsMarkPrint({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <OrbitalGPaths variant="core" tone="print" animate={false} uid="og-print" />
    </svg>
  );
}

export function GrypsPrintBrand({ subtitle = "Connectivity Intelligence" }: { subtitle?: string }) {
  return (
    <div className="gryps-print-letterhead" aria-hidden="true">
      <GrypsMarkPrint size={28} />
      <div className="gryps-print-letterhead-text">
        <span className="gryps-print-letterhead-wordmark">GRYPS</span>
        <span className="gryps-print-letterhead-sub">{subtitle}</span>
      </div>
    </div>
  );
}

/** Static Orbital G for ImageResponse / OG — artwork colours. */
export function OrbitalGIconSvg({ size = 24 }: { size?: number }) {
  const uid = `og-icon-${Math.round(size)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id={`${uid}-g`} x1="18" y1="5" x2="18" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={ART.gTop} />
          <stop offset="50%" stopColor={ART.gMid} />
          <stop offset="100%" stopColor={ART.gBot} />
        </linearGradient>
        <radialGradient id={`${uid}-node`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor={ART.nodeCore} />
          <stop offset="55%" stopColor={ART.line} />
          <stop offset="100%" stopColor={ART.lineDeep} />
        </radialGradient>
        <mask id={`${uid}-pierce`} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect width="36" height="36" fill="white" />
          <polygon points={PIERCE_SLOT} fill="black" />
        </mask>
      </defs>
      <polygon points={DIAG_GLOW} fill={ART.lineDeep} opacity="0.3" />
      <polygon points={DIAG_CORE} fill={ART.line} />
      <g mask={`url(#${uid}-pierce)`}>
        <path d={G_RING} fill={`url(#${uid}-g)`} />
        <path d={G_SPUR} fill={`url(#${uid}-g)`} />
      </g>
      <polygon points={DIAG_FRONT} fill={ART.line} />
      <circle cx={DX2} cy={DY2} r={NODE_R * 2.2} fill={ART.lineDeep} opacity="0.3" />
      <circle cx={DX2} cy={DY2} r={NODE_R} fill={`url(#${uid}-node)`} />
    </svg>
  );
}
