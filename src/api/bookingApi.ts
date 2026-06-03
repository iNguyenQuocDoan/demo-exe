import { realApiClient } from "@/lib/realApiClient";
import type {
  Booking,
  QualityFeedback,
  ScheduleSeries,
  PaginationParams,
  PaginationMeta,
} from "@/types";

export interface CreateBookingInput {
  tutorId: string;
  startAt: string;
  endAt: string;
  subject: string;
  subjectName?: string;
  grade: string;
  teachingMode: string;
  studentName?: string;
  notes?: string;
  location?: string;
  baseAmount: number;
  parentGoal?: string;
  goalTags?: string[];
  /** Nếu FE đã chọn được slotId của BE thì truyền vào để gọi /book/{slotId} */
  slotId?: string;
}

export interface CreateSeriesInput {
  tutorId: string;
  daysOfWeek: number[];
  startTime: string;
  durationMinutes: number;
  startDate: string;
  occurrenceCount: number;
  subject: string;
  grade: string;
  teachingMode: string;
  studentName?: string;
  baseAmountPerSession: number;
}

interface BeBookingResponse {
  bookingId: string;
  message?: string;
  tutorName?: string;
  startTime?: string;
  endTime?: string;
  totalPrice?: number;
  status?: string;
}

interface BePageResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: T[];
}

function mapBeStatus(s: string | undefined): Booking["status"] {
  const v = (s ?? "").toUpperCase();
  if (v.includes("CONFIRM") || v.includes("ACCEPT")) return "Confirmed";
  if (v.includes("PROGRESS")) return "InProgress";
  if (v.includes("COMPLET")) return "Completed";
  if (v.includes("CANCEL")) return "Cancelled";
  if (v.includes("DISPUT")) return "Disputed";
  if (v.includes("RESOLV")) return "Resolved";
  if (v.includes("AWAIT")) return "AwaitingPayment";
  return "Pending";
}

function getCurrentUser(): { id?: string; role?: string } {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("auth_user") ?? "{}");
  } catch {
    return {};
  }
}

function mapBeBooking(be: BeBookingResponse, fallbackTutorId = ""): Booking {
  const me = getCurrentUser();
  return {
    id: be.bookingId,
    type: "NORMAL",
    parentId: me.role === "parent" ? me.id ?? "" : "",
    tutorId: fallbackTutorId,
    startAt: be.startTime ?? "",
    endAt: be.endTime ?? "",
    baseAmount: be.totalPrice ?? 0,
    platformFee: 0,
    totalAmount: be.totalPrice ?? 0,
    status: mapBeStatus(be.status),
    teachingMode: "OFFLINE",
  };
}

// BE: GET /api/bookings/history?page=&size=&role=PARENT|TUTOR&startDate=&endDate=
// role MUST khớp với vai trò user đang đăng nhập (BE check JWT — sai role → 500)
function myBeRole(): "PARENT" | "TUTOR" | null {
  const me = getCurrentUser();
  if (me.role === "tutor") return "TUTOR";
  if (me.role === "parent") return "PARENT";
  return null;
}

export async function getBookings(_params: {
  parentId?: string;
  tutorId?: string;
}): Promise<Booking[]> {
  const role = myBeRole();
  if (!role) return [];
  try {
    const { data } = await realApiClient.get<BePageResponse<BeBookingResponse>>(
      "/bookings/history",
      { params: { page: 1, size: 100, role } },
    );
    return (data.data ?? []).map((b) => mapBeBooking(b, ""));
  } catch {
    return [];
  }
}

export async function getBookingsPaginated(
  _params: { parentId?: string; tutorId?: string; status?: string },
  pagination?: PaginationParams,
): Promise<{ bookings: Booking[]; pagination: PaginationMeta }> {
  const role = myBeRole();
  const emptyPage = {
    bookings: [],
    pagination: {
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? 10,
      total: 0,
      totalPages: 0,
    },
  };
  if (!role) return emptyPage;
  try {
    const { data } = await realApiClient.get<BePageResponse<BeBookingResponse>>(
      "/bookings/history",
      {
        params: {
          page: pagination?.page ?? 1,
          size: pagination?.limit ?? 10,
          role,
        },
      },
    );
    return {
      bookings: (data.data ?? []).map((b) => mapBeBooking(b, "")),
      pagination: {
        page: data.currentPage,
        limit: data.pageSize,
        total: data.totalElements,
        totalPages: data.totalPages,
      },
    };
  } catch {
    return emptyPage;
  }
}

// BE: POST /api/bookings/book/{slotId} — phải có slotId, không hỗ trợ booking theo startAt/endAt tự do
export async function createBooking(
  input: CreateBookingInput,
): Promise<{ ok: boolean; booking?: Booking; error?: string }> {
  if (!input.slotId) {
    return {
      ok: false,
      error:
        "Đặt lịch phải chọn 1 slot do gia sư mở. Vui lòng chọn khung giờ ở trang chi tiết gia sư.",
    };
  }
  try {
    const { data } = await realApiClient.post<BeBookingResponse>(
      `/bookings/book/${input.slotId}`,
    );
    return {
      ok: true,
      booking: {
        id: data.bookingId,
        type: "NORMAL",
        parentId: "",
        tutorId: input.tutorId,
        startAt: data.startTime ?? input.startAt,
        endAt: input.endAt,
        baseAmount: data.totalPrice ?? input.baseAmount,
        platformFee: 0,
        totalAmount: data.totalPrice ?? input.baseAmount,
        status: "Pending",
        subject: input.subject,
        grade: input.grade,
        teachingMode: "OFFLINE",
        studentName: input.studentName,
        parentGoal: input.parentGoal,
        goalTags: input.goalTags,
      },
    };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Không thể đặt lịch";
    return { ok: false, error: msg };
  }
}

async function bookingAction(
  id: string,
  action: "accept" | "reject" | "complete" | "cancel" | "tutor-complete",
): Promise<{ ok: boolean; error?: string }> {
  try {
    await realApiClient.post(`/bookings/${id}/${action}`);
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Thao tác thất bại";
    return { ok: false, error: msg };
  }
}

export const acceptBooking = (id: string) => bookingAction(id, "accept");
export const rejectBooking = (id: string) => bookingAction(id, "reject");
// Phụ huynh xác nhận hoàn thành (POST /bookings/{id}/complete)
export const completeBooking = (id: string) => bookingAction(id, "complete");
// Gia sư xác nhận hoàn thành (POST /bookings/{id}/tutor-complete).
// LƯU Ý BE: chỉ hoàn thành được buổi đã qua giờ học (buổi tương lai → 500).
export const tutorCompleteBooking = (id: string) => bookingAction(id, "tutor-complete");
export const cancelBooking = (
  id: string,
  _cancelBy?: string,
  _reason?: string,
) => bookingAction(id, "cancel");

// FE còn 1 chỗ gọi startBooking — BE không có endpoint start, giữ no-op success
export const startBooking = async (
  _id: string,
): Promise<{ ok: boolean; error?: string }> => ({ ok: true });

// BE: POST /api/bookings/slots (TUTOR) — body SlotRequest:
//   { startTime: "HH:mm:ss" (LocalTime), endTime: "HH:mm:ss", startDate: "yyyy-MM-dd", numberOfWeeks }
// Tạo slot lặp lại hàng tuần từ startDate, trong numberOfWeeks tuần.
export async function createTutorSlots(input: {
  startTime: string; // "HH:mm:ss" hoặc "HH:mm"
  endTime: string;
  startDate: string; // "yyyy-MM-dd"
  numberOfWeeks?: number;
}): Promise<{ ok: boolean; error?: string }> {
  const toLocalTime = (t: string) => (t.length === 5 ? `${t}:00` : t); // "HH:mm" → "HH:mm:ss"
  try {
    await realApiClient.post("/bookings/slots", {
      startTime: toLocalTime(input.startTime),
      endTime: toLocalTime(input.endTime),
      startDate: input.startDate,
      numberOfWeeks: input.numberOfWeeks ?? 1,
    });
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Không thể tạo slot";
    return { ok: false, error: msg };
  }
}

// ── Series: BE chưa có endpoint định kỳ ──────────────────────────────────────
export async function getSeries(_params: {
  parentId?: string;
  tutorId?: string;
}): Promise<ScheduleSeries[]> {
  return [];
}

export async function previewSeries(_input: CreateSeriesInput): Promise<Booking[]> {
  return [];
}

export async function createSeries(_input: CreateSeriesInput): Promise<{
  ok: boolean;
  series?: ScheduleSeries;
  sessions?: Booking[];
  conflicts?: Booking[];
  error?: string;
}> {
  return { ok: false, error: "BE chưa hỗ trợ lịch định kỳ" };
}

export async function acceptSeries(
  _seriesId: string,
): Promise<{ ok: boolean; error?: string }> {
  return { ok: false, error: "BE chưa hỗ trợ lịch định kỳ" };
}

// ── Session feedback chi tiết (4 tiêu chí): BE chỉ có /feedback/review tổng quát ──
// Wrap qua reviewApi.createReview nếu caller cần chấm điểm tổng — ở đây giữ no-op
export async function submitSessionFeedback(
  _bookingId: string,
  _feedback: QualityFeedback,
): Promise<{ ok: boolean; error?: string }> {
  return { ok: false, error: "BE chỉ hỗ trợ review tổng — dùng reviewApi.createReview" };
}
