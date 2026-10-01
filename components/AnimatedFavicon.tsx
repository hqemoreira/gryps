"use client";
import { useEffect } from "react";

/** Animated favicon — Micro Orbital G with diagonal signal-travel (matches GrypsMark artwork). */
export function AnimatedFavicon() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;

    let raf: number;
    let lastUpdate = 0;
    const start = performance.now();
    const UPDATE_INTERVAL = 100;
    const CYCLE = 2.4;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll<HTMLLinkElement>("link[rel='icon']").forEach((el) => el.remove());
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    document.head.appendChild(link);

    const S = 24 / 36;
    const OX = 4;
    const OY = 4;
    const tx = (x: number) => OX + x * S;
    const ty = (y: number) => OY + y * S;

    const CX = 18;
    const CY = 18;
    const RO = 13.1;
    const RI = 8.15;
    const GAP = (42 * Math.PI) / 180;
    const DX1 = 4.2;
    const DY1 = 31.1;
    const DX2 = 30.85;
    const DY2 = 6.15;
    const NODE_R = 2.05;

    function envelope(phase: number, peak: number, base: number, width = 0.12) {
      const d = Math.abs(phase - peak);
      const wrapped = Math.min(d, 1 - d);
      const x = Math.max(0, 1 - wrapped / width);
      return base + (1 - base) * x;
    }

    function fillTaper(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      w1: number,
      w2: number,
      color: string
    ) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const px = -dy / len;
      const py = dx / len;
      ctx.beginPath();
      ctx.moveTo(tx(x1 + px * w1), ty(y1 + py * w1));
      ctx.lineTo(tx(x2 + px * w2), ty(y2 + py * w2));
      ctx.lineTo(tx(x2 - px * w2), ty(y2 - py * w2));
      ctx.lineTo(tx(x1 - px * w1), ty(y1 - py * w1));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    function drawG(fill: string) {
      const ox1 = CX + RO * Math.cos(-GAP);
      const oy1 = CY + RO * Math.sin(-GAP);
      const ox2 = CX + RO * Math.cos(GAP);
      const oy2 = CY + RO * Math.sin(GAP);
      const ix1 = CX + RI * Math.cos(-GAP);
      const iy1 = CY + RI * Math.sin(-GAP);
      const ix2 = CX + RI * Math.cos(GAP);
      const iy2 = CY + RI * Math.sin(GAP);

      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(tx(ox1), ty(oy1));
      // Large arc through left: canvas CCW = true matches SVG sweep 0
      ctx.arc(tx(CX), ty(CY), RO * S, Math.atan2(oy1 - CY, ox1 - CX), Math.atan2(oy2 - CY, ox2 - CX), true);
      ctx.lineTo(tx(ix2), ty(iy2));
      ctx.arc(tx(CX), ty(CY), RI * S, Math.atan2(iy2 - CY, ix2 - CX), Math.atan2(iy1 - CY, ix1 - CX), false);
      ctx.closePath();
      ctx.fill();

      // Spur with diagonal cut
      ctx.beginPath();
      ctx.moveTo(tx(15.6), ty(15.55));
      ctx.lineTo(tx(25.35), ty(15.55));
      ctx.lineTo(tx(27.15), ty(18));
      ctx.lineTo(tx(25.35), ty(20.45));
      ctx.lineTo(tx(15.6), ty(20.45));
      ctx.closePath();
      ctx.fill();
    }

    function draw(now: number) {
      raf = requestAnimationFrame(draw);
      if (now - lastUpdate < UPDATE_INTERVAL) return;
      lastUpdate = now;

      const t = (now - start) / 1000;
      const phase = reduceMotion ? 0.72 : (t % CYCLE) / CYCLE;

      ctx.clearRect(0, 0, 32, 32);
      ctx.fillStyle = "#070B12";
      roundRect(ctx, 0, 0, 32, 32, 6);
      ctx.fill();

      const lineOp = reduceMotion ? 0.95 : envelope(phase, 0.55, 0.4, 0.35);
      const glowOp = reduceMotion ? 0.22 : envelope(phase, 0.55, 0.12, 0.35);

      // Diagonal behind
      fillTaper(DX1, DY1, DX2, DY2, 0.35, 1.55, `rgba(79,168,255,${glowOp})`);
      fillTaper(DX1, DY1, DX2, DY2, 0.08, 0.72, `rgba(110,231,249,${lineOp})`);

      // G occludes left stem
      drawG("#F7FAFC");

      // Front segment over spur
      fillTaper(15.2, 20.35, DX2, DY2, 0.45, 0.72, `rgba(110,231,249,${lineOp})`);

      // Traveling packet
      if (!reduceMotion) {
        const u = Math.min(1, Math.max(0, (phase - 0.05) / 0.67));
        const px = tx(DX1 + (DX2 - DX1) * u);
        const py = ty(DY1 + (DY2 - DY1) * u);
        const grd = ctx.createRadialGradient(px, py, 0, px, py, 4);
        grd.addColorStop(0, `rgba(110,231,249,${0.55 * (1 - Math.abs(u - 0.85))})`);
        grd.addColorStop(1, "rgba(110,231,249,0)");
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      const nodePulse = reduceMotion ? 1 : envelope(phase, 0.72, 0.45, 0.14);
      const nx = tx(DX2);
      const ny = ty(DY2);
      const nr = NODE_R * 1.12 * S;

      const ngrd = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr * 2.6);
      ngrd.addColorStop(0, `rgba(79,168,255,${nodePulse * 0.45})`);
      ngrd.addColorStop(1, "rgba(79,168,255,0)");
      ctx.beginPath();
      ctx.arc(nx, ny, nr * 2.6, 0, Math.PI * 2);
      ctx.fillStyle = ngrd;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(nx, ny, nr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(110,231,249,${0.65 + 0.35 * nodePulse})`;
      ctx.fill();

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
