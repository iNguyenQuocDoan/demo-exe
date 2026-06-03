import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// /robots.txt – cho phép index trang công khai, chặn khu vực riêng tư & API.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/parent/",
          "/tutor/", // khu vực gia sư đã đăng nhập (KHÁC /tutors công khai)
          "/auth/",
          "/tutor-application",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
