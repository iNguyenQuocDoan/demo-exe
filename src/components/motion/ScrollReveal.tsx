"use client";

import { motion, type Variants, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";

/* ─── Shared variants ───────────────────────────────────────────────────────
 * Used consistently across all landing sections so cards reveal with the
 * same rhythm. Each entrance is clearly visible (y: 32, scale: 0.96)
 * with a 0.6s easeOut and 0.1s stagger between siblings.
 * ─────────────────────────────────────────────────────────────────────────── */

/* NOTE: variants no longer set `opacity: 0` initial state — that was causing
 * lazy-loaded `<Image>` children inside cards to flicker on first paint
 * (image loads → card opacity 0 hides it → fade-in to 1 reveals it again).
 * Entrance now uses transform-only (y/x + scale) so images stay fully opaque
 * the entire time. */

export const fadeUp: Variants = {
  hidden: { y: 32, scale: 0.96 },
  visible: {
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export const fadeLeft: Variants = {
  hidden: { x: -40, scale: 0.97 },
  visible: {
    x: 0,
    scale: 1,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

export const scaleIn: Variants = {
  hidden: { scale: 0.9 },
  visible: {
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

/* ─── StaggerGroup ──────────────────────────────────────────────────────────
 * Parent wrapper that triggers child reveals in sequence on viewport entry.
 * Use `amount` 0.15-0.25 so cards start animating as soon as the section
 * begins entering the viewport (not when fully in).
 * ─────────────────────────────────────────────────────────────────────────── */

type StaggerGroupProps = Omit<HTMLMotionProps<"div">, "variants" | "initial" | "whileInView" | "viewport"> & {
  children: ReactNode;
  amount?: number;
  once?: boolean;
};

export function StaggerGroup({
  children,
  amount = 0.2,
  once = true,
  className,
  ...rest
}: StaggerGroupProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: "-40px 0px" }}
      variants={staggerContainer}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ─── RevealItem ────────────────────────────────────────────────────────────
 * Wraps a card so it inherits the parent's staggered visible state.
 * Optionally enables a subtle hover lift (default off for cards that already
 * have Tailwind hover utilities).
 * ─────────────────────────────────────────────────────────────────────────── */

type RevealItemProps = Omit<HTMLMotionProps<"div">, "variants"> & {
  children: ReactNode;
  variant?: Variants;
  hoverLift?: boolean;
};

export function RevealItem({
  children,
  variant = fadeUp,
  hoverLift = false,
  className,
  ...rest
}: RevealItemProps) {
  return (
    <motion.div
      variants={variant}
      className={className}
      whileHover={
        hoverLift
          ? { y: -8, scale: 1.02, transition: { duration: 0.22, ease: "easeOut" } }
          : undefined
      }
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ─── RevealOnView ──────────────────────────────────────────────────────────
 * Stand-alone reveal (no parent stagger). Use for hero-section titles,
 * subtitles, or single elements that don't belong to a card grid.
 * ─────────────────────────────────────────────────────────────────────────── */

type RevealOnViewProps = Omit<HTMLMotionProps<"div">, "variants" | "initial" | "whileInView" | "viewport"> & {
  children: ReactNode;
  variant?: Variants;
  delay?: number;
  amount?: number;
  once?: boolean;
};

export function RevealOnView({
  children,
  variant = fadeUp,
  delay = 0,
  amount = 0.3,
  once = true,
  className,
  ...rest
}: RevealOnViewProps) {
  const withDelay: Variants = delay
    ? {
        hidden: variant.hidden,
        visible: {
          ...(variant.visible as object),
          transition: {
            ...((variant.visible as { transition?: object })?.transition ?? {}),
            delay,
          },
        },
      }
    : variant;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: "-40px 0px" }}
      variants={withDelay}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
