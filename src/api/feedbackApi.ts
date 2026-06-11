import { realApiClient } from "@/lib/realApiClient";

export interface DisputeItem {
  id: string;
  bookingId: string;
  parentEmail: string;
  tutorName: string;
  type: string;
  reason: string;
  responderReply?: string;
  status: string;
  createdAt: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

/**
 * Helper trích xuất thông báo lỗi chi tiết từ Axios Error theo thứ tự ưu tiên
 */
function getErrorMessage(err: any, fallback: string): string {
  if (err?.response?.data) {
    const data = err.response.data;
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (typeof data === "string" && data.trim()) return data;
  }
  return err?.message ?? fallback;
}

/**
 * Parent tạo khiếu nại theo booking
 * POST /api/feedback/dispute/{bookingId}
 */
export async function createDispute(bookingId: string, reason: string): Promise<void> {
  // Fix lỗi: làm sạch bookingId, loại bỏ hoàn toàn dấu #
  const cleanBookingId = (bookingId ?? "").replace("#", "").trim();
  try {
    await realApiClient.post(`/feedback/dispute/${cleanBookingId}`, {
      reason,
    });
  } catch (err: any) {
    const msg = getErrorMessage(
      err,
      "Không thể gửi khiếu nại. Booking có thể không hợp lệ hoặc đã được khiếu nại."
    );
    throw new Error(msg);
  }
}

/**
 * User hiện tại xem khiếu nại của mình
 * GET /api/feedback/my-disputes
 */
export async function getMyDisputes(): Promise<DisputeItem[]> {
  try {
    const { data } = await realApiClient.get<ApiResponse<Record<string, DisputeItem[]>> | Record<string, DisputeItem[]>>("/feedback/my-disputes");
    const rawData = (data as ApiResponse<Record<string, DisputeItem[]>>)?.data || data;

    if (rawData && typeof rawData === "object" && !Array.isArray(rawData)) {
      return Object.values(rawData).flat();
    }
    if (Array.isArray(rawData)) {
      return rawData;
    }
    return [];
  } catch (err: any) {
    const msg = getErrorMessage(err, "Không thể tải danh sách khiếu nại.");
    throw new Error(msg);
  }
}

/**
 * Tutor hoặc parent phản hồi khiếu nại
 * POST /api/feedback/dispute/{disputeId}/reply
 */
export async function replyDispute(disputeId: string, responderReply: string): Promise<void> {
  try {
    await realApiClient.post(`/feedback/dispute/${disputeId}/reply`, {
      responderReply,
    });
  } catch (err: any) {
    const msg = getErrorMessage(err, "Không thể gửi phản hồi.");
    throw new Error(msg);
  }
}

/**
 * Admin lấy danh sách khiếu nại pending
 * GET /api/feedback/dispute/pending
 */
export async function getPendingDisputes(): Promise<DisputeItem[]> {
  try {
    const { data } = await realApiClient.get<ApiResponse<DisputeItem[] | null> | DisputeItem[] | null>("/feedback/dispute/pending");
    const rawData = (data as ApiResponse<DisputeItem[]>)?.data || data;
    if (Array.isArray(rawData)) {
      return rawData;
    }
    return [];
  } catch (err: any) {
    const msg = getErrorMessage(err, "Không thể tải danh sách khiếu nại chờ xử lý.");
    throw new Error(msg);
  }
}

/**
 * Admin xử lý khiếu nại
 * POST /api/feedback/{id}/resolve
 */
export async function resolveDispute(
  id: string,
  refundToParent: boolean,
  adminResolution: string,
): Promise<void> {
  try {
    await realApiClient.post(`/feedback/${id}/resolve`, {
      refundToParent,
      adminResolution,
    });
  } catch (err: any) {
    const msg = getErrorMessage(err, "Không thể giải quyết khiếu nại.");
    throw new Error(msg);
  }
}
