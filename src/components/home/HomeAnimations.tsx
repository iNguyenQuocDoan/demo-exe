"use client";
import { useEffect } from "react";

/**
 * Lean GSAP runtime for the landing page.
 *
 * Card entrance & hover are now handled by Framer Motion (StaggerGroup /
 * RevealItem in src/components/motion/ScrollReveal.tsx). This file owns only
 * what Framer Motion can't reasonably do declaratively:
 *
 *   1. Scroll progress bar (top of page)
 *   2. Hero floating cards (entrance + continuous loop)
 *   3. Floating decorative shapes in the hero
 *   4. Number count-up for .ha-stat-num / .ha-bento-num (IntersectionObserver
 *      so it fires exactly when the number enters the viewport)
 */

function countUp(el: HTMLElement, opts?: { duration?: number }) {
  const raw = el.getAttribute("data-value") ?? "0";
  const num = parseFloat(raw.replace(/[^\d.]/g, ""));
  if (isNaN(num)) return;
  const explicitSuffix = el.getAttribute("data-suffix");
  const suffix = explicitSuffix ?? (num >= 1000 ? "+" : raw.replace(/[\d.]/g, ""));
  const format = el.getAttribute("data-format");
  const decimals = Number(el.getAttribute("data-decimals") ?? 0);
  const duration = opts?.duration ?? 2000;
  const start = performance.now();

  const tick = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    const v = ease * num;
    const formatted =
      format === "dot" || num >= 1000
        ? Math.round(v).toLocaleString("vi-VN")
        : v.toLocaleString("vi-VN", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          });
    el.textContent = formatted + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function HomeAnimations() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Scroll progress bar — always on (cheap, no animation) */
    const progressBar = document.getElementById("scroll-progress");
    const onScroll = () => {
      if (!progressBar) return;
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? scrolled / max : 0;
      progressBar.style.transform = `scaleX(${ratio})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* Count-up — IntersectionObserver fires exactly when number enters view.
       Even with reduced motion we still update the text so the value is
       displayed correctly (just instantly instead of animated). */
    const numberEls = document.querySelectorAll<HTMLElement>(".ha-stat-num, .ha-bento-num");
    const numberObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          countUp(el, { duration: reducedMotion ? 0 : 2000 });
          numberObserver.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    numberEls.forEach((el) => numberObserver.observe(el));

    /* Hero-only animations stay on GSAP because they need a continuous
       floating loop that Framer Motion's whileInView can't express as
       cleanly. Skip entirely when reduced motion is requested. */
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    if (!reducedMotion) {
      void Promise.all([import("gsap")])
        .then(([{ gsap }]) => {
          if (cancelled) return;
          requestAnimationFrame(() => {
            ctx = gsap.context(() => {
              setupHeroAnimations(gsap);
            });
          });
        })
        .catch((err) => console.error("Failed to load GSAP:", err));
    }

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      numberObserver.disconnect();
      ctx?.revert();
    };
  }, []);

  return null;
}

function setupHeroAnimations(gsap: typeof import("gsap").gsap) {
  /* Hero text + image entrance (still nice to have a slight pop on load) */
  const heroChildren = document.querySelectorAll(".ha-hero > *");
  if (heroChildren.length) {
    gsap.fromTo(
      heroChildren,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0.1 }
    );
  }

  const heroCard = document.querySelector(".ha-hero-card");
  if (heroCard) {
    gsap.fromTo(
      heroCard,
      { opacity: 0, scale: 0.9, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 1, ease: "back.out(1.1)", delay: 0.3 }
    );
  }

  /* Floating cards — entrance + continuous gentle bobbing */
  setupHeroFloatingCards(gsap);

  /* Decorative shape parallax */
  const floatingShapes = document.querySelectorAll(".ha-floating-shape");
  floatingShapes.forEach((shape, i) => {
    const xAmp = 20 + i * 15;
    const yAmp = 15 + i * 10;
    gsap.to(shape, {
      keyframes: {
        x: [0, xAmp, -xAmp, 0],
        y: [0, yAmp, -yAmp, 0],
      },
      duration: 8 + i * 2,
      repeat: -1,
      ease: "sine.inOut",
    });
  });
}

function setupHeroFloatingCards(gsap: typeof import("gsap").gsap) {
  const cards: Array<{ sel: string; delay: number; y: [number, number]; x: [number, number]; dur: number; loopDelay?: number }> = [
    { sel: ".hero-floating-card:not(.hero-floating-card-delay):not(.hero-floating-card-slow)", delay: 0.5, y: [-8, 8], x: [3, -3], dur: 5 },
    { sel: ".hero-floating-card-delay", delay: 0.65, y: [8, -8], x: [-4, 4], dur: 6.5, loopDelay: 0.3 },
    { sel: ".hero-floating-card-slow", delay: 0.8, y: [-6, 6], x: [-3, 3], dur: 7, loopDelay: 0.5 },
  ];

  cards.forEach(({ sel, delay, y, x, dur, loopDelay }) => {
    const el = document.querySelector(sel);
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.2)", delay }
    );
    gsap.to(el, {
      keyframes: { y, x },
      duration: dur,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: loopDelay,
    });
  });
}
