"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, HTMLAttributes, PointerEvent } from "react";
import { cn } from "@/lib/utils";

type SpotlightCardStyle = CSSProperties & {
  "--spotlight-color": string;
  "--spotlight-size": string;
  "--spotlight-x": string;
  "--spotlight-y": string;
};

type SpotlightCardProps = HTMLAttributes<HTMLDivElement> & {
  spotlightColor?: string;
  spotlightSize?: number;
};

export default function SpotlightCard({
  children,
  className,
  spotlightColor = "oklch(0.72 0.16 245 / 0.18)",
  spotlightSize = 360,
  style,
  onPointerMove,
  onPointerLeave,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
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

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (reduceMotionRef.current || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    cardRef.current.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  };

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    if (!cardRef.current) return;

    cardRef.current.style.setProperty("--spotlight-x", "50%");
    cardRef.current.style.setProperty("--spotlight-y", "50%");
  };

  return (
    <div
      ref={cardRef}
      className={cn("group/spotlight relative overflow-hidden", className)}
      style={
        {
          "--spotlight-color": spotlightColor,
          "--spotlight-size": `${spotlightSize}px`,
          "--spotlight-x": "50%",
          "--spotlight-y": "50%",
          ...style,
        } as SpotlightCardStyle
      }
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100 group-focus-within/spotlight:opacity-100 motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(var(--spotlight-size) circle at var(--spotlight-x) var(--spotlight-y), var(--spotlight-color), transparent 68%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
