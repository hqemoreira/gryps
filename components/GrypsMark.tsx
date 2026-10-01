/** Orbital G brand mark — geometric G + diagonal signal + terminus node. */

export type GrypsMarkVariant = "micro" | "core" | "display";

type MarkTone = "screen" | "print";

function resolveVariant(size: number, variant?: GrypsMarkVariant): GrypsMarkVariant {
  if (variant) return variant;
  if (size <= 24) return "micro";
  if (size >= 40) return "display";
  return "core";
}

function strokeFor(variant: GrypsMarkVariant, tone: MarkTone) {
  if (tone === "print") {
    return variant === "micro" ? 5.25 : 4.75;
  }
  if (variant === "micro") return 5.5;
  if (variant === "display") return 4.25;
  return 4.75;
}

function nodeRadius(variant: GrypsMarkVariant) {
  if (variant === "micro") return 2.35;
  if (variant === "display") return 2.1;
  return 2.2;
}

/** Shared Orbital G geometry (viewBox 0 0 36 36). */
function OrbitalGPaths({
  variant,
  tone,
  animate,
}: {
  variant: GrypsMarkVariant;
  tone: MarkTone;
  animate: boolean;
}) {
  const gStroke = strokeFor(variant, tone);
  const nodeR = nodeRadius(variant);
  const diagonalW = variant === "micro" ? 1.85 : 1.55;

  // Screen: G follows text; diagonal + node use brand accents (light-theme secondary).
  // Print: dark G + darker blue accents for white paper.
  const gColor = tone === "print" ? "#0B1220" : "currentColor";
  const accent = tone === "print" ? "#0B5FBF" : "var(--accent-blue, #4FA8FF)";
  const accentBright = tone === "print" ? "#0B5FBF" : "var(--accent-cyan, #6EE7F9)";

  return (
    <>
      {variant === "display" && (
        <circle
          cx="18"
          cy="18"
          r="15.25"
          stroke={accent}
          strokeWidth="0.75"
          fill="none"
          opacity="0.22"
        />
      )}

      {/* Thick incomplete G — open on the right with mid spur */}
      <path
        d="M25.2 9.6 A11.2 11.2 0 1 0 25.2 26.4"
        stroke={gColor}
        strokeWidth={gStroke}
        strokeLinecap="round"
        fill="none"
      />
      <line
        x1="17.2"
        y1="18"
        x2="26.4"
        y2="18"
        stroke={gColor}
        strokeWidth={gStroke * 0.92}
        strokeLinecap="round"
      />

      {/* Signature diagonal — signal path */}
      <line
        x1="7.5"
        y1="28.5"
        x2="28.2"
        y2="7.8"
        stroke={accent}
        strokeWidth={diagonalW}
        strokeLinecap="round"
        className={animate ? "gryps-signal-line" : undefined}
        opacity={animate ? undefined : 0.95}
      />

      {/* Terminus node */}
      <circle
        cx="28.2"
        cy="7.8"
        r={nodeR}
        fill={accentBright}
        className={animate ? "gryps-signal-node" : undefined}
      />

      {animate && (
        <style>{`
          @keyframes gryps-signal-travel {
            0% { stroke-dashoffset: 36; opacity: 0.35; }
            55% { opacity: 1; }
            72% { stroke-dashoffset: 0; opacity: 1; }
            100% { stroke-dashoffset: 0; opacity: 0.55; }
          }
          @keyframes gryps-signal-node {
            0%, 55% { opacity: 0.45; }
            72% { opacity: 1; filter: drop-shadow(0 0 3px ${tone === "print" ? "#0B5FBF" : "#4FA8FF"}); }
            100% { opacity: 0.65; }
          }
          .gryps-signal-line {
            stroke-dasharray: 10 28;
            animation: gryps-signal-travel 2.4s ease-in-out infinite;
          }
          .gryps-signal-node {
            animation: gryps-signal-node 2.4s ease-in-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .gryps-signal-line,
            .gryps-signal-node {
              animation: none !important;
              opacity: 1 !important;
              stroke-dasharray: none !important;
              filter: none !important;
            }
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
      <OrbitalGPaths variant={v} tone="screen" animate={animate} />
    </svg>
  );
}

/** Print/PDF mark — darker strokes so the logo stays visible on white paper. */
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
      <OrbitalGPaths variant="core" tone="print" animate={false} />
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

/** Inline SVG markup for ImageResponse / OG (no CSS variables). */
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
  const scale = size / 36;
  const gStroke = 5.2;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <path
        d="M25.2 9.6 A11.2 11.2 0 1 0 25.2 26.4"
        stroke={gColor}
        strokeWidth={gStroke}
        strokeLinecap="round"
        fill="none"
      />
      <line
        x1="17.2"
        y1="18"
        x2="26.4"
        y2="18"
        stroke={gColor}
        strokeWidth={gStroke * 0.92}
        strokeLinecap="round"
      />
      <line
        x1="7.5"
        y1="28.5"
        x2="28.2"
        y2="7.8"
        stroke={accent}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <circle cx="28.2" cy="7.8" r={2.25 * (scale > 0.7 ? 1 : 1.05)} fill={node} />
    </svg>
  );
}
