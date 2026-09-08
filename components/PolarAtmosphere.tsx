/** Decorative polar-projection diagram — latitude rings + orbital ellipses + site marker. */
export function PolarAtmosphere({
  latLabel = "68.2°N 27.4°E",
  ringLabel = "70°N",
  className,
}: {
  latLabel?: string
  ringLabel?: string
  className?: string
}) {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 440 440" width="100%" height="100%" fill="none">
        <defs>
          <linearGradient id="grypsAuroraStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--aurora-1)" }} />
            <stop offset="100%" style={{ stopColor: "var(--aurora-2)" }} />
          </linearGradient>
          <radialGradient id="grypsMarkerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: "var(--aurora-1)", stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: "var(--aurora-1)", stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        <circle cx="220" cy="220" r="60" stroke="var(--border)" strokeWidth="1" />
        <circle cx="220" cy="220" r="115" stroke="var(--border)" strokeWidth="1" />
        <circle cx="220" cy="220" r="170" stroke="var(--border)" strokeWidth="1" />
        <circle
          cx="220"
          cy="220"
          r="115"
          stroke="url(#grypsAuroraStroke)"
          strokeWidth="1.4"
          strokeDasharray="3 6"
        />

        <ellipse
          cx="220"
          cy="220"
          rx="205"
          ry="95"
          stroke="url(#grypsAuroraStroke)"
          strokeWidth="1.1"
          strokeDasharray="1 7"
          transform="rotate(-22 220 220)"
        />
        <ellipse
          cx="220"
          cy="220"
          rx="205"
          ry="95"
          stroke="var(--border2)"
          strokeWidth="1"
          strokeDasharray="1 7"
          transform="rotate(34 220 220)"
        />

        <line x1="220" y1="30" x2="220" y2="410" stroke="var(--border)" strokeWidth="1" />
        <line x1="30" y1="220" x2="410" y2="220" stroke="var(--border)" strokeWidth="1" />

        <circle cx="164" cy="152" r="16" fill="url(#grypsMarkerGlow)" />
        <circle cx="164" cy="152" r="3.5" fill="var(--aurora-1)" />

        <text
          x="236"
          y="118"
          fill="var(--text-dim)"
          fontFamily="var(--font-data)"
          fontSize="11"
        >
          {latLabel}
        </text>
        <text
          x="36"
          y="214"
          fill="var(--text-dim)"
          fontFamily="var(--font-data)"
          fontSize="11"
        >
          {ringLabel}
        </text>
      </svg>
    </div>
  )
}
