import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        background: "#070B12",
        borderRadius: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* GEO arc */}
        <path
          d="M2 12 A10 10 0 0 1 22 12"
          stroke="#4FA8FF"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
        />
        {/* MEO arc */}
        <path
          d="M5 12 A7 7 0 0 1 19 12"
          stroke="#6EE7F9"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        {/* LEO arc */}
        <path
          d="M8 12 A4 4 0 0 1 16 12"
          stroke="#4FA8FF"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
        {/* North stem */}
        <line
          x1="12"
          y1="13.5"
          x2="12"
          y2="7"
          stroke="#6EE7F9"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {/* North arrow */}
        <path
          d="M10 9.5 L12 6.5 L14 9.5"
          stroke="#6EE7F9"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Origin */}
        <circle cx="12" cy="14.5" r="1.2" fill="#4FA8FF" />
      </svg>
    </div>,
    { ...size }
  );
}
