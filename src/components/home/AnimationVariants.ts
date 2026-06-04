/**
 * LIFLOW Animation Variants System
 * Reusable motion configurations for GSAP animations
 * Ensures consistent timing, easing, and feel across all sections
 */

export const ANIMATION_TIMING = {
  entrance: 0.6, // 0.45s - 0.75s
  entranceStagger: 0.12, // 0.08s - 0.15s
  hover: 0.25, // 0.18s - 0.25s
  floating: { min: 4, max: 7 }, // Floating animation duration
  cardLift: 0.3, // Card hover lift duration
};

export const ANIMATION_EASING = {
  entranceOut: "back.out(1.1)", // Bouncy entrance
  scrollReveal: "power2.out", // Smooth scroll reveal
  hover: "power2.out", // Quick responsive hover
  floating: "sine.inOut", // Smooth floating
};

export const SCROLL_REVEAL_CONFIG = {
  trigger: "top 85%", // When section top is at 85% of viewport
  once: true, // Only animate once
  markers: false,
};

type TweenConfig = {
  y?: number;
  scale?: number;
  boxShadow?: string;
  duration: number;
  ease: string;
  overwrite?: "auto";
};

export const HOVER_ANIMATION_CONFIG = {
  cardLift: {
    y: -8, // Lift 8px
    duration: ANIMATION_TIMING.hover,
    ease: ANIMATION_EASING.hover,
    overwrite: "auto",
  },
  cardShadow: {
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)",
    duration: ANIMATION_TIMING.hover,
    ease: ANIMATION_EASING.hover,
    overwrite: "auto",
  },
  statCardHover: {
    y: -6,
    scale: 1.02,
    duration: ANIMATION_TIMING.hover,
    ease: ANIMATION_EASING.hover,
    overwrite: "auto",
  },
} satisfies Record<string, TweenConfig>;

export const FLOATING_ANIMATIONS = {
  card1: {
    y: [-8, 8],
    x: [3, -3],
    duration: 5,
    repeat: -1,
    yoyo: true,
    ease: ANIMATION_EASING.floating,
  },
  card2: {
    y: [8, -8],
    x: [-4, 4],
    duration: 6.5,
    repeat: -1,
    yoyo: true,
    ease: ANIMATION_EASING.floating,
  },
  card3: {
    y: [-6, 6],
    x: [-3, 3],
    duration: 7,
    repeat: -1,
    yoyo: true,
    ease: ANIMATION_EASING.floating,
  },
} as const;

export const ENTRANCE_ANIMATIONS = {
  fadeUp: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    duration: ANIMATION_TIMING.entrance,
    ease: ANIMATION_EASING.scrollReveal,
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    duration: ANIMATION_TIMING.entrance,
    ease: ANIMATION_EASING.scrollReveal,
  },
  slideInLeft: {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
    duration: ANIMATION_TIMING.entrance,
    ease: ANIMATION_EASING.scrollReveal,
  },
};
