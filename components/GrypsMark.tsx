/** Orbital G — soft pastel G (subtle) + bright tapered signal line + flare node. */

export type GrypsMarkVariant = "micro" | "core" | "display";

type MarkTone = "screen" | "print";

function resolveVariant(size: number, variant?: GrypsMarkVariant): GrypsMarkVariant {
  if (variant) return variant;
  if (size <= 24) return "micro";
  if (size >= 40) return "display";
  return "core";
}

/**
 * Artwork palette — G is intentionally softer than the signal line
 * (pastel periwinkle, reduced contrast) so the dynamic line reads first.
 */
const ART = {
  gTop: "#C5DFFF",
  gMid: "#A8D0FF",
  gBot: "#8BB8F0",
  gOpacity: 0.82,
  line: "#70CFFF",
  lineDeep: "#4FB8FF",
  nodeCore: "#F2FBFF",
  printG: "#0B1220",
  printLine: "#0B5FBF",
} as const;

/** Diagonal tip (BL) → node (TR). */
const DX1 = 3.9;
const DY1 = 31.4;
const DX2 = 31.1;
const DY2 = 5.85;
const NODE_R = 2.05;

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

const DIAG_CORE = taperPolygon(DX1, DY1, DX2, DY2, 0.05, 0.62);
const DIAG_GLOW = taperPolygon(DX1, DY1, DX2, DY2, 0.45, 1.85);
const DIAG_FRONT = taperPolygon(14.8, 20.6, DX2, DY2, 0.38, 0.62);

/** Soft geometric G — annular body, clean horizontal spur, mild tip cut. */
const G_RING =
  "M28.15 10.35 A13.1 13.1 0 1 0 28.35 23.05 L23.05 21.45 A8.5 8.5 0 1 1 22.85 10.85 Z";

const G_SPUR = "M21.7 15.9 L26.7 15.9 L27.45 18.3 L26.7 20.7 L21.7 20.7 L18.0 18.3 Z";

/** Subtle pierce through lower-left stem. */
const PIERCE_SLOT = taperPolygon(8.6, 26.35, 13.35, 21.95, 0.85, 0.85);

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
  const nodeR = variant === "micro" ? NODE_R * 1.12 : NODE_R;
  const glowOp = variant === "micro" ? 0.28 : 0.4;

  return (
    <>
      <defs>
        <linearGradient id={`${uid}-g`} x1="18" y1="6" x2="18" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={gTop} />
          <stop offset="45%" stopColor={gMid} />
          <stop offset="100%" stopColor={gBot} />
        </linearGradient>
        <radialGradient id={`${uid}-node`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor={nodeCore} />
          <stop offset="45%" stopColor={line} />
          <stop offset="100%" stopColor={lineDeep} />
        </radialGradient>
        {/* Soft bloom on G — keeps letter subtle vs the signal line */}
        <filter id={`${uid}-gsoft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={variant === "micro" ? 0.35 : 0.55} result="blur" />
          <feFlood floodColor={isPrint ? ART.printG : "#A8D0FF"} floodOpacity={isPrint ? 0 : 0.35} result="glowColor" />
          <feComposite in="glowColor" in2="blur" operator="in" result="softGlow" />
          <feMerge>
            <feMergeNode in="softGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <mask id={`${uid}-pierce`} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect width="36" height="36" fill="white" />
          <polygon points={PIERCE_SLOT} fill="black" />
        </mask>
      </defs>

      {/* Soft pedestal circle behind mark */}
      {variant !== "micro" && !isPrint && (
        <circle cx="18" cy="18" r="16.5" fill="#0B1220" opacity="0.55" />
      )}

      {/* Diagonal behind */}
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
        opacity={animate ? undefined : 0.95}
      />

      {/* Subtle G */}
      <g
        mask={`url(#${uid}-pierce)`}
        filter={isPrint ? undefined : `url(#${uid}-gsoft)`}
        opacity={isPrint ? 1 : undefined}
        style={isPrint ? undefined : { opacity: `var(--mark-g-opacity, ${ART.gOpacity})` }}
      >
        <path d={G_RING} fill={isPrint ? ART.printG : `url(#${uid}-g)`} />
        <path d={G_SPUR} fill={isPrint ? ART.printG : `url(#${uid}-g)`} />
      </g>

      {/* Front diagonal + flare node */}
      <polygon
        points={DIAG_FRONT}
        fill={line}
        className={animate ? "gryps-signal-line" : undefined}
        opacity={animate ? undefined : 0.95}
      />
      <circle
        cx={DX2}
        cy={DY2}
        r={nodeR * 3.2}
        fill={line}
        opacity={0.18}
        className={animate ? "gryps-signal-node-glow" : undefined}
      />
      <circle
        cx={DX2}
        cy={DY2}
        r={nodeR * 2.1}
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
            72% { opacity: 1; filter: drop-shadow(0 0 5px ${isPrint ? ART.printLine : "#70CFFF"}); }
            100% { opacity: 0.75; }
          }
          @keyframes gryps-signal-node-glow {
            0%, 48% { opacity: 0.12; }
            72% { opacity: 0.45; }
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

/** Static Orbital G for ImageResponse / OG. */
export function OrbitalGIconSvg({ size = 24 }: { size?: number }) {
  const uid = `og-icon-${Math.round(size)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id={`${uid}-g`} x1="18" y1="6" x2="18" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={ART.gTop} />
          <stop offset="45%" stopColor={ART.gMid} />
          <stop offset="100%" stopColor={ART.gBot} />
        </linearGradient>
        <radialGradient id={`${uid}-node`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor={ART.nodeCore} />
          <stop offset="45%" stopColor={ART.line} />
          <stop offset="100%" stopColor={ART.lineDeep} />
        </radialGradient>
        <filter id={`${uid}-gsoft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.45" result="blur" />
          <feFlood floodColor="#A8D0FF" floodOpacity="0.35" result="glowColor" />
          <feComposite in="glowColor" in2="blur" operator="in" result="softGlow" />
          <feMerge>
            <feMergeNode in="softGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <mask id={`${uid}-pierce`} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect width="36" height="36" fill="white" />
          <polygon points={PIERCE_SLOT} fill="black" />
        </mask>
      </defs>
      <circle cx="18" cy="18" r="16.5" fill="#0B1220" opacity="0.55" />
      <polygon points={DIAG_GLOW} fill={ART.lineDeep} opacity="0.35" />
      <polygon points={DIAG_CORE} fill={ART.line} />
      <g mask={`url(#${uid}-pierce)`} filter={`url(#${uid}-gsoft)`} opacity={ART.gOpacity}>
        <path d={G_RING} fill={`url(#${uid}-g)`} />
        <path d={G_SPUR} fill={`url(#${uid}-g)`} />
      </g>
      <polygon points={DIAG_FRONT} fill={ART.line} />
      <circle cx={DX2} cy={DY2} r={NODE_R * 3} fill={ART.line} opacity="0.18" />
      <circle cx={DX2} cy={DY2} r={NODE_R * 2.1} fill={ART.lineDeep} opacity="0.35" />
      <circle cx={DX2} cy={DY2} r={NODE_R} fill={`url(#${uid}-node)`} />
    </svg>
  );
}
