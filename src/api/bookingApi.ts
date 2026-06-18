import { realApiClient } from "@/lib/realApiClient";
import type {
  Booking,
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
  if (v.includes("PROGRESS") || v.includes("PROCESS")) return "InProgress"; // BE: "PROCESSING" (đang dạy)
  // Hoàn thành 2 phía: 1 bên xác nhận trước → trạng thái chờ; cả 2 xong → COMPLETED.
  if (v.includes("TUTOR_COMPLET")) return "TutorCompleted";   // gia sư xong, chờ phụ huynh
  if (v.includes("PARENT_COMPLET")) return "ParentCompleted"; // phụ huynh xong, chờ gia sư
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
    // BE history KHÔNG trả tutorId, chỉ có tutorName → giữ lại để hiển thị.
    tutorName: be.tutorName,
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

export async function getBookingById(params: {
  bookingId: string;
  parentId?: string;
  tutorId?: string;
}): Promise<Booking | null> {
  const { bookingId, parentId, tutorId } = params;
  const list = await getBookings({ parentId, tutorId });
  return list.find((item) => item.id === bookingId) ?? null;
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
          // BE phân trang 1-indexed: page=0 → HTTP 500. Luôn ≥ 1.
          page: Math.max(1, pagination?.page ?? 1),
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

export interface BookingDetail extends Booking {
  bookingId: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  startImageUrl?: string | null;
  endImageUrl?: string | null;
  startCheckInTime?: string | null;
  endCheckInTime?: string | null;
  penaltyAmount?: number | null;
  lateMinutes?: number | null;
  parentConfirmed?: boolean;
  tutorConfirmed?: boolean;
  createdAt: string;
  completedAt?: string | null;
  message?: string | null;
  late?: boolean;
  parentName?: string;
}

export async function getBookingDetail(bookingId: string): Promise<BookingDetail> {
  const { data } = await realApiClient.get<any>(`/bookings/${bookingId}`);
  return {
    ...data,
    id: data.bookingId,
    type: "NORMAL",
    parentId: "",
    tutorId: "",
    tutorName: data.tutorName,
    parentName: data.parentName,
    startAt: data.startTime,
    endAt: data.endTime,
    baseAmount: data.totalPrice,
    totalAmount: data.totalPrice,
    status: mapBeStatus(data.status),
    teachingMode: "OFFLINE",
    startImageUrl: data.startImageUrl,
    endImageUrl: data.endImageUrl,
    startCheckInTime: data.startCheckInTime,
    endCheckInTime: data.endCheckInTime,
    penaltyAmount: data.penaltyAmount,
    lateMinutes: data.lateMinutes,
    parentConfirmed: data.parentConfirmed,
    tutorConfirmed: data.tutorConfirmed,
    createdAt: data.createdAt,
    completedAt: data.completedAt,
    message: data.message,
    late: data.late,
  };
}

export const acceptBooking = (id: string) => bookingAction(id, "accept");
export const rejectBooking = (id: string) => bookingAction(id, "reject");

// Gia sư bắt đầu buổi học → BE chuyển trạng thái sang InProgress.
// LƯU Ý: endpoint này là PUT, yêu cầu file minh chứng bắt đầu buổi học.
export const startBooking = async (id: string, file: File): Promise<{ ok: boolean; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    await realApiClient.put(`/bookings/${id}/start`, formData);
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Không thể bắt đầu buổi học";
    return { ok: false, error: msg };
  }
};

// Phụ huynh xác nhận hoàn thành (POST /bookings/{id}/complete)
export const completeBooking = (id: string) => bookingAction(id, "complete");

// Gia sư xác nhận hoàn thành (POST /bookings/{id}/tutor-complete).
// Yêu cầu file minh chứng hoàn thành.
export const tutorCompleteBooking = async (id: string, file: File): Promise<{ ok: boolean; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    await realApiClient.post(`/bookings/${id}/tutor-complete`, formData);
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Không thể báo cáo hoàn thành buổi học";
    return { ok: false, error: msg };
  }
};

export const cancelBooking = (
  id: string,
  _cancelBy?: string,
  _reason?: string,
) => bookingAction(id, "cancel");

// BE: POST /api/bookings/slots (TUTOR) — body SlotRequest:
//   { startTime: "HH:mm:ss", endTime: "HH:mm:ss", startDate: "yyyy-MM-dd", numberOfWeeks }
export type CreateTutorSlotRequest = {
  startTime: string;
  endTime: string;
  startDate: string;
  numberOfWeeks: number;
};

export function convertTimeToHHMMSS(timeStr: string): string {
  if (!timeStr) return "00:00:00";
  
  let trimmed = timeStr.trim().toUpperCase();
  
  const isPM = trimmed.includes("PM");
  const isAM = trimmed.includes("AM");
  
  if (isPM || isAM) {
    trimmed = trimmed.replace("AM", "").replace("PM", "").trim();
    const parts = trimmed.split(":");
    let hour = Number(parts[0]);
    const minute = parts[1] || "00";
    
    if (isPM && hour < 12) {
      hour += 12;
    }
    if (isAM && hour === 12) {
      hour = 0;
    }
    
    const formattedHour = String(hour).padStart(2, "0");
    const formattedMinute = String(minute).padStart(2, "0");
    return `${formattedHour}:${formattedMinute}:00`;
  }
  
  const parts = trimmed.split(":");
  const hour = String(Number(parts[0]) || 0).padStart(2, "0");
  const minute = String(Number(parts[1]) || 0).padStart(2, "0");
  const second = parts[2] ? String(Number(parts[2]) || 0).padStart(2, "0") : "00";
  
  return `${hour}:${minute}:${second}`;
}

export async function createTutorSlot(
  payload: CreateTutorSlotRequest
): Promise<{ ok: boolean; error?: string }> {
  console.log("createTutorSlot payload:", payload);
  try {
    await realApiClient.post("/bookings/slots", payload);
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Không thể tạo lịch trống. Vui lòng kiểm tra thời gian hoặc thử lại.";
    return { ok: false, error: msg };
  }
}

export async function createTutorSlots(input: {
  startTime: string;
  endTime: string;
  startDate: string;
  numberOfWeeks?: number;
}): Promise<{ ok: boolean; error?: string }> {
  return createTutorSlot({
    startTime: convertTimeToHHMMSS(input.startTime),
    endTime: convertTimeToHHMMSS(input.endTime),
    startDate: input.startDate,
    numberOfWeeks: input.numberOfWeeks ?? 1,
  });
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

