import { realApiClient } from "@/lib/realApiClient";
import type {
  FreeSlot,
  Review,
  TutorFilter,
  TutorProfile,
  PaginationParams,
  PaginationMeta,
} from "@/types";

// ── BE shapes ────────────────────────────────────────────────────────────────
interface BeTutorDetail {
  id: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  gender?: string;
  address?: string;
  dob?: string;
  avatarUrl?: string;
  description?: string;
  rating?: number;
  academicLevel?: string;
  major?: string;
  education?: string;
  experience?: number;
  hourlyRate?: number;
  subjects?: string[];
  certificateUrls?: string[];
}

interface BePageResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: T[];
}

interface BeApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

// BE avatarUrl thường null → fallback ảnh raster (PNG) để <Image> không lỗi empty src.
// Dùng PNG (không phải SVG) vì next/image chặn SVG khi không bật dangerouslyAllowSVG.
function avatarFallback(id: string): string {
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(id)}`;
}

function mapTutor(be: BeTutorDetail): TutorProfile {
  return {
    id: be.id,
    fullName: be.fullName ?? "",
    avatarUrl: be.avatarUrl || avatarFallback(be.id),
    bio: be.description ?? "",
    teachingMode: "OFFLINE",
    subjects: be.subjects ? Array.from(be.subjects) : [],
    grades: [],
    pricePerHour: be.hourlyRate ?? 0,
    profileStatus: "Approved",
    serviceAreas: { cityId: "", districtIds: [] },
    ratingAvg: be.rating ?? 0,
    reviewCount: 0,
    experience: be.experience != null ? String(be.experience) : "",
    education: be.education ?? "",
  };
}

function bePageToFe(
  page: BePageResponse<BeTutorDetail>,
): { tutors: TutorProfile[]; pagination: PaginationMeta } {
  return {
    tutors: (page.data ?? []).map(mapTutor),
    pagination: {
      page: page.currentPage,
      limit: page.pageSize,
      total: page.totalElements,
      totalPages: page.totalPages,
    },
  };
}

// ── Public API ───────────────────────────────────────────────────────────────
export async function getTutors(
  filter?: Partial<TutorFilter>,
): Promise<TutorProfile[]> {
  try {
    // BE phân biệt list vs search: có subject/address/gender/price → /search; else → /tutors/tutors
    const hasSearch =
      !!filter?.subjectId ||
      !!filter?.cityId ||
      !!filter?.districtId ||
      (filter?.minPrice ?? 0) > 0 ||
      (filter?.maxPrice ?? 0) > 0;

    const params: Record<string, string | number | undefined> = {
      page: 1,
      size: 100,
    };
    let url = "/tutors/tutors";

    if (hasSearch) {
      url = "/tutors/search";
      if (filter?.subjectId) params.subject = filter.subjectId;
      if (filter?.cityId || filter?.districtId) {
        params.address = [filter.cityId, filter.districtId].filter(Boolean).join(" ");
      }
      if (filter?.minPrice) params.minPrice = filter.minPrice;
      if (filter?.maxPrice) params.maxPrice = filter.maxPrice;
    }

    const { data } = await realApiClient.get<BePageResponse<BeTutorDetail>>(url, {
      params,
    });
    return (data.data ?? []).map(mapTutor);
  } catch {
    return [];
  }
}

export async function getTutorsPaginated(
  filter?: Partial<TutorFilter>,
  pagination?: PaginationParams,
): Promise<{ tutors: TutorProfile[]; pagination: PaginationMeta }> {
  try {
    const hasSearch =
      !!filter?.subjectId ||
      !!filter?.cityId ||
      !!filter?.districtId ||
      (filter?.minPrice ?? 0) > 0 ||
      (filter?.maxPrice ?? 0) > 0;

    const params: Record<string, string | number | undefined> = {
      page: pagination?.page ?? 1,
      size: pagination?.limit ?? 10,
    };
    let url = "/tutors/tutors";

    if (hasSearch) {
      url = "/tutors/search";
      if (filter?.subjectId) params.subject = filter.subjectId;
      if (filter?.cityId || filter?.districtId) {
        params.address = [filter.cityId, filter.districtId].filter(Boolean).join(" ");
      }
      if (filter?.minPrice) params.minPrice = filter.minPrice;
      if (filter?.maxPrice) params.maxPrice = filter.maxPrice;
    }

    const { data } = await realApiClient.get<BePageResponse<BeTutorDetail>>(url, {
      params,
    });
    return bePageToFe(data);
  } catch {
    return {
      tutors: [],
      pagination: { page: 1, limit: pagination?.limit ?? 10, total: 0, totalPages: 0 },
    };
  }
}

export async function getTutorById(id: string): Promise<TutorProfile | null> {
  try {
    const { data } = await realApiClient.get<BeApiResponse<BeTutorDetail>>(
      `/tutors/${id}/details`,
    );
    if (!data?.data) return null;
    return mapTutor(data.data);
  } catch {
    return null;
  }
}

interface BeSlotResponse {
  id: string;
  startTime: string; // ISO date-time
  endTime: string;
  status: string;
  hourlyRate: number;
}

// BE: GET /api/tutors/slots/{tutorId} → SlotResponse[] (slot do gia sư mở)
export async function getTutorAvailability(
  tutorId: string,
  fromDate: string,
  toDate: string,
): Promise<FreeSlot[]> {
  try {
    const { data } = await realApiClient.get<BeSlotResponse[]>(
      `/tutors/slots/${tutorId}`,
    );
    const from = new Date(fromDate);
    const to = new Date(toDate + "T23:59:59");
    return (data ?? [])
      .filter((s) => (s.status ?? "").toUpperCase() === "AVAILABLE")
      .filter((s) => {
        const t = new Date(s.startTime);
        return t >= from && t <= to;
      })
      .map((s) => {
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);
        const dur = Math.round((end.getTime() - start.getTime()) / 60000);
        return {
          date: start.toISOString().slice(0, 10),
          startTime: start.toTimeString().slice(0, 5),
          endTime: end.toTimeString().slice(0, 5),
          duration: dur,
          tutorId,
          slotId: s.id,
        } as FreeSlot & { slotId?: string };
      });
  } catch {
    return [];
  }
}

// BE: tất cả slot (cả ACTIVE và BOOKED) — tutor's own schedule view
export async function getTutorAllSlots(
  tutorId: string,
): Promise<BeSlotResponse[]> {
  try {
    const { data } = await realApiClient.get<BeSlotResponse[]>(
      `/tutors/slots/${tutorId}`,
    );
    return data ?? [];
  } catch {
    return [];
  }
}

// ── Reviews — BE: GET /api/feedback/tutor/{tutorId} → ApiResponse<Page<ReviewResponse>>
interface BeReviewResponse {
  id: string;
  parentFullName?: string;
  rating: number;
  comment?: string;
  reply?: string;
  createdAt: string;
}

export function mapBeReview(be: BeReviewResponse, tutorId: string): Review {
  return {
    id: be.id,
    parentId: "",
    tutorId,
    bookingId: "",
    rating: be.rating ?? 0,
    comment: be.comment ?? "",
    createdAt: be.createdAt,
    parentName: be.parentFullName ?? "Phụ huynh",
    tutorReply: be.reply
      ? { text: be.reply, repliedAt: be.createdAt }
      : undefined,
  };
}

export async function getReviews(tutorId: string): Promise<Review[]> {
  try {
    const { data } = await realApiClient.get<
      BeApiResponse<BePageResponse<BeReviewResponse>>
    >(`/feedback/tutor/${tutorId}`, { params: { page: 1, size: 100 } });
    // Đánh giá mới nhất lên đầu. BE trả `createdAt` có thể null + xếp cũ→mới,
    // nên: ưu tiên createdAt giảm dần; nếu không có createdAt thì đảo thứ tự BE
    // (review mới được BE thêm vào cuối danh sách).
    return (data?.data?.data ?? [])
      .map((r, index) => ({ review: mapBeReview(r, tutorId), index }))
      .sort((a, b) => {
        const ta = a.review.createdAt ? new Date(a.review.createdAt).getTime() : NaN;
        const tb = b.review.createdAt ? new Date(b.review.createdAt).getTime() : NaN;
        if (!Number.isNaN(ta) && !Number.isNaN(tb)) return tb - ta;
        return b.index - a.index;
      })
      .map((x) => x.review);
  } catch {
    return [];
  }
}

// BE: PUT /api/tutors/tutor/profile (multipart) — data + optional certificate files
export async function updateTutorProfile(
  _id: string,
  updates: Partial<TutorProfile> & { certificateFiles?: File[] },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const form = new FormData();
    const payload: Record<string, unknown> = {};
    if (updates.bio != null) payload.description = updates.bio;
    if (updates.pricePerHour != null) payload.hourlyRate = updates.pricePerHour;
    if (updates.experience != null) {
      const n = Number(updates.experience);
      if (!Number.isNaN(n)) payload.experience = n;
    }
    if (updates.education != null) payload.education = updates.education;
    form.append(
      "data",
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );
    (updates.certificateFiles ?? []).forEach((f) =>
      form.append("certificate", f),
    );
    await realApiClient.put("/tutors/tutor/profile", form);
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data
        ?.message ??
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
      "Không thể cập nhật hồ sơ";
    return { ok: false, error: msg };
  }
}

// BE: POST /api/tutors/tutors/{id}/approve (ADMIN)
export async function approveTutor(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await realApiClient.post(`/tutors/tutors/${id}/approve`);
    return { ok: true };
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
    return { ok: false, error: msg ?? "Không thể duyệt gia sư" };
  }
}

// BE: POST /api/tutors/tutors/{id}/reject?reason=... (ADMIN)
export async function rejectTutor(
  id: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await realApiClient.post(`/tutors/tutors/${id}/reject`, null, {
      params: { reason },
    });
    return { ok: true };
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
    return { ok: false, error: msg ?? "Không thể từ chối gia sư" };
  }
}

// BE: GET /api/tutors/pending (ADMIN)
export async function getPendingTutors(
  pagination?: PaginationParams,
): Promise<{ tutors: TutorProfile[]; pagination: PaginationMeta }> {
  try {
    const { data } = await realApiClient.get<BePageResponse<BeTutorDetail>>(
      "/tutors/pending",
      {
        params: {
          pageNo: pagination?.page ?? 1,
          pageSize: pagination?.limit ?? 10,
        },
      },
    );
    return bePageToFe(data);
  } catch {
    return {
      tutors: [],
      pagination: { page: 1, limit: pagination?.limit ?? 10, total: 0, totalPages: 0 },
    };
  }
}

// BE: DELETE /api/tutors/profile/certificates?url=... (TUTOR)
export async function removeTutorCertificate(
  url: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await realApiClient.delete("/tutors/profile/certificates", {
      params: { url },
    });
    return { ok: true };
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
    return { ok: false, error: msg ?? "Không thể xoá chứng chỉ" };
  }
}
