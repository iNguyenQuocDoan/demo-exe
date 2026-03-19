"use client";

import { useEffect } from "react";
import { animate, stagger } from "animejs";

function observeEachOnce(
  selector: string,
  onEnter: (element: HTMLElement, index: number) => void,
  threshold = 0.12
) {
  const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
  if (!elements.length) return null;

  const elementIndexMap = new Map<HTMLElement, number>();
  elements.forEach((element, index) => {
    elementIndexMap.set(element, index);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        const index = elementIndexMap.get(element) ?? 0;
        onEnter(element, index);
        observer.unobserve(element);
      });
    },
    { threshold }
  );

  elements.forEach((element) => observer.observe(element));
  return observer;
}

function revealWithoutMotion() {
  const nodes = document.querySelectorAll<HTMLElement>(
    ".pa-hero, .pa-kpi, .pa-section, .pa-list-item, .pa-hero-actions > *"
  );
  nodes.forEach((node) => {
    node.style.opacity = "1";
    node.style.transform = "none";
  });
}

export function PageAnimations() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealWithoutMotion();
      return;
    }

    animate(".pa-hero", {
      opacity: [0, 1],
      translateY: [22, 0],
      duration: 560,
      ease: "outExpo",
    });

    animate(".pa-hero-actions > *", {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 520,
      delay: stagger(70),
      ease: "outExpo",
    });

    const observers: IntersectionObserver[] = [];

    const kpiObserver = observeEachOnce(
      ".pa-kpi",
      (element, index) => {
        animate(element, {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 500,
          delay: Math.min(index * 45, 220),
          ease: "outExpo",
        });
      },
      0.25
    );
    if (kpiObserver) observers.push(kpiObserver);

    const sectionObserver = observeEachOnce(".pa-section", (element) => {
      animate(element, {
        opacity: [0, 1],
        translateY: [22, 0],
        duration: 560,
        ease: "outExpo",
      });
    });
    if (sectionObserver) observers.push(sectionObserver);

    const listObserver = observeEachOnce(
      ".pa-list-item",
      (element, index) => {
        animate(element, {
          opacity: [0, 1],
          translateY: [14, 0],
          duration: 440,
          delay: index < 12 ? index * 30 : 0,
          ease: "outQuad",
        });
      },
      0.06
    );
    if (listObserver) observers.push(listObserver);

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return null;
}
