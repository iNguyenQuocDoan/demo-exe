import type { NextConfig } from "next";

// Lưu ý: việc proxy /api/be/* → BE đã chuyển sang Route Handler
// src/app/api/be/[...slug]/route.ts (có retry ECONNRESET, ổn định hơn rewrites()).

// ── Site URL cho SEO (canonical / sitemap / robots / Open Graph) ──────────────
// Thứ tự ưu tiên (tính lúc build, inline cho cả server lẫn client):
//   1. NEXT_PUBLIC_SITE_URL đặt tay  → custom domain bạn tự khai báo
//   2. VERCEL_PROJECT_PRODUCTION_URL → Vercel tự cấp (domain production ổn định,
//      tự chuyển sang custom domain nếu bạn gắn — KHÔNG đổi theo từng deploy)
//   3. http://localhost:3000         → chạy local
// → Deploy Vercel là tự đúng domain, không cần cấu hình gì thêm.
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "") ||
  "http://localhost:3000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SITE_URL: SITE_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/drvj0roi1/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
