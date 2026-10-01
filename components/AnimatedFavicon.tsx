"use client";
import { useEffect } from "react";

/** Animated favicon — Micro Orbital G matching identity artwork + signal-travel. */
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

    const DX1 = 3.9;
    const DY1 = 31.4;
    const DX2 = 31.1;
    const DY2 = 5.85;
    const NODE_R = 2.05;

    const G_TOP = "#C5DFFF";
    const G_MID = "#A8D0FF";
    const G_BOT = "#8BB8F0";
    const LINE = "#70CFFF";
    const LINE_DEEP = "#4FB8FF";
    const G_OPACITY = 0.82;

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

    function drawG() {
      const grd = ctx.createLinearGradient(tx(18), ty(5), tx(18), ty(31));
      grd.addColorStop(0, G_TOP);
      grd.addColorStop(0.45, G_MID);
      grd.addColorStop(1, G_BOT);
      ctx.globalAlpha = G_OPACITY;
      ctx.fillStyle = grd;

      // Soft glow under G
      ctx.save();
      ctx.shadowColor = "rgba(168,208,255,0.45)";
      ctx.shadowBlur = 3;

      const topO = { x: 28.15, y: 10.35 };
      const botO = { x: 28.35, y: 23.05 };
      const topI = { x: 22.85, y: 10.85 };
      const botI = { x: 23.05, y: 21.45 };
      const cx = tx(18);
      const cy = ty(18.15);
      const RO = 13.1;
      const RI = 8.5;

      ctx.beginPath();
      ctx.moveTo(tx(topO.x), ty(topO.y));
      ctx.arc(
        cx,
        cy,
        RO * S,
        Math.atan2(topO.y - 18.15, topO.x - 18),
        Math.atan2(botO.y - 18.15, botO.x - 18),
        true
      );
      ctx.lineTo(tx(botI.x), ty(botI.y));
      ctx.arc(
        cx,
        cy,
        RI * S,
        Math.atan2(botI.y - 18.15, botI.x - 18),
        Math.atan2(topI.y - 18.15, topI.x - 18),
        false
      );
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(tx(21.7), ty(15.9));
      ctx.lineTo(tx(26.7), ty(15.9));
      ctx.lineTo(tx(27.45), ty(18.3));
      ctx.lineTo(tx(26.7), ty(20.7));
      ctx.lineTo(tx(21.7), ty(20.7));
      ctx.lineTo(tx(18.0), ty(18.3));
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.globalAlpha = 1;
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      fillTaper(8.6, 26.35, 13.35, 21.95, 0.85, 0.85, "#000");
      ctx.restore();
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

      const lineOp = reduceMotion ? 0.98 : envelope(phase, 0.55, 0.4, 0.35);
      const glowOp = reduceMotion ? 0.28 : envelope(phase, 0.55, 0.14, 0.35);

      fillTaper(DX1, DY1, DX2, DY2, 0.45, 1.85, `rgba(79,184,255,${glowOp})`);
      fillTaper(DX1, DY1, DX2, DY2, 0.05, 0.62, `rgba(112,207,255,${lineOp})`);

      drawG();
      // Re-draw diagonal through pierce so the slot shows the signal line, not the tile bg
      fillTaper(8.2, 26.7, 14.0, 21.4, 0.05, 0.45, `rgba(112,207,255,${lineOp})`);
      fillTaper(8.2, 26.7, 14.0, 21.4, 0.25, 0.9, `rgba(79,184,255,${glowOp * 0.7})`);

      fillTaper(14.8, 20.6, DX2, DY2, 0.38, 0.62, `rgba(112,207,255,${lineOp})`);

      if (!reduceMotion) {
        const u = Math.min(1, Math.max(0, (phase - 0.05) / 0.67));
        const px = tx(DX1 + (DX2 - DX1) * u);
        const py = ty(DY1 + (DY2 - DY1) * u);
        const grd = ctx.createRadialGradient(px, py, 0, px, py, 4);
        grd.addColorStop(0, `rgba(153,223,255,${0.55 * (1 - Math.abs(u - 0.85))})`);
        grd.addColorStop(1, "rgba(153,223,255,0)");
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      const nodePulse = reduceMotion ? 1 : envelope(phase, 0.72, 0.45, 0.14);
      const nx = tx(DX2);
      const ny = ty(DY2);
      const nr = NODE_R * 1.15 * S;

      const ngrd = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr * 2.6);
      ngrd.addColorStop(0, `rgba(91,184,255,${nodePulse * 0.5})`);
      ngrd.addColorStop(1, "rgba(91,184,255,0)");
      ctx.beginPath();
      ctx.arc(nx, ny, nr * 2.6, 0, Math.PI * 2);
      ctx.fillStyle = ngrd;
      ctx.fill();

      const ncore = ctx.createRadialGradient(nx - nr * 0.25, ny - nr * 0.3, 0, nx, ny, nr);
      ncore.addColorStop(0, "#E8F7FF");
      ncore.addColorStop(0.55, LINE);
      ncore.addColorStop(1, LINE_DEEP);
      ctx.beginPath();
      ctx.arc(nx, ny, nr, 0, Math.PI * 2);
      ctx.fillStyle = ncore;
      ctx.globalAlpha = 0.65 + 0.35 * nodePulse;
      ctx.fill();
      ctx.globalAlpha = 1;

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
