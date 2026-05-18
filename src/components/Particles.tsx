"use client";

import { useEffect, useRef } from "react";

interface ParticlesProps {
  /** Số hạt — tự động scale theo độ rộng nếu không set. */
  count?: number;
  /** Màu hạt — chấp nhận bất kỳ CSS color string. */
  color?: string;
  /** Tốc độ trôi cơ bản (px/s). */
  speed?: number;
  /** Bán kính hạt cơ bản (px). */
  size?: number;
  /** Độ mờ tối đa của hạt. */
  maxOpacity?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  twinklePhase: number;
}

/**
 * Lightweight canvas particles — drifting points with subtle twinkle.
 * Tự đặt vào parent có `position: relative`. Pointer-events: none, không chặn click.
 *
 * Tự tắt khi user có `prefers-reduced-motion: reduce`.
 */
export default function Particles({
  count,
  color = "oklch(0.92 0.05 250)",
  speed = 18,
  size = 1.5,
  maxOpacity = 0.55,
  className = "",
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target =
        count ?? Math.max(20, Math.min(70, Math.round((width * height) / 22000)));
      const cur = particlesRef.current;
      if (cur.length < target) {
        for (let i = cur.length; i < target; i++) cur.push(make());
      } else if (cur.length > target) {
        cur.length = target;
      }
    };

    const make = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      r: size * (0.5 + Math.random() * 1.4),
      alpha: maxOpacity * (0.35 + Math.random() * 0.65),
      twinklePhase: Math.random() * Math.PI * 2,
    });

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, width, height);
      for (const p of particlesRef.current) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        p.twinklePhase += dt * 1.6;
        const tw = 0.6 + Math.sin(p.twinklePhase) * 0.4;
        ctx.globalAlpha = p.alpha * tw;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(tick);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      ro.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [color, count, maxOpacity, size, speed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
