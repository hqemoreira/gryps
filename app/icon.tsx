import { ImageResponse } from "next/og";
import { OrbitalGIconSvg } from "@/components/GrypsMark";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Static Micro Orbital G favicon for first paint / crawlers. */
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
      <OrbitalGIconSvg size={24} />
    </div>,
    { ...size }
  );
}
