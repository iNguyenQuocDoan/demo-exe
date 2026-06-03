import type { Metadata } from "next";
import { SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { getTutorForSeo } from "@/lib/seoServer";

// Dữ liệu gia sư lấy best-effort phía server. BE chậm/sập → fallback metadata chung.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const canonical = `/tutors/${id}`;
  const t = await getTutorForSeo(id);

  if (!t || !t.fullName) {
    return {
      title: "Hồ sơ gia sư",
      description: `Xem hồ sơ gia sư, môn dạy, học phí và đánh giá trên ${SITE_NAME}.`,
      alternates: { canonical },
    };
  }

  const subjects = t.subjects.slice(0, 3).join(", ");
  const title = subjects
    ? `${t.fullName} – Gia sư ${subjects}`
    : `${t.fullName} – Gia sư`;
  const description =
    (t.bio && t.bio.trim().slice(0, 155)) ||
    `Đặt lịch học với gia sư ${t.fullName}${
      subjects ? ` (${subjects})` : ""
    } trên ${SITE_NAME}. Xem học phí, lịch trống và đánh giá từ phụ huynh.`;

  const ogImage = t.avatarUrl || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "profile",
      images: [{ url: ogImage, alt: t.fullName }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function TutorDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
