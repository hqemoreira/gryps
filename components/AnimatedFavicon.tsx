"use client";
import { useEffect } from "react";
import {
  BAR_GRADIENT,
  BAR_PATH,
  FLASH_REST,
  FLASH_SPREAD,
  G_GRADIENT,
  G_PATH,
  MARK_PALETTE,
  PIERCE,
  SIGNAL,
  SQUARE_VIEWBOX,
  signalDims,
  stripPoints,
  taperPoints,
} from "@/components/GrypsMark";

/** Animated favicon — Orbital G with a light flash travelling to the node. */
export function AnimatedFavicon() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;

    let raf: number;
    let lastUpdate = 0;
    const start = performance.now();
    const UPDATE_INTERVAL = 100; // ms — browsers throttle/ignore favicon updates faster than this
    const CYCLE = 2.4;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // A duplicate static <link rel="icon"> can win over our dynamically updated one.
    document.querySelectorAll<HTMLLinkElement>("link[rel='icon']").forEach((el) => el.remove());
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    document.head.appendChild(link);

    const BG = "#070B12";
    const P = MARK_PALETTE;
    const dims = signalDims("micro");
    const { x1, y1, x2, y2 } = SIGNAL;
    const gPath = new Path2D(G_PATH);
    const barPath = new Path2D(BAR_PATH);
    const core = taperPoints(dims.core[0], dims.core[1]);

    // Map the square crop of the artboard into a 26px box inset 3px in the tile.
    const scale = 26 / SQUARE_VIEWBOX.size;
    const offX = 3 - SQUARE_VIEWBOX.x * scale;
    const offY = 3 - SQUARE_VIEWBOX.y * scale;

    function polygon(pts: [number, number][], fill: string | CanvasGradient) {
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }

    function circle(x: number, y: number, r: number, fill: string | CanvasGradient) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
    }

    function envelope(phase: number, peak: number, base: number, width: number) {
      const d = Math.abs(phase - peak);
      const x = Math.max(0, 1 - Math.min(d, 1 - d) / width);
      return base + (1 - base) * x;
    }

    const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

    function draw(now: number) {
      raf = requestAnimationFrame(draw);
      if (now - lastUpdate < UPDATE_INTERVAL) return;
      lastUpdate = now;

      const phase = reduceMotion ? 0.6 : (((now - start) / 1000) % CYCLE) / CYCLE;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, 32, 32);
      ctx.fillStyle = BG;
      roundRect(ctx, 0, 0, 32, 32, 6);
      ctx.fill();

      ctx.setTransform(scale, 0, 0, scale, offX, offY);

      const gg = G_GRADIENT;
      const gGrad = ctx.createRadialGradient(gg.cx, gg.cy, 0, gg.cx, gg.cy, gg.r);
      gGrad.addColorStop(0, P.gTop);
      gGrad.addColorStop(0.3, P.gHi);
      gGrad.addColorStop(0.45, P.gMid);
      gGrad.addColorStop(0.65, P.gBot);
      gGrad.addColorStop(1, P.gRim);
      ctx.fillStyle = gGrad;
      ctx.fill(gPath);

      // Pierce gap painted in tile colour — the line then sits inside it.
      polygon(stripPoints(PIERCE.above, PIERCE.below), BG);

      const bGrad = ctx.createLinearGradient(BAR_GRADIENT.x1, 0, BAR_GRADIENT.x2, 0);
      bGrad.addColorStop(0, P.barL);
      bGrad.addColorStop(1, P.barR);
      ctx.fillStyle = bGrad;
      ctx.fill(barPath);

      ctx.globalAlpha = reduceMotion ? 1 : envelope(phase, 0.6, 0.8, 0.4);
      const glowGrad = ctx.createLinearGradient(x1, y1, x2, y2);
      glowGrad.addColorStop(0, "rgba(73,149,237,0)");
      glowGrad.addColorStop(0.4, "rgba(73,149,237,0.06)");
      glowGrad.addColorStop(0.69, "rgba(111,194,247,0.4)");
      glowGrad.addColorStop(0.86, "rgba(73,149,237,0.12)");
      glowGrad.addColorStop(1, "rgba(159,226,253,0.25)");
      polygon(taperPoints(dims.glow[0], dims.glow[1]), glowGrad);

      ctx.globalAlpha = 1;
      const lGrad = ctx.createLinearGradient(x1, y1, x2, y2);
      lGrad.addColorStop(0, "rgba(73,149,237,0)");
      lGrad.addColorStop(0.1, "rgba(73,149,237,0.7)");
      lGrad.addColorStop(0.22, P.line);
      lGrad.addColorStop(0.5, P.lineMid);
      lGrad.addColorStop(0.85, P.lineMid);
      lGrad.addColorStop(1, P.lineHead);
      polygon(core, lGrad);

      const centre = reduceMotion ? FLASH_REST : phase < 0.72 ? -0.2 + (1.3 * phase) / 0.72 : 1.1;
      if (centre < 1.1) {
        const fGrad = ctx.createLinearGradient(x1, y1, x2, y2);
        fGrad.addColorStop(clamp01(centre - FLASH_SPREAD.before), "rgba(230,247,255,0)");
        fGrad.addColorStop(clamp01(centre), "rgba(230,247,255,0.95)");
        fGrad.addColorStop(clamp01(centre + FLASH_SPREAD.after), "rgba(230,247,255,0)");
        polygon(core, fGrad);
      }

      ctx.globalAlpha = reduceMotion ? 1 : envelope(phase, 0.76, 0.6, 0.18);
      const hR = dims.node * 1.9;
      const hGrad = ctx.createRadialGradient(x2, y2, 0, x2, y2, hR);
      hGrad.addColorStop(0, "rgba(159,226,253,0.35)");
      hGrad.addColorStop(0.5, "rgba(73,149,237,0.1)");
      hGrad.addColorStop(1, "rgba(73,149,237,0)");
      circle(x2, y2, hR, hGrad);

      ctx.globalAlpha = 1;
      const r = dims.node;
      const nGrad = ctx.createRadialGradient(x2 - 0.16 * r, y2 - 0.4 * r, 0, x2, y2, r * 1.2);
      nGrad.addColorStop(0, P.nodeCore);
      nGrad.addColorStop(0.5, P.nodeMid);
      nGrad.addColorStop(1, P.nodeEdge);
      circle(x2, y2, r, nGrad);

      link.href = canvas.toDataURL("image/png");
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
