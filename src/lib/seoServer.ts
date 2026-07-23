// Lấy dữ liệu gia sư phía SERVER cho mục đích SEO (sitemap + generateMetadata).
// realApiClient chỉ chạy được ở browser (đọc token từ localStorage), nên ở server
// ta gọi thẳng BE qua fetch tới các endpoint PUBLIC (/api/tutors/search,
// /api/tutors/*/details) — không cần đăng nhập. Mọi lỗi đều nuốt → fallback an
// toàn, build/SSR không bao giờ gãy vì BE chậm (Render cold start) hay sập.
// Chỉ import file này từ server (sitemap.ts, layout generateMetadata).

const BE_ORIGIN = (
  process.env.NEXT_PUBLIC_BE_ORIGIN ?? "https://liflow-be.onrender.com"
).replace(/\/$/, "");

export interface SeoTutor {
  id: string;
  fullName: string;
  bio: string;
  avatarUrl?: string;
  subjects: string[];
  pricePerHour: number;
  ratingAvg: number;
}

interface BeTutor {
  id: string;
  fullName?: string;
  description?: string;
  avatarUrl?: string;
  subjects?: string[];
  hourlyRate?: number;
  rating?: number;
}

// AbortController để không treo build nếu BE ngủ đông.
function withTimeout(ms: number): { signal: AbortSignal; clear: () => void } {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(id) };
}

function mapTutor(be: BeTutor): SeoTutor {
  return {
    id: be.id,
    fullName: be.fullName ?? "",
    bio: be.description ?? "",
    avatarUrl: be.avatarUrl || undefined,
    subjects: Array.isArray(be.subjects) ? be.subjects.filter(Boolean) : [],
    pricePerHour: be.hourlyRate ?? 0,
    ratingAvg: be.rating ?? 0,
  };
}

/** Danh sách gia sư công khai (để sinh URL trong sitemap). Lỗi → []. */
export async function getTutorsForSeo(): Promise<SeoTutor[]> {
  // /api/tutors/search KHÔNG kèm filter = toàn bộ gia sư, và là endpoint PUBLIC.
  // → không cần guest-login ở server: sitemap vẫn có URL gia sư kể cả khi BE đổi
  //   mật khẩu tài khoản demo hay login lỗi. (/tutors/tutors thì bắt buộc token.)
  const { signal, clear } = withTimeout(8000);
  try {
    const res = await fetch(
      `${BE_ORIGIN}/api/tutors/search?page=1&size=200`,
      {
        signal,
        next: { revalidate: 3600, tags: ["seo-tutors"] },
      },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: BeTutor[] };
    return (json.data ?? []).filter((t) => t?.id).map(mapTutor);
  } catch {
    return [];
  } finally {
    clear();
  }
}

/** Chi tiết 1 gia sư (cho generateMetadata trang /tutors/[id]). Lỗi → null. */
export async function getTutorForSeo(id: string): Promise<SeoTutor | null> {
  // /api/tutors/*/details là endpoint PUBLIC → không cần guest-login ở server.
  const { signal, clear } = withTimeout(8000);
  try {
    const res = await fetch(`${BE_ORIGIN}/api/tutors/${id}/details`, {
      signal,
      next: { revalidate: 3600, tags: [`seo-tutor-${id}`] },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: BeTutor };
    if (!json?.data?.id) return null;
    return mapTutor(json.data);
  } catch {
    return null;
  } finally {
    clear();
  }
}
