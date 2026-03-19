"use client";
import { useEffect } from "react";
import { animate, stagger } from "animejs";

/* ─── Intersection Observer helper ─────────────────────────────────────────── */
function observeOnce(
  selector: string,
  cb: () => void,
  threshold = 0.15,
): IntersectionObserver | undefined {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          cb();
          io.disconnect();
        }
      });
    },
    { threshold },
  );
  elements.forEach((el) => io.observe(el));
  return io;
}

/* ─── Count-up (animejs v4 plain-object) ────────────────────────────────────── */
function countUp(el: HTMLElement) {
  const raw = el.getAttribute("data-value") ?? "0";
  const num = parseFloat(raw.replace(/[^\d.]/g, ""));
  if (isNaN(num)) return;
  const suffix = num >= 1000 ? "+" : raw.replace(/[\d.]/g, "");
  const counter = { value: 0 };

  animate(counter, {
    value: num,
    duration: 1600,
    ease: "outExpo",
    onUpdate: () => {
      const v = counter.value;
      el.textContent =
        num >= 1000
          ? Math.round(v).toLocaleString("vi-VN") + "+"
          : Math.round(v) + suffix;
    },
  });
}

/* ─── HomeAnimations ────────────────────────────────────────────────────────── */
export function HomeAnimations() {
  useEffect(() => {
    /* Hero — stagger children immediately */
    animate(".ha-hero > *", {
      opacity: [0, 1],
      translateY: [28, 0],
      duration: 700,
      delay: stagger(130, { start: 100 }),
      ease: "outExpo",
    });

    animate(".ha-hero-card", {
      opacity: [0, 1],
      translateX: [50, 0],
      duration: 750,
      delay: 350,
      ease: "outExpo",
    });

    /* Stats — count-up on scroll */
    const ioStats = observeOnce(".ha-stat", () => {
      animate(".ha-stat", {
        opacity: [0, 1],
        translateY: [32, 0],
        duration: 600,
        delay: stagger(110),
        ease: "outExpo",
        onComplete: () => {
          document.querySelectorAll<HTMLElement>(".ha-stat-num").forEach(countUp);
        },
      });
    });

    /* Steps */
    const ioSteps = observeOnce(".ha-step", () => {
      animate(".ha-step", {
        opacity: [0, 1],
        translateY: [48, 0],
        duration: 650,
        delay: stagger(160),
        ease: "outExpo",
      });
    });

    /* Subject cards — pop in */
    const ioSubjects = observeOnce(
      ".ha-subject",
      () => {
        animate(".ha-subject", {
          opacity: [0, 1],
          scale: [0.88, 1],
          duration: 500,
          delay: stagger(45),
          ease: "outBack(1.4)",
        });
      },
      0.05,
    );

    /* Fee section — slide from sides */
    const ioFee = observeOnce(".ha-fee-left", () => {
      animate(".ha-fee-left", {
        opacity: [0, 1],
        translateX: [-40, 0],
        duration: 700,
        ease: "outExpo",
      });
      animate(".ha-fee-right", {
        opacity: [0, 1],
        translateX: [40, 0],
        duration: 700,
        delay: 120,
        ease: "outExpo",
      });
    });

    /* FAQ items */
    const ioFaq = observeOnce(".ha-faq", () => {
      animate(".ha-faq", {
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 550,
        delay: stagger(80),
        ease: "outExpo",
      });
    });

    /* Final CTA children */
    const ioCta = observeOnce(".ha-cta > *", () => {
      animate(".ha-cta > *", {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 650,
        delay: stagger(120),
        ease: "outExpo",
      });
    });

    return () => {
      ioStats?.disconnect();
      ioSteps?.disconnect();
      ioSubjects?.disconnect();
      ioFee?.disconnect();
      ioFaq?.disconnect();
      ioCta?.disconnect();
    };
  }, []);

  return null;
}
