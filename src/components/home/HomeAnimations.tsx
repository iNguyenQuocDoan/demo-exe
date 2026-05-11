"use client";
import { useEffect } from "react";

/* Count-up using requestAnimationFrame (no library needed) */
function countUp(el: HTMLElement, opts?: { duration?: number }) {
  const raw = el.getAttribute("data-value") ?? "0";
  const num = parseFloat(raw.replace(/[^\d.]/g, ""));
  if (isNaN(num)) return;
  /* Suffix priority: explicit data-suffix > auto (+) for thousands > stripped */
  const explicitSuffix = el.getAttribute("data-suffix");
  const suffix = explicitSuffix ?? (num >= 1000 ? "+" : raw.replace(/[\d.]/g, ""));
  const format = el.getAttribute("data-format"); // "dot" → use vi-VN locale with dots
  const duration = opts?.duration ?? 1800;
  const start = performance.now();

  const tick = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    const v = Math.round(ease * num);
    const formatted =
      format === "dot" || num >= 1000
        ? v.toLocaleString("vi-VN")
        : String(v);
    el.textContent = formatted + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function HomeAnimations() {
  useEffect(() => {
    /* Skip animations if user prefers reduced motion */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll<HTMLElement>(".ha-hero > *, .ha-hero-card, .ha-stat, .ha-step, .ha-subject, .ha-fee-left, .ha-fee-right, .ha-testimonial, .ha-faq, .ha-cta > *").forEach(el => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    /* Track context for cleanup. gsap.context() captures all tweens + ScrollTriggers
       created inside its callback, then revert() kills them all together. */
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    /* Scroll progress bar — uses transform: scaleX (no reflow) */
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

    /* Dynamic-load GSAP — keeps it out of initial bundle */
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          runAnimations(gsap, ScrollTrigger);
        });
      });

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      /* Reverts ALL tweens + ScrollTriggers created inside ctx, including infinite loops */
      ctx?.revert();
    };
  }, []);

  return null;
}

function runAnimations(
  gsap: typeof import("gsap").gsap,
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger,
) {
  const ease = "power3.out";

  /* ── Hero ─────────────────────────────────────────────────────────────── */
  const heroChildren = document.querySelectorAll(".ha-hero > *");
  if (heroChildren.length) {
    gsap.fromTo(
      heroChildren,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.12,
        delay: 0.1,
        ease,
      },
    );
  }

  const heroCard = document.querySelector(".ha-hero-card");
  if (heroCard) {
    gsap.fromTo(
      heroCard,
      { opacity: 0, x: 50, scale: 0.96 },
      { opacity: 1, x: 0, scale: 1, duration: 0.85, delay: 0.4, ease },
    );
  }

  /* ── Stats (count-up) ─────────────────────────────────────────────────── */
  const statEls = document.querySelectorAll<HTMLElement>(".ha-stat");
  if (statEls.length) {
    gsap.fromTo(
      statEls,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.1,
        ease,
        scrollTrigger: {
          trigger: statEls[0],
          start: "top 85%",
          once: true,
          onEnter: () => {
            document
              .querySelectorAll<HTMLElement>(".ha-stat-num")
              .forEach((el) => countUp(el));
          },
        },
      },
    );
  }

  /* ── Steps (3D flip + lift) ────────────────────────────────────────────── */
  const stepEls = document.querySelectorAll(".ha-step");
  if (stepEls.length) {
    gsap.fromTo(
      stepEls,
      { opacity: 0, y: 60, rotateX: -8, transformPerspective: 1000 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.15,
        ease,
        scrollTrigger: { trigger: stepEls[0], start: "top 82%", once: true },
      },
    );

    /* Subtle parallax on step images during scroll */
    stepEls.forEach((step) => {
      const img = step.querySelector<HTMLElement>("img");
      if (img) {
        gsap.to(img, {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: step,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    });
  }

  /* ── Subject cards (pop-in with wave stagger) ──────────────────────────── */
  const subjectEls = document.querySelectorAll(".ha-subject");
  if (subjectEls.length) {
    gsap.fromTo(
      subjectEls,
      { opacity: 0, scale: 0.82, y: 24, rotateZ: -2 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        rotateZ: 0,
        duration: 0.55,
        stagger: { each: 0.05, from: "start" },
        ease: "back.out(1.6)",
        scrollTrigger: { trigger: subjectEls[0], start: "top 85%", once: true },
      },
    );

    /* Subtle floating idle animation — random offset per card */
    subjectEls.forEach((subject, i) => {
      const img = subject.querySelector<HTMLElement>("img");
      if (!img) return;
      gsap.to(img, {
        yPercent: 4,
        duration: 3 + (i % 3) * 0.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * 0.15,
      });
    });
  }

  /* ── Features section (slide from sides) ───────────────────────────────── */
  const feeLeft = document.querySelector(".ha-fee-left");
  if (feeLeft) {
    gsap.fromTo(
      feeLeft,
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease,
        scrollTrigger: { trigger: feeLeft, start: "top 82%", once: true },
      },
    );
  }

  const feeRight = document.querySelectorAll(".ha-fee-right");
  if (feeRight.length) {
    gsap.fromTo(
      feeRight,
      { opacity: 0, y: 40, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.75,
        stagger: 0.12,
        delay: 0.15,
        ease,
        scrollTrigger: {
          trigger: feeRight[0],
          start: "top 85%",
          once: true,
          /* When features enter view: rotate-in icons */
          onEnter: () => {
            const icons = document.querySelectorAll<HTMLElement>(".ha-fee-right .lucide");
            gsap.fromTo(
              icons,
              { rotateY: -90, opacity: 0 },
              {
                rotateY: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.1,
                ease: "back.out(1.4)",
                delay: 0.3,
              },
            );
          },
        },
      },
    );
  }

  /* ── Bento count-up numbers ────────────────────────────────────────────── */
  const bentoNums = document.querySelectorAll<HTMLElement>(".ha-bento-num");
  if (bentoNums.length) {
    bentoNums.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          /* Zoom-in flash */
          gsap.fromTo(
            el,
            { scale: 0.6, opacity: 0, filter: "blur(8px)" },
            {
              scale: 1,
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.7,
              ease: "back.out(1.3)",
            },
          );
          /* Start count-up after a short delay */
          setTimeout(() => countUp(el, { duration: 2000 }), 200);
        },
      });
    });
  }

  /* ── Testimonials (cards + stars sequential reveal) ───────────────────── */
  const testimonialEls = document.querySelectorAll(".ha-testimonial");
  if (testimonialEls.length) {
    gsap.fromTo(
      testimonialEls,
      { opacity: 0, y: 40, scale: 0.94 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.15,
        ease,
        scrollTrigger: {
          trigger: testimonialEls[0],
          start: "top 85%",
          once: true,
          /* Stars cascade after card lands */
          onEnter: () => {
            testimonialEls.forEach((card, idx) => {
              const stars = card.querySelectorAll<HTMLElement>(".lucide-star");
              if (!stars.length) return;
              gsap.fromTo(
                stars,
                { scale: 0, opacity: 0, rotate: -45 },
                {
                  scale: 1,
                  opacity: 1,
                  rotate: 0,
                  duration: 0.45,
                  stagger: 0.08,
                  ease: "back.out(2.2)",
                  delay: 0.4 + idx * 0.15,
                },
              );
            });
          },
        },
      },
    );
  }

  /* ── FAQ items ─────────────────────────────────────────────────────────── */
  const faqEls = document.querySelectorAll(".ha-faq");
  if (faqEls.length) {
    gsap.fromTo(
      faqEls,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.07,
        ease,
        scrollTrigger: { trigger: faqEls[0], start: "top 85%", once: true },
      },
    );
  }

  /* ── Final CTA ─────────────────────────────────────────────────────────── */
  const ctaChildren = document.querySelectorAll(".ha-cta > *");
  if (ctaChildren.length) {
    gsap.fromTo(
      ctaChildren,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.1,
        ease,
        scrollTrigger: { trigger: ctaChildren[0], start: "top 88%", once: true },
      },
    );
  }

  /* ── Subtle parallax on hero mesh background ────────────────────────────── */
  const heroBg = document.querySelector<HTMLElement>(".ha-hero-parallax");
  if (heroBg) {
    gsap.to(heroBg, {
      y: "15%",
      ease: "none",
      scrollTrigger: {
        trigger: heroBg.parentElement,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  /* ── Bento decorative image parallax ──────────────────────────────────── */
  const bentoCards = document.querySelectorAll<HTMLElement>(".ha-fee-right");
  bentoCards.forEach((card) => {
    const decoImg = card.querySelector<HTMLImageElement>("img");
    if (decoImg) {
      gsap.fromTo(
        decoImg,
        { scale: 1, yPercent: -5 },
        {
          scale: 1.08,
          yPercent: 5,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        },
      );
    }
  });

  /* ── Hero ambient light pulse ─────────────────────────────────────────── */
  const heroAmbient = document.querySelector<HTMLElement>(".hero-ambient-light");
  if (heroAmbient) {
    gsap.to(heroAmbient, {
      opacity: 0.7,
      scale: 1.1,
      duration: 4,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }

  /* ── Hero floating shapes — animate JSX-rendered dots (no DOM injection) ── */
  const floatingShapes = document.querySelectorAll<HTMLElement>(".ha-floating-shape");
  floatingShapes.forEach((dot, i) => {
    /* Deterministic offsets per index — keeps SSR/CSR stable, avoids hydration mismatch */
    const yOffset = -30 - (i % 3) * 8;
    const xOffset = ((i % 2 === 0 ? 1 : -1) * (8 + (i % 3) * 4));
    const dur = 4 + (i % 4) * 0.6;
    const delay = i * 0.6;

    gsap.to(dot, {
      y: yOffset,
      x: xOffset,
      opacity: 0,
      duration: dur,
      delay,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
  });

  /* ── Scroll-driven hero fade (gentle) ──────────────────────────────────── */
  const heroContent = document.querySelector<HTMLElement>(".ha-hero");
  if (heroContent) {
    gsap.to(heroContent, {
      opacity: 0.4,
      y: -20,
      ease: "none",
      scrollTrigger: {
        trigger: heroContent.closest("section"),
        start: "top top",
        end: "bottom 40%",
        scrub: 1,
      },
    });
  }

  /* ── How-it-works image scale on card hover (CSS-driven, no GSAP) ─────── */
  document.querySelectorAll<HTMLElement>(".ha-step").forEach((step) => {
    const img = step.querySelector<HTMLImageElement>("img");
    if (!img) return;
    img.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
    const enter = () => { img.style.transform = "scale(1.08)"; };
    const leave = () => { img.style.transform = "scale(1)"; };
    step.addEventListener("mouseenter", enter);
    step.addEventListener("mouseleave", leave);
  });
}
