import { ImageResponse } from "next/og";
import { OrbitalGIconSvg } from "@/components/GrypsMark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — Orbital G on dark rounded tile. */
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
      <OrbitalGIconSvg size={128} />
    </div>,
    { ...size }
  );
}
