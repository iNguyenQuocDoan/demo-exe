import { realApiClient } from "@/lib/realApiClient";
import { getSubjectMap } from "@/api/referenceApi";
import { toHttpsUrl } from "@/lib/utils";
import type {
  FreeSlot,
  Review,
  TutorFilter,
  TutorProfile,
  PaginationParams,
  PaginationMeta,
} from "@/types";

// ── BE shapes ────────────────────────────────────────────────────────────────
export type TutorVerificationStatus = "NOT_VERIFIED" | "PENDING" | "APPROVED" | "REJECTED";

export interface BeTutorDetail {
  id: string;
  userId?: string; // UUID của user thật liên kết với profile này
  accountId?: string; // Trường thay thế nếu BE dùng accountId
  user?: {
    id: string;
  };
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  gender?: string;
  city?: string;
  district?: string;
  detail?: string;
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
  verificationStatus?: TutorVerificationStatus;
  rejectionReason?: string;
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
    userId: be.userId || be.accountId || be.user?.id,
    fullName: be.fullName ?? "",
    avatarUrl: toHttpsUrl(be.avatarUrl) || avatarFallback(be.id),
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
function isSearch(filter?: Partial<TutorFilter>): boolean {
  return (
    !!filter?.subjectId ||
    !!filter?.cityId ||
    !!filter?.districtId ||
    (filter?.minPrice ?? 0) > 0 ||
    (filter?.maxPrice ?? 0) > 0
  );
}

function searchParams(filter?: Partial<TutorFilter>): Record<string, string | number | undefined> {
  const params: Record<string, string | number | undefined> = {};
  if (filter?.subjectId) params.subject = filter.subjectId;
  if (filter?.cityId || filter?.districtId) {
    params.address = [filter.cityId, filter.districtId].filter(Boolean).join(" ");
  }
  if (filter?.minPrice) params.minPrice = filter.minPrice;
  if (filter?.maxPrice) params.maxPrice = filter.maxPrice;
  return params;
}

// Danh sách gia sư đầy đủ = /tutors/search KHÔNG kèm filter. Mọi tiêu chí của
// /search đều optional → BE chỉ còn lọc role=TUTOR → trả về TẤT CẢ gia sư (giống
// hệt /tutors/tutors). Dùng /search thay cho /tutors/tutors vì 2 lý do:
//   1. /tutors/search là endpoint PUBLIC (permitAll ở BE) → khách CHƯA đăng nhập
//      xem được list mà KHÔNG cần guest-token. Còn /tutors/tutors bắt buộc Bearer
//      token → guest bị 302 về login (đã kiểm chứng trên BE live).
//   2. /search null-safe (bỏ qua record có tutorProfile=null) → không 500 vì record
//      rác, khác /tutors/tutors (map subjects không check null → sập nguyên trang).
async function fetchAllTutors(size = 200): Promise<TutorProfile[]> {
  try {
    const { data } = await realApiClient.get<BePageResponse<BeTutorDetail>>(
      "/tutors/search",
      { params: { page: 1, size } },
    );
    return (data.data ?? []).map(mapTutor);
  } catch {
    // /search lỗi cấp trang (mất mạng / Render sập) → thử vớt từng item một.
    return fetchTutorsPerItem(size);
  }
}

// Fallback phòng thủ khi lấy nguyên trang thất bại: lấy từng item (size=1) và nuốt
// lỗi lẻ, để /tutors vẫn hiện được phần gia sư còn lấy được thay vì rỗng.
async function fetchTutorsPerItem(max: number): Promise<TutorProfile[]> {
  let first: BePageResponse<BeTutorDetail>;
  try {
    first = (
      await realApiClient.get<BePageResponse<BeTutorDetail>>("/tutors/search", {
        params: { page: 1, size: 1 },
      })
    ).data;
  } catch {
    return []; // ngay cả 1 item cũng lỗi → coi như không có dữ liệu
  }
  const total = Math.min(first.totalElements ?? 0, max);
  const firstTutor = first.data?.[0];
  if (total <= 1) return firstTutor ? [mapTutor(firstTutor)] : [];

  // Với size=1, page N = gia sư thứ N. Lấy song song các trang còn lại, nuốt lỗi lẻ.
  const rest = await Promise.all(
    Array.from({ length: total - 1 }, (_, i) =>
      realApiClient
        .get<BePageResponse<BeTutorDetail>>("/tutors/search", {
          params: { page: i + 2, size: 1 },
        })
        .then((r) => r.data.data?.[0])
        .catch(() => undefined),
    ),
  );

  return [firstTutor, ...rest]
    .filter((t): t is BeTutorDetail => Boolean(t))
    .map(mapTutor);
}

// Lọc client-side khi `/tutors/search` của BE lỗi (Render hay 500 endpoint search).
// Lưu ý: lọc được theo MÔN (id/tên) + KHOẢNG GIÁ; KHÔNG lọc được khu vực vì
// TutorDetailResponse sau mapTutor không còn city/district.
async function clientFilterTutors(
  all: TutorProfile[],
  filter?: Partial<TutorFilter>,
): Promise<TutorProfile[]> {
  if (!filter) return all;
  let subjectName: string | undefined;
  if (filter.subjectId) {
    const map = await getSubjectMap().catch(() => ({} as Record<string, string>));
    subjectName = map[filter.subjectId];
  }
  return all.filter((t) => {
    if (filter.subjectId) {
      const hit =
        t.subjects.includes(filter.subjectId) ||
        (subjectName ? t.subjects.includes(subjectName) : false);
      if (!hit) return false;
    }
    if (filter.minPrice && t.pricePerHour < filter.minPrice) return false;
    if (filter.maxPrice && t.pricePerHour > filter.maxPrice) return false;
    return true;
  });
}

export async function getTutors(
  filter?: Partial<TutorFilter>,
): Promise<TutorProfile[]> {
  // Lưu ý: KHÔNG nuốt lỗi máy chủ ở đây. Nếu BE trả 500 (vd /api/tutors/search
  // đang lỗi), ta để lỗi nổi lên để trang /tutors hiện đúng trạng thái "Không thể
  // kết nối máy chủ + Thử lại", thay vì hiểu nhầm thành "không có gia sư nào".
  // BE trả 200 với data rỗng vẫn cho ra [] (đúng nghĩa "không có kết quả").
  if (isSearch(filter)) {
    try {
      const { data } = await realApiClient.get<BePageResponse<BeTutorDetail>>(
        "/tutors/search",
        { params: { page: 1, size: 100, ...searchParams(filter) } },
      );
      return (data.data ?? []).map(mapTutor);
    } catch {
      // /tutors/search lỗi (Render) → thử danh sách đầy đủ rồi lọc client-side.
      // Nếu danh sách đầy đủ cũng lỗi → ném ra để trang hiện trạng thái lỗi.
      return clientFilterTutors(await fetchAllTutors(), filter);
    }
  }
  return await fetchAllTutors(100);
}

export async function getTutorsPaginated(
  filter?: Partial<TutorFilter>,
  pagination?: PaginationParams,
): Promise<{ tutors: TutorProfile[]; pagination: PaginationMeta }> {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 10;
  try {
    if (isSearch(filter)) {
      try {
        const { data } = await realApiClient.get<BePageResponse<BeTutorDetail>>(
          "/tutors/search",
          { params: { page, size: limit, ...searchParams(filter) } },
        );
        return bePageToFe(data);
      } catch {
        // Fallback: lấy toàn bộ, lọc + phân trang client-side.
        const filtered = await clientFilterTutors(await fetchAllTutors(200), filter);
        const start = (page - 1) * limit;
        return {
          tutors: filtered.slice(start, start + limit),
          pagination: {
            page,
            limit,
            total: filtered.length,
            totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
          },
        };
      }
    }
    // Danh sách không lọc = /tutors/search rỗng filter (public + null-safe). Xem
    // ghi chú ở fetchAllTutors về lý do không dùng /tutors/tutors.
    const { data } = await realApiClient.get<BePageResponse<BeTutorDetail>>(
      "/tutors/search",
      { params: { page, size: limit } },
    );
    return bePageToFe(data);
  } catch {
    return {
      tutors: [],
      pagination: { page: 1, limit, total: 0, totalPages: 0 },
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

// ── GET /api/tutors/my-profile — hồ sơ tutor của user đang đăng nhập ─────────
// Parent dùng API này để xem trạng thái hồ sơ đăng ký tutor.
export async function getMyTutorProfile(): Promise<BeTutorDetail | null> {
  try {
    // BE /tutors/my-profile trả RAW TutorDetailResponse (KHÔNG bọc {data} như /details).
    // data.data ?? data → hỗ trợ cả raw lẫn (phòng khi BE bọc lại) wrapped.
    const { data } = await realApiClient.get<
      BeTutorDetail & { data?: BeTutorDetail }
    >("/tutors/my-profile");
    const profile = data?.data ?? data;
    return profile?.id ? profile : null;
  } catch {
    return null;
  }
}

// ── GET /api/tutors/pending/{id} — Admin xem chi tiết hồ sơ chờ duyệt ────────
export async function getPendingTutorDetail(
  id: string,
): Promise<BeTutorDetail | null> {
  try {
    // BE /tutors/pending/{id} trả RAW TutorDetailResponse (không bọc {data}).
    const { data } = await realApiClient.get<
      BeTutorDetail & { data?: BeTutorDetail }
    >(`/tutors/pending/${id}`);
    const profile = data?.data ?? data;
    return profile?.id ? profile : null;
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

// ── UpdateTutorProfileRequest (theo Swagger BE) ───────────────────────────────
// Chỉ 7 fields — KHÔNG gồm fullName/phoneNumber/gender/city/district/dob/detail
// (những field đó thuộc PUT /api/users/profile)
export interface UpdateTutorProfilePayload {
  description?: string;
  hourlyRate?: number;
  experience?: number;      // int32
  academicLevelId?: number; // int64 — numeric ID, KHÔNG phải tên string
  major?: string;
  education?: string;
  subjectIds?: number[];    // int64[] — numeric IDs, KHÔNG phải tên string
}

// ── UpdateProfileRequest (theo Swagger BE) — dùng cho PUT /api/users/profile ─
export interface UpdateUserProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  gender?: string;          // MALE | FEMALE | OTHER
  city?: string;            // province code string
  district?: string;        // district code string
  detail?: string;
  dob?: string;             // format: date (YYYY-MM-DD)
}

// BE: PUT /api/users/profile (multipart JSON blob) — cập nhật thông tin cá nhân
export async function updateUserProfile(
  payload: UpdateUserProfilePayload,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const form = new FormData();
    form.append(
      "data",
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );
    await realApiClient.put("/users/profile", form);
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data
        ?.message ??
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
      "Không thể cập nhật thông tin cá nhân";
    return { ok: false, error: msg };
  }
}

// BE: PUT /api/tutors/tutor/profile (multipart) — cập nhật hồ sơ tutor
// Chỉ gửi đúng UpdateTutorProfileRequest fields: description, hourlyRate, experience,
// academicLevelId (số), major, education, subjectIds (mảng số) + certificate files
export async function updateTutorProfile(
  _id: string,
  updates: Partial<TutorProfile> & {
    certificateFiles?: File[];
    // Đúng field names từ BE Swagger:
    academicLevelId?: number; // int64 ID
    subjectIds?: number[];    // int64[] IDs
    major?: string;
  },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const form = new FormData();
    // Chỉ map đúng 7 fields của UpdateTutorProfileRequest
    const payload: UpdateTutorProfilePayload = {};
    if (updates.bio != null) payload.description = updates.bio;
    if (updates.pricePerHour != null) payload.hourlyRate = updates.pricePerHour;
    if (updates.experience != null) {
      const n = Number(updates.experience);
      if (!Number.isNaN(n)) payload.experience = n;
    }
    if (updates.education != null) payload.education = updates.education;
    if (updates.major != null) payload.major = updates.major;
    if (updates.academicLevelId != null) payload.academicLevelId = updates.academicLevelId;
    if (updates.subjectIds != null && updates.subjectIds.length > 0) {
      payload.subjectIds = updates.subjectIds;
    }
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
      "Không thể cập nhật hồ sơ gia sư";
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
): Promise<{ tutors: BeTutorDetail[]; pagination: PaginationMeta }> {
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
    return {
      tutors: data.data ?? [],
      pagination: {
        page: data.currentPage ?? 1,
        limit: data.pageSize ?? (pagination?.limit ?? 10),
        total: data.totalElements ?? 0,
        totalPages: data.totalPages ?? 0,
      },
    };
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
