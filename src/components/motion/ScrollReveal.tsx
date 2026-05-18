"use client";

import { motion, type Variants, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";

/* ─── Shared variants ───────────────────────────────────────────────────────
 * Soft, transform-light reveals. Keeps fade + a small translate so the motion
 * is felt without "thumping" — no scale (which made images bulge as they
 * entered) and no large y offset. Cards already use Tailwind hover utilities
 * for interactive feedback, so entrance should stay restrained.
 * ─────────────────────────────────────────────────────────────────────────── */

export const fadeUp: Variants = {
  hidden: { y: 14, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeLeft: Variants = {
  hidden: { x: -18, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
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
  amount = 0.05,
  once = true,
  className,
  ...rest
}: StaggerGroupProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: "0px 0px -8% 0px" }}
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
  amount = 0.1,
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
