/**
 * Rasterize the Orbital G mark to favicon / apple-touch / Vercel avatar PNGs.
 * Uses the same geometry + palette as components/GrypsMark.tsx (gradient mark).
 */
import sharp from "sharp";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const CX = 19.5;
const CY = 15;
const RO = 11;
const RI = 8.3;
const f = (n) => n.toFixed(2);
const polar = (r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
};
const rel = (x, y) => [CX + x, CY + y];
const pt = ([x, y]) => `${f(x)} ${f(y)}`;

const OUTER_TOP = polar(RO, -41.5);
const INNER_TOP = polar(RI, -46);
const BAR_TIP = polar(RO, -3);
const BAR_TOP_IN = rel(6.3, -0.2);
const BAR_TOP_LEFT = rel(4.8, 0.2);
const BAR_BOTTOM = 1.85;
const BAR_LOW_LEFT = rel(5.35, BAR_BOTTOM);
const BAR_JOIN = rel(Math.sqrt(RI * RI - BAR_BOTTOM * BAR_BOTTOM), BAR_BOTTOM);
const BAR_OUTER_LOW = polar(RO, (Math.asin(BAR_BOTTOM / RO) * 180) / Math.PI);

const G_PATH = [
  `M${pt(OUTER_TOP)}`,
  `A${RO} ${RO} 0 1 0 ${pt(BAR_TIP)}`,
  `L${pt(BAR_TOP_IN)}`,
  `L${pt(BAR_TOP_LEFT)}`,
  `L${pt(BAR_LOW_LEFT)}`,
  `L${pt(BAR_JOIN)}`,
  `A${RI} ${RI} 0 1 1 ${pt(INNER_TOP)}`,
  "Z",
].join(" ");

const BAR_PATH = [
  `M${pt(BAR_TIP)}`,
  `L${pt(BAR_TOP_IN)}`,
  `L${pt(BAR_TOP_LEFT)}`,
  `L${pt(BAR_LOW_LEFT)}`,
  `L${pt(BAR_OUTER_LOW)}`,
  "Z",
].join(" ");

const TWIST_PATH = (() => {
  const steps = 14;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const s = -0.15 + (1.3 * i) / steps;
    pts.push(pt(polar(RO - (RO - RI) * s, 241.5 - 35.5 * s)));
  }
  return `M${pts.join(" L")}`;
})();

const SIGNAL = (() => {
  const x2 = CX + 14.23;
  const y2 = CY - 6.6;
  const x1 = CX - 19;
  const y1 = y2 + (x2 - x1) * 0.565;
  return { x1, y1, x2, y2 };
})();

const SIGNAL_KNEE = 0.55;
function signalFrame() {
  const { x1, y1, x2, y2 } = SIGNAL;
  const len = Math.hypot(x2 - x1, y2 - y1);
  return { x1, y1, dx: x2 - x1, dy: y2 - y1, px: -(y2 - y1) / len, py: (x2 - x1) / len };
}
function taperPoints(tail, body) {
  const { x1, y1, dx, dy, px, py } = signalFrame();
  const at = (t, w) => [x1 + dx * t + px * w, y1 + dy * t + py * w];
  return [at(0, tail), at(SIGNAL_KNEE, body), at(1, body), at(1, -body), at(SIGNAL_KNEE, -body), at(0, -tail)];
}
function stripPoints(above, below) {
  const { x1, y1, dx, dy, px, py } = signalFrame();
  const a = (t, w) => [x1 + dx * t + px * w, y1 + dy * t + py * w];
  return [a(0.28, above), a(0.72, above), a(0.72, -below), a(0.28, -below)];
}
const toPoints = (pts) => pts.map(([x, y]) => `${f(x)},${f(y)}`).join(" ");

const P = {
  gTop: "#FFFFFF",
  gHi: "#E4EEFA",
  gMid: "#B3D1F8",
  gBot: "#5A9FFD",
  gRim: "#6CAAFD",
  barL: "#D6E9FF",
  barR: "#98C5FC",
  line: "#4995ED",
  lineMid: "#6FC2F7",
  lineHead: "#9FE2FD",
  nodeCore: "#E0F6FC",
  nodeMid: "#8FDCFD",
  nodeEdge: "#74C0FB",
};

const BG = "#070B12";
const vb = { x: 5, y: -1, size: 32 };
const { x1, y1, x2, y2 } = SIGNAL;
const core = toPoints(taperPoints(0.55, 0.95));
const glow = toPoints(taperPoints(1.1, 1.85));
const pierce = toPoints(stripPoints(0.8, 1.15));

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.x} ${vb.y} ${vb.size} ${vb.size}" width="512" height="512">
  <defs>
    <radialGradient id="g" cx="${CX - 4.5}" cy="${CY - 9.1}" r="20" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${P.gTop}"/>
      <stop offset="0.3" stop-color="${P.gHi}"/>
      <stop offset="0.45" stop-color="${P.gMid}"/>
      <stop offset="0.65" stop-color="${P.gBot}"/>
      <stop offset="1" stop-color="${P.gRim}"/>
    </radialGradient>
    <linearGradient id="b" x1="${CX + 4.8}" y1="0" x2="${CX + RO}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${P.barL}"/>
      <stop offset="1" stop-color="${P.barR}"/>
    </linearGradient>
    <linearGradient id="l" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${P.line}" stop-opacity="0"/>
      <stop offset="0.1" stop-color="${P.line}" stop-opacity="0.7"/>
      <stop offset="0.22" stop-color="${P.line}"/>
      <stop offset="0.5" stop-color="${P.lineMid}"/>
      <stop offset="0.85" stop-color="${P.lineMid}"/>
      <stop offset="1" stop-color="${P.lineHead}"/>
    </linearGradient>
    <linearGradient id="lg" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${P.line}" stop-opacity="0"/>
      <stop offset="0.4" stop-color="${P.line}" stop-opacity="0.06"/>
      <stop offset="0.69" stop-color="${P.lineMid}" stop-opacity="0.4"/>
      <stop offset="0.86" stop-color="${P.line}" stop-opacity="0.12"/>
      <stop offset="1" stop-color="${P.lineHead}" stop-opacity="0.25"/>
    </linearGradient>
    <radialGradient id="n" cx="0.42" cy="0.3" r="0.75">
      <stop offset="0" stop-color="${P.nodeCore}"/>
      <stop offset="0.5" stop-color="${P.nodeMid}"/>
      <stop offset="1" stop-color="${P.nodeEdge}"/>
    </radialGradient>
    <radialGradient id="h">
      <stop offset="0" stop-color="${P.lineHead}" stop-opacity="0.35"/>
      <stop offset="0.5" stop-color="${P.line}" stop-opacity="0.1"/>
      <stop offset="1" stop-color="${P.line}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="${vb.x}" y="${vb.y}" width="${vb.size}" height="${vb.size}" rx="7" fill="${BG}"/>
  <path d="${G_PATH}" fill="url(#g)"/>
  <polygon points="${pierce}" fill="${BG}"/>
  <path d="${TWIST_PATH}" stroke="${BG}" stroke-width="0.75" fill="none"/>
  <path d="${BAR_PATH}" fill="url(#b)"/>
  <polygon points="${glow}" fill="url(#lg)"/>
  <polygon points="${core}" fill="url(#l)"/>
  <circle cx="${x2}" cy="${y2}" r="3.8" fill="url(#h)"/>
  <circle cx="${x2}" cy="${y2}" r="2" fill="url(#n)"/>
</svg>`;

writeFileSync(join(root, "public/gryps-mark.svg"), svg);

async function writePng(rel, size) {
  const buf = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  writeFileSync(join(root, rel), buf);
  console.log("wrote", rel, buf.length);
}

await writePng("app/icon.png", 32);
await writePng("app/apple-icon.png", 180);
await writePng("public/gryps-avatar.png", 512);
console.log("done");
