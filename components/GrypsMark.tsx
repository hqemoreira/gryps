export function GrypsMark({ size = 36, animate = false }: { size?: number; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 18 A14 14 0 0 1 32 18" stroke="#4FA8FF" strokeWidth="1.5" strokeLinecap="round" fill="none"
        className={animate ? "gryps-arc-geo" : undefined} opacity={animate ? undefined : 0.5} />
      <path d="M8 18 A10 10 0 0 1 28 18" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round" fill="none"
        className={animate ? "gryps-arc-meo" : undefined} opacity={animate ? undefined : 0.75} />
      <path d="M12 18 A6 6 0 0 1 24 18" stroke="#4FA8FF" strokeWidth="1.5" strokeLinecap="round" fill="none"
        className={animate ? "gryps-arc-leo" : undefined} />
      <line x1="18" y1="20" x2="18" y2="10" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 13 L18 9 L21 13" stroke="#6EE7F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="18" cy="21" r="1.5" fill="#4FA8FF"/>
      {animate && (
        <style>{`
          @keyframes gryps-broadcast-leo { 0% { opacity: 1; filter: drop-shadow(0 0 3px #4FA8FF); } 12%, 100% { opacity: 0.2; } }
          @keyframes gryps-broadcast-meo { 0%, 12% { opacity: 0.25; } 16% { opacity: 1; filter: drop-shadow(0 0 3px #6EE7F9); } 28%, 100% { opacity: 0.25; } }
          @keyframes gryps-broadcast-geo { 0%, 28% { opacity: 0.3; } 32% { opacity: 1; filter: drop-shadow(0 0 3px #4FA8FF); } 44%, 100% { opacity: 0.3; } }
          .gryps-arc-leo { animation: gryps-broadcast-leo 2.4s ease-in-out infinite; }
          .gryps-arc-meo { animation: gryps-broadcast-meo 2.4s ease-in-out infinite; }
          .gryps-arc-geo { animation: gryps-broadcast-geo 2.4s ease-in-out infinite; }
        `}</style>
      )}
    </svg>
  )
}

/** Screen-hidden brand lockup for print / Save as PDF (nav is `.gryps-no-print`). */
export function GrypsPrintBrand({
  subtitle = "Connectivity Resilience Advisor",
}: {
  subtitle?: string
}) {
  return (
    <div
      className="gryps-print-brand gryps-print-only"
      style={{
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
        paddingBottom: 14,
        borderBottom: "1px solid var(--border)",
      }}
    >
      <GrypsMark size={32} />
      <div>
        <p style={{
          fontFamily: "var(--font-ui)", fontWeight: 800, fontSize: 18,
          color: "var(--text)", letterSpacing: "0.08em", lineHeight: 1.1, margin: 0,
        }}>
          GRYPS
        </p>
        <p style={{
          fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)",
          letterSpacing: "0.1em", margin: "4px 0 0",
        }}>
          {subtitle}
        </p>
      </div>
    </div>
  )
}
