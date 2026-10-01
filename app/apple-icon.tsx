import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — Orbital G on dark rounded tile (identity board app icon). */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        background: "#070B12",
        borderRadius: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="128" height="128" viewBox="0 0 36 36" fill="none">
        <path
          d="M25.2 9.6 A11.2 11.2 0 1 0 25.2 26.4"
          stroke="#F7FAFC"
          strokeWidth="5.25"
          strokeLinecap="round"
          fill="none"
        />
        <line
          x1="17.2"
          y1="18"
          x2="26.4"
          y2="18"
          stroke="#F7FAFC"
          strokeWidth="4.85"
          strokeLinecap="round"
        />
        <line
          x1="7.5"
          y1="28.5"
          x2="28.2"
          y2="7.8"
          stroke="#4FA8FF"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="28.2" cy="7.8" r="2.25" fill="#6EE7F9" />
      </svg>
    </div>,
    { ...size }
  );
}
