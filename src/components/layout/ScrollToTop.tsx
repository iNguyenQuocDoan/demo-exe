"use client";
import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

const SCROLL_ROOT_SELECTOR = "[data-scroll-root]";

function resetScrollPosition() {
  window.scrollTo({ top: 0, left: 0 });
  document.scrollingElement?.scrollTo({ top: 0, left: 0 });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const scrollRoots = document.querySelectorAll<HTMLElement>(SCROLL_ROOT_SELECTOR);
  scrollRoots.forEach((root) => {
    root.scrollTop = 0;
    root.scrollLeft = 0;
  });
}

/**
 * ScrollToTop - Automatically scrolls to top when route changes
 * This improves UX by ensuring users always start at the top of new pages
 */
export function ScrollToTop() {
  const pathname = usePathname();

  // Use useLayoutEffect to scroll before browser paint
  useLayoutEffect(() => {
    resetScrollPosition();
  }, [pathname]);

  // Fallback with useEffect for async rendering and nested scroll containers
  useEffect(() => {
    const frame = requestAnimationFrame(resetScrollPosition);
    const timer = window.setTimeout(resetScrollPosition, 40);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
