/** Mannaz-in-ring — Mimir system mark (favicon → FAB → empty state). */

type Props = {
  size?: number;
  className?: string;
  title?: string;
};

export function MimirMark({ size = 20, className, title }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <circle cx="16" cy="16" r="13.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11 9.5 V22.5 M21 9.5 V22.5 M11 9.5 L21 22.5 M21 9.5 L11 22.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
