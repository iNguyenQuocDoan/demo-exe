import type { NextConfig } from "next";

// Lưu ý: việc proxy /api/be/* → BE đã chuyển sang Route Handler
// src/app/api/be/[...slug]/route.ts (có retry ECONNRESET, ổn định hơn rewrites()).

const nextConfig: NextConfig = {
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
