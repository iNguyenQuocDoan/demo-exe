// Trung tâm cấu hình SEO cho LIFLOW.
// Đặt NEXT_PUBLIC_SITE_URL = domain thật khi deploy (vd https://liflow.vn)
// để canonical / sitemap / Open Graph trỏ đúng địa chỉ production.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://liflow.vn"
).replace(/\/$/, "");

export const SITE_NAME = "LIFLOW";

export const SITE_TAGLINE = "Kết nối Gia sư & Phụ huynh";

export const SITE_DESCRIPTION =
  "LIFLOW – nền tảng tìm và đặt lịch gia sư uy tín tại Việt Nam. " +
  "Lọc gia sư theo môn học, quận/huyện, học phí; đặt lịch học linh hoạt và " +
  "quản lý lịch học định kỳ chỉ trong vài bước.";

// Ảnh mặc định cho Open Graph / Twitter (đã có sẵn trong /public).
export const DEFAULT_OG_IMAGE = "/landing.jpg";

export const SITE_LOCALE = "vi_VN";

// Từ khoá chính – dùng cho thẻ <meta name="keywords"> (bổ trợ, không quyết định ranking).
export const SITE_KEYWORDS = [
  "gia sư",
  "tìm gia sư",
  "thuê gia sư",
  "gia sư tại nhà",
  "gia sư online",
  "dạy kèm",
  "đặt lịch gia sư",
  "gia sư uy tín",
  "LIFLOW",
];

/** Ghép URL tuyệt đối từ một path tương đối. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// ─── JSON-LD builders ─────────────────────────────────────────────────────────

/** Tổ chức – hiển thị thông tin thương hiệu trong Knowledge Panel của Google. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    description: SITE_DESCRIPTION,
    email: "support@liflow.vn",
    areaServed: "VN",
    sameAs: [] as string[],
  };
}

/** WebSite + ô tìm kiếm (Sitelinks Search Box) trỏ tới trang tìm gia sư. */
export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "vi-VN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/tutors?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Chuỗi breadcrumb cho rich result. `items` = [{name, url}]. */
export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.url),
    })),
  };
}

/** FAQPage – giúp Google hiển thị câu hỏi/đáp ngay trên kết quả tìm kiếm. */
export function faqJsonLd(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

interface TutorJsonLdInput {
  id: string;
  fullName: string;
  bio?: string;
  avatarUrl?: string;
  subjects?: string[];
  pricePerHour?: number;
  ratingAvg?: number;
  reviewCount?: number;
}

/**
 * Service (dịch vụ dạy kèm của 1 gia sư) + AggregateRating + Offer.
 * Dùng Service thay vì Person để mô tả rõ "dịch vụ gia sư có giá".
 */
export function tutorJsonLd(t: TutorJsonLdInput) {
  const url = absoluteUrl(`/tutors/${t.id}`);
  const subjects = (t.subjects ?? []).filter(Boolean);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": url,
    serviceType: "Dạy kèm / Gia sư",
    name: subjects.length
      ? `Gia sư ${subjects.join(", ")} – ${t.fullName}`
      : `Gia sư ${t.fullName}`,
    url,
    description: t.bio || `Hồ sơ gia sư ${t.fullName} trên ${SITE_NAME}.`,
    image: t.avatarUrl,
    areaServed: { "@type": "Country", name: "Việt Nam" },
    provider: {
      "@type": "Person",
      name: t.fullName,
      image: t.avatarUrl,
    },
    brand: { "@type": "Brand", name: SITE_NAME },
  };

  if (t.pricePerHour && t.pricePerHour > 0) {
    data.offers = {
      "@type": "Offer",
      price: Math.round(t.pricePerHour),
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      url,
    };
  }

  if (t.ratingAvg && t.ratingAvg > 0 && (t.reviewCount ?? 0) > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(t.ratingAvg.toFixed(1)),
      reviewCount: t.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return data;
}
