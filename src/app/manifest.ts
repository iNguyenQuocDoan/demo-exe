import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/seo";

// Web App Manifest (PWA) – tên, màu thương hiệu, icon khi "Add to Home Screen".
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} – ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d4ed8",
    lang: "vi",
    categories: ["education"],
    icons: [
      { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
