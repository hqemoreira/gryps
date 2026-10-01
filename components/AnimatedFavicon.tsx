"use client";
import { useEffect } from "react";
import {
  G_PATH,
  MARK_PALETTE,
  PIERCE_HALF_WIDTH,
  SIGNAL,
  SQUARE_VIEWBOX,
  signalDims,
  taperPoints,
} from "@/components/GrypsMark";

/** Animated favicon — Orbital G with a signal packet travelling to the node. */
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

    // Map the square crop of the artboard into a 24px box inset 4px in the tile.
    const scale = 24 / SQUARE_VIEWBOX.size;
    const offX = 4 - SQUARE_VIEWBOX.x * scale;
    const offY = 4 - SQUARE_VIEWBOX.y * scale;

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

    function draw(now: number) {
      raf = requestAnimationFrame(draw);
      if (now - lastUpdate < UPDATE_INTERVAL) return;
      lastUpdate = now;

      const phase = reduceMotion ? 0.72 : (((now - start) / 1000) % CYCLE) / CYCLE;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, 32, 32);
      ctx.fillStyle = BG;
      roundRect(ctx, 0, 0, 32, 32, 6);
      ctx.fill();

      ctx.setTransform(scale, 0, 0, scale, offX, offY);

      const gGrad = ctx.createLinearGradient(8, 4, 26, 27);
      gGrad.addColorStop(0, P.gTop);
      gGrad.addColorStop(0.5, P.gMid);
      gGrad.addColorStop(1, P.gBot);
      ctx.fillStyle = gGrad;
      ctx.fill(gPath);

      // Pierce gap painted in tile colour — the line then sits inside it.
      polygon(taperPoints(PIERCE_HALF_WIDTH, PIERCE_HALF_WIDTH), BG);

      const lineOp = reduceMotion ? 1 : envelope(phase, 0.6, 0.78, 0.4);
      const glowGrad = ctx.createLinearGradient(x1, y1, x2, y2);
      glowGrad.addColorStop(0, "rgba(59,139,255,0)");
      glowGrad.addColorStop(0.55, "rgba(59,139,255,0.12)");
      glowGrad.addColorStop(1, "rgba(143,211,255,0.5)");
      ctx.globalAlpha = lineOp;
      polygon(taperPoints(dims.glow[0], dims.glow[1]), glowGrad);

      const lGrad = ctx.createLinearGradient(x1, y1, x2, y2);
      lGrad.addColorStop(0, "rgba(59,139,255,0)");
      lGrad.addColorStop(0.35, P.line);
      lGrad.addColorStop(1, P.lineHead);
      ctx.globalAlpha = lineOp;
      polygon(taperPoints(dims.core[0], dims.core[1]), lGrad);

      if (!reduceMotion && phase < 0.72) {
        const u = phase / 0.72;
        ctx.globalAlpha = Math.min(1, u * 5) * 0.95;
        circle(x1 + (x2 - x1) * u, y1 + (y2 - y1) * u, dims.node * 0.62, "#E6F6FF");
      }

      const halo = reduceMotion ? 1 : envelope(phase, 0.74, 0.55, 0.18);
      const hR = dims.node * 3.2;
      const hGrad = ctx.createRadialGradient(x2, y2, 0, x2, y2, hR);
      hGrad.addColorStop(0, "rgba(143,211,255,0.6)");
      hGrad.addColorStop(0.45, "rgba(59,139,255,0.22)");
      hGrad.addColorStop(1, "rgba(59,139,255,0)");
      ctx.globalAlpha = halo;
      circle(x2, y2, hR, hGrad);

      const nGrad = ctx.createRadialGradient(x2 - 0.3, y2 - 0.3, 0, x2, y2, dims.node);
      nGrad.addColorStop(0, P.nodeCore);
      nGrad.addColorStop(0.5, P.lineHead);
      nGrad.addColorStop(1, P.line);
      ctx.globalAlpha = 1;
      circle(x2, y2, dims.node, nGrad);

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
