/** Orbital G brand mark — matches identity artwork: filled G, tapered diagonal, terminus node. */

export type GrypsMarkVariant = "micro" | "core" | "display";

type MarkTone = "screen" | "print";

function resolveVariant(size: number, variant?: GrypsMarkVariant): GrypsMarkVariant {
  if (variant) return variant;
  if (size <= 24) return "micro";
  if (size >= 40) return "display";
  return "core";
}

/** Shared geometry in viewBox 0 0 36 36 — tuned to the Orbital G artwork. */
const CX = 18;
const CY = 18;
const RO = 13.1;
const RI = 8.15;
const GAP = (42 * Math.PI) / 180;

const ox1 = CX + RO * Math.cos(-GAP);
const oy1 = CY + RO * Math.sin(-GAP);
const ox2 = CX + RO * Math.cos(GAP);
const oy2 = CY + RO * Math.sin(GAP);
const ix1 = CX + RI * Math.cos(-GAP);
const iy1 = CY + RI * Math.sin(-GAP);
const ix2 = CX + RI * Math.cos(GAP);
const iy2 = CY + RI * Math.sin(GAP);

/** Annular G body (gap on the right). Sweep 0 = long arc through the left. */
const G_RING = `M${ox1.toFixed(2)} ${oy1.toFixed(2)} A${RO} ${RO} 0 1 0 ${ox2.toFixed(2)} ${oy2.toFixed(2)} L${ix2.toFixed(2)} ${iy2.toFixed(2)} A${RI} ${RI} 0 1 1 ${ix1.toFixed(2)} ${iy1.toFixed(2)} Z`;

/** Crossbar with end cut parallel to the orbital diagonal. */
const G_SPUR = "M15.6 15.55 L25.35 15.55 L27.15 18 L25.35 20.45 L15.6 20.45 Z";

/** Diagonal: tip (BL) → node (TR). */
const DX1 = 4.2;
const DY1 = 31.1;
const DX2 = 30.85;
const DY2 = 6.15;
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
  const a = `${(x1 + px * w1).toFixed(2)} ${(y1 + py * w1).toFixed(2)}`;
  const b = `${(x2 + px * w2).toFixed(2)} ${(y2 + py * w2).toFixed(2)}`;
  const c = `${(x2 - px * w2).toFixed(2)} ${(y2 - py * w2).toFixed(2)}`;
  const d = `${(x1 - px * w1).toFixed(2)} ${(y1 - py * w1).toFixed(2)}`;
  return `${a} ${b} ${c} ${d}`;
}

const DIAG_CORE = taperPolygon(DX1, DY1, DX2, DY2, 0.08, 0.72);
const DIAG_GLOW = taperPolygon(DX1, DY1, DX2, DY2, 0.35, 1.55);
/** Front segment sits over the spur (line passes in front of the G terminal). */
const DIAG_FRONT = taperPolygon(15.2, 20.35, DX2, DY2, 0.45, 0.72);

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
  const gFill = tone === "print" ? "#0B1220" : "currentColor";
  const accent = tone === "print" ? "#0B5FBF" : "var(--accent-blue, #4FA8FF)";
  const accentBright = tone === "print" ? "#0B5FBF" : "var(--accent-cyan, #6EE7F9)";
  const nodeR = variant === "micro" ? NODE_R * 1.12 : NODE_R;
  const glowOp = variant === "micro" ? 0.2 : 0.28;

  return (
    <>
      <defs>
        <radialGradient id={`${uid}-node`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={tone === "print" ? "#3B82F6" : "#E0F7FF"} />
          <stop offset="55%" stopColor={accentBright} />
          <stop offset="100%" stopColor={accent} />
        </radialGradient>
      </defs>

      {/* 1 — full diagonal behind (tip → node), soft glow + core */}
      <polygon
        points={DIAG_GLOW}
        fill={accent}
        opacity={glowOp}
        className={animate ? "gryps-signal-glow" : undefined}
      />
      <polygon
        points={DIAG_CORE}
        fill={accentBright}
        className={animate ? "gryps-signal-line" : undefined}
        opacity={animate ? undefined : 0.95}
      />

      {/* 2 — G ring covers the left stem so the line reads as passing behind */}
      <path d={G_RING} fill={gFill} fillRule="nonzero" />
      <path d={G_SPUR} fill={gFill} />

      {/* 3 — front diagonal over the spur + terminus node */}
      <polygon
        points={DIAG_FRONT}
        fill={accentBright}
        className={animate ? "gryps-signal-line" : undefined}
        opacity={animate ? undefined : 0.95}
      />
      <circle
        cx={DX2}
        cy={DY2}
        r={nodeR * 2.1}
        fill={accent}
        opacity={glowOp + 0.08}
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
            0% { opacity: 0.35; }
            45% { opacity: 1; }
            70% { opacity: 1; }
            100% { opacity: 0.55; }
          }
          @keyframes gryps-signal-node {
            0%, 50% { opacity: 0.5; }
            72% { opacity: 1; filter: drop-shadow(0 0 3.5px ${tone === "print" ? "#0B5FBF" : "#4FA8FF"}); }
            100% { opacity: 0.7; }
          }
          @keyframes gryps-signal-node-glow {
            0%, 50% { opacity: 0.12; }
            72% { opacity: 0.4; }
            100% { opacity: 0.18; }
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
            .gryps-signal-node-glow { opacity: ${glowOp + 0.08} !important; }
          }
        `}</style>
      )}
    </>
  );
}

/** On-screen brand mark (nav / footer / CTA). */
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
  // Deterministic id — avoid SSR/client counter drift; sizes differ per surface.
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
      style={{ color: "var(--text)", display: "block", flexShrink: 0 }}
    >
      <OrbitalGPaths variant={v} tone="screen" animate={animate} uid={uid} />
    </svg>
  );
}

/** Print/PDF mark — darker fills so the logo stays visible on white paper. */
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

/**
 * Company-document letterhead for Save as PDF / print.
 * Hidden on screen; in-flow top-left brand on the first printed page.
 */
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

/** Static Orbital G for ImageResponse / OG (no CSS variables). */
export function OrbitalGIconSvg({
  size = 24,
  gColor = "#F7FAFC",
  accent = "#4FA8FF",
  node = "#6EE7F9",
}: {
  size?: number;
  gColor?: string;
  accent?: string;
  node?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <polygon points={DIAG_GLOW} fill={accent} opacity="0.25" />
      <polygon points={DIAG_CORE} fill={node} />
      <path d={G_RING} fill={gColor} />
      <path d={G_SPUR} fill={gColor} />
      <polygon points={DIAG_FRONT} fill={node} />
      <circle cx={DX2} cy={DY2} r={NODE_R * 2} fill={accent} opacity="0.3" />
      <circle cx={DX2} cy={DY2} r={NODE_R} fill={node} />
    </svg>
  );
}
