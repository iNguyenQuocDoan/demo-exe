"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface Spark {
  x: number;
  y: number;
  angle: number;
  start: number;
}

interface ClickSparkProps {
  children: ReactNode;
  sparkColor?: string;
  sparkCount?: number;
  sparkSize?: number;
  sparkRadius?: number;
  duration?: number;
  /** Mở rộng vùng bắn — set true nếu muốn click bất kỳ đâu trong wrapper đều spark. */
  global?: boolean;
}

/**
 * ClickSpark — bắn các tia sáng ngắn từ vị trí click. Pure canvas overlay,
 * không ảnh hưởng layout. Đặt component bao quanh children muốn nhận spark.
 */
export default function ClickSpark({
  children,
  sparkColor = "oklch(0.85 0.18 70)",
  sparkCount = 10,
  sparkSize = 11,
  sparkRadius = 18,
  duration = 420,
  global = false,
}: ClickSparkProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = performance.now();
      sparksRef.current = sparksRef.current.filter(
        (s) => now - s.start < duration
      );
      for (const s of sparksRef.current) {
        const t = (now - s.start) / duration;
        const ease = 1 - Math.pow(1 - t, 3);
        const r = sparkRadius * ease;
        const len = sparkSize * (1 - t);
        const x1 = s.x + Math.cos(s.angle) * r;
        const y1 = s.y + Math.sin(s.angle) * r;
        const x2 = x1 + Math.cos(s.angle) * len;
        const y2 = y1 + Math.sin(s.angle) * len;
        ctx.strokeStyle = sparkColor;
        ctx.globalAlpha = 1 - t;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (sparksRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };

    const onClick = (e: globalThis.MouseEvent) => {
      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now = performance.now();
      for (let i = 0; i < sparkCount; i++) {
        sparksRef.current.push({
          x,
          y,
          angle: (i / sparkCount) * Math.PI * 2,
          start: now,
        });
      }
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick);
    };

    const target: HTMLElement | Window = global ? window : wrapper;
    target.addEventListener("click", onClick as EventListener);

    return () => {
      ro.disconnect();
      target.removeEventListener("click", onClick as EventListener);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [duration, sparkColor, sparkCount, sparkRadius, sparkSize, global]);

  return (
    <span
      ref={wrapperRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 20,
        }}
      />
      {children}
    </span>
  );
}
