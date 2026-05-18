"use client";

import { useEffect, useRef } from "react";
import type { HTMLAttributes, PointerEvent } from "react";
import { cn } from "@/lib/utils";

type MagnetProps = HTMLAttributes<HTMLSpanElement> & {
  strength?: number;
  maxOffset?: number;
};

export default function Magnet({
  children,
  className,
  strength = 0.16,
  maxOffset = 10,
  onPointerMove,
  onPointerLeave,
  ...props
}: MagnetProps) {
  const magnetRef = useRef<HTMLSpanElement>(null);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      reduceMotionRef.current = media.matches;
    };

    updatePreference();
    media.addEventListener("change", updatePreference);

    return () => {
      media.removeEventListener("change", updatePreference);
    };
  }, []);

  const resetTransform = () => {
    if (!magnetRef.current) return;
    magnetRef.current.style.transform = "translate3d(0, 0, 0)";
  };

  const handlePointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    onPointerMove?.(event);
    if (reduceMotionRef.current || !magnetRef.current) return;

    const rect = magnetRef.current.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    const x = Math.max(-maxOffset, Math.min(maxOffset, offsetX * strength));
    const y = Math.max(-maxOffset, Math.min(maxOffset, offsetY * strength));

    magnetRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const handlePointerLeave = (event: PointerEvent<HTMLSpanElement>) => {
    onPointerLeave?.(event);
    resetTransform();
  };

  return (
    <span
      ref={magnetRef}
      className={cn(
        "inline-flex will-change-transform transition-transform duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none",
        className
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {children}
    </span>
  );
}
