"use client";

import { useRef } from "react";
import type { ReactNode, MouseEvent, CSSProperties } from "react";

interface TiltedCardProps {
  children: ReactNode;
  className?: string;
  /** Max tilt angle (degrees). Default 8 — subtle but noticeable. */
  maxTilt?: number;
  /** Scale on hover. Default 1.02 */
  scale?: number;
  /** Show subtle gloss overlay following cursor. Default true. */
  gloss?: boolean;
  style?: CSSProperties;
}

/**
 * 3D tilt-on-hover card — follow cursor, snap back on leave.
 * Pure CSS transform, no JS frame loop. Respects reduced-motion.
 */
export default function TiltedCard({
  children,
  className = "",
  maxTilt = 8,
  scale = 1.02,
  gloss = true,
  style,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const glossRef = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;
    const rotateY = px * maxTilt * 2;
    const rotateX = -py * maxTilt * 2;
    el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
    if (gloss && glossRef.current) {
      glossRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, oklch(1 0 0 / 0.18) 0%, transparent 45%)`;
      glossRef.current.style.opacity = "1";
    }
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    if (glossRef.current) glossRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        transformStyle: "preserve-3d",
        willChange: "transform",
        position: "relative",
        ...style,
      }}
    >
      {children}
      {gloss && (
        <div
          ref={glossRef}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0,
            transition: "opacity 0.3s ease",
            mixBlendMode: "overlay",
            borderRadius: "inherit",
          }}
        />
      )}
    </div>
  );
}
