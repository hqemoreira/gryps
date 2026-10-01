"use client";
import { useEffect } from "react";

/** Animated favicon — Micro Orbital G with diagonal signal-travel. */
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

    // Scale from viewBox 36 → canvas inset (pad 4 → draw in 24×24 at origin 4,4)
    const S = 24 / 36;
    const OX = 4;
    const OY = 4;
    const tx = (x: number) => OX + x * S;
    const ty = (y: number) => OY + y * S;

    function envelope(phase: number, peak: number, base: number, width = 0.12) {
      const d = Math.abs(phase - peak);
      const wrapped = Math.min(d, 1 - d);
      const x = Math.max(0, 1 - wrapped / width);
      return base + (1 - base) * x;
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

      // G ring
      ctx.strokeStyle = "#F7FAFC";
      ctx.lineWidth = 5.5 * S;
      ctx.lineCap = "round";
      ctx.beginPath();
      // M25.2 9.6 A11.2 11.2 0 1 0 25.2 26.4  → center 18,18 r 11.2
      const cx = tx(18);
      const cy = ty(18);
      const r = 11.2 * S;
      const startAng = Math.atan2(9.6 - 18, 25.2 - 18);
      const endAng = Math.atan2(26.4 - 18, 25.2 - 18);
      // A ... 0 1 0 → large arc, counterclockwise in SVG (sweep=0)
      ctx.arc(cx, cy, r, startAng, endAng, true);
      ctx.stroke();

      // G spur
      ctx.beginPath();
      ctx.moveTo(tx(17.2), ty(18));
      ctx.lineTo(tx(26.4), ty(18));
      ctx.lineWidth = 5.1 * S;
      ctx.stroke();

      // Diagonal signal — dash travel via opacity envelope along the path
      const lineOpacity = reduceMotion ? 0.95 : envelope(phase, 0.55, 0.35, 0.35);
      ctx.strokeStyle = `rgba(79,168,255,${lineOpacity})`;
      ctx.lineWidth = 1.85 * S;
      ctx.beginPath();
      ctx.moveTo(tx(7.5), ty(28.5));
      ctx.lineTo(tx(28.2), ty(7.8));
      ctx.stroke();

      // Traveling packet glow along diagonal
      if (!reduceMotion) {
        const u = Math.min(1, Math.max(0, (phase - 0.05) / 0.67));
        const px = tx(7.5 + (28.2 - 7.5) * u);
        const py = ty(28.5 + (7.8 - 28.5) * u);
        const grd = ctx.createRadialGradient(px, py, 0, px, py, 4);
        grd.addColorStop(0, `rgba(110,231,249,${0.55 * (1 - Math.abs(u - 0.85))})`);
        grd.addColorStop(1, "rgba(110,231,249,0)");
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // Node peak when signal arrives (~72% of cycle)
      const nodePulse = reduceMotion ? 1 : envelope(phase, 0.72, 0.45, 0.14);
      const nx = tx(28.2);
      const ny = ty(7.8);
      const nr = 2.35 * S;
      const ngrd = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr * 2.5);
      ngrd.addColorStop(0, `rgba(110,231,249,${nodePulse * 0.55})`);
      ngrd.addColorStop(1, "rgba(110,231,249,0)");
      ctx.beginPath();
      ctx.arc(nx, ny, nr * 2.5, 0, Math.PI * 2);
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
