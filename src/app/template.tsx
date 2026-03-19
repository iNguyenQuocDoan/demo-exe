"use client";
import { useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Scroll to top when template mounts (on every route change)
    window.scrollTo(0, 0);
  }, []);

  return <>{children}</>;
}
