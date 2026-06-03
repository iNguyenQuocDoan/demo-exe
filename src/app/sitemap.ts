import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getTutorsForSeo } from "@/lib/seoServer";

// Regen sitemap mỗi giờ (dữ liệu gia sư lấy best-effort, lỗi → chỉ còn route tĩnh).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${SITE_URL}/tutors`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/apply-tutor`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const tutors = await getTutorsForSeo();
  const tutorRoutes: MetadataRoute.Sitemap = tutors.map((t) => ({
    url: `${SITE_URL}/tutors/${t.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...tutorRoutes];
}
