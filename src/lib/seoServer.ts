// Lấy dữ liệu gia sư phía SERVER cho mục đích SEO (sitemap + generateMetadata).
// realApiClient chỉ chạy được ở browser (đọc token từ localStorage), nên ở server
// ta tự đăng nhập guest rồi gọi BE qua fetch. Mọi lỗi đều nuốt → fallback an toàn,
// build/SSR không bao giờ gãy vì BE chậm (Render cold start) hay sập.
// Chỉ import file này từ server (sitemap.ts, layout generateMetadata).

const BE_ORIGIN = (
  process.env.NEXT_PUBLIC_BE_ORIGIN ?? "https://liflow-be.onrender.com"
).replace(/\/$/, "");
const GUEST_EMAIL = process.env.NEXT_PUBLIC_GUEST_EMAIL ?? "parent1@tutor.com";
const GUEST_PASSWORD = process.env.NEXT_PUBLIC_GUEST_PASSWORD ?? "12345";

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

async function guestToken(): Promise<string | null> {
  const { signal, clear } = withTimeout(8000);
  try {
    const res = await fetch(`${BE_ORIGIN}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: GUEST_EMAIL, password: GUEST_PASSWORD }),
      signal,
      // Cache token 1h để không login lại mỗi lần render.
      next: { revalidate: 3600, tags: ["seo-token"] },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken?: string };
    return data?.accessToken ?? null;
  } catch {
    return null;
  } finally {
    clear();
  }
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
  const token = await guestToken();
  if (!token) return [];
  const { signal, clear } = withTimeout(8000);
  try {
    const res = await fetch(
      `${BE_ORIGIN}/api/tutors/tutors?page=1&size=200`,
      {
        headers: { Authorization: `Bearer ${token}` },
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
  const token = await guestToken();
  if (!token) return null;
  const { signal, clear } = withTimeout(8000);
  try {
    const res = await fetch(`${BE_ORIGIN}/api/tutors/${id}/details`, {
      headers: { Authorization: `Bearer ${token}` },
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
