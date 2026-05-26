import type { NextConfig } from "next";

const BE_ORIGIN = process.env.NEXT_PUBLIC_BE_ORIGIN ?? "http://localhost:8080";

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
  async rewrites() {
    return [
      {
        source: "/api/be/:path*",
        destination: `${BE_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
