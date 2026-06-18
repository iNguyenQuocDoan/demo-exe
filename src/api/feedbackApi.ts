import { realApiClient } from "@/lib/realApiClient";

export interface DisputeItem {
  id: string;
  bookingId: string;
  parentEmail: string;
  tutorName: string;
  type: string;
  reason: string;
  responderReply?: string;
  evidenceSendUrl?: string;
  evidenceReplyUrl?: string;
  status: string;
  createdAt: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

const BE_ORIGIN = process.env.NEXT_PUBLIC_BE_ORIGIN ?? "https://liflow-be.onrender.com";

function normalizeEvidenceUrl(url: any): string | null {
  if (!url || typeof url !== "string" || !url.trim()) return null;
  const trimmed = url.trim();
  if (
    trimmed.startsWith("http://") || 
    trimmed.startsWith("https://") || 
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  const cleanUrl = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  const origin = BE_ORIGIN.endsWith("/") ? BE_ORIGIN.slice(0, -1) : BE_ORIGIN;
  return `${origin}/${cleanUrl}`;
}

export function normalizeDisputeItem(item: any): DisputeItem {
  const rawSendUrl = item.evidenceSendUrl || item.evidenceSendURL || item.sendEvidenceUrl || item.evidenceUrl || item.fileUrl || item.imageUrl || null;
  const rawReplyUrl = item.evidenceReplyUrl || item.evidenceReplyURL || item.replyEvidenceUrl || null;

  return {
    ...item,
    evidenceSendUrl: normalizeEvidenceUrl(rawSendUrl) ?? undefined,
    evidenceReplyUrl: normalizeEvidenceUrl(rawReplyUrl) ?? undefined,
  };
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
 * Parent/Tutor tạo khiếu nại theo booking
 * POST /api/feedback/dispute/{bookingId}
 * Content-Type: multipart/form-data
 */
export async function createDispute(
  bookingId: string,
  payload: { reason: string },
  file?: File
): Promise<void> {
  // Fix lỗi: làm sạch bookingId, loại bỏ hoàn toàn dấu #
  const cleanBookingId = (bookingId ?? "").replace("#", "").trim();
  try {
    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));
    if (file) {
      formData.append("file", file);
    }

    await realApiClient.post(`/feedback/dispute/${cleanBookingId}`, formData);
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
    
    // Log dữ liệu raw từ BE để debug trường ảnh khiếu nại/phản hồi
    console.log("FEEDBACK API - GET MY DISPUTES RAW RESPONSE DATA:", rawData);

    let items: DisputeItem[] = [];
    if (rawData && typeof rawData === "object" && !Array.isArray(rawData)) {
      items = Object.values(rawData).flat();
    } else if (Array.isArray(rawData)) {
      items = rawData;
    }

    const normalized = items.map(normalizeDisputeItem);
    console.log("FEEDBACK API - GET MY DISPUTES NORMALIZED DATA:", normalized);
    return normalized;
  } catch (err: any) {
    const msg = getErrorMessage(err, "Không thể tải danh sách khiếu nại.");
    throw new Error(msg);
  }
}

/**
 * Tutor hoặc parent phản hồi khiếu nại
 * POST /api/feedback/dispute/{disputeId}/reply
 * Content-Type: multipart/form-data
 */
export async function replyDispute(
  disputeId: string,
  replyText: string,
  file?: File
): Promise<void> {
  try {
    const formData = new FormData();
    formData.append(
      "request",
      new Blob(
        [JSON.stringify({ responderReply: replyText })],
        { type: "application/json" }
      )
    );
    if (file) {
      formData.append("file", file);
    }

    await realApiClient.post(`/feedback/dispute/${disputeId}/reply`, formData);
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
    
    // Log dữ liệu raw từ BE để debug trường ảnh khiếu nại/phản hồi
    console.log("FEEDBACK API - GET PENDING DISPUTES RAW RESPONSE DATA:", rawData);

    let items: DisputeItem[] = [];
    if (Array.isArray(rawData)) {
      items = rawData;
    }

    const normalized = items.map(normalizeDisputeItem);
    console.log("FEEDBACK API - GET PENDING DISPUTES NORMALIZED DATA:", normalized);
    
    // Kiểm tra xem backend có trả về các URL ảnh không, nếu không log cảnh báo rõ
    normalized.forEach((item) => {
      if (!item.evidenceSendUrl && !item.evidenceReplyUrl) {
        console.warn(
          `Dispute #${item.id} không chứa ảnh bằng chứng nào (cả evidenceSendUrl và evidenceReplyUrl đều rỗng). Hãy kiểm tra xem BE đã trả các trường này trong API GET chưa.`
        );
      }
    });

    return normalized;
  } catch (err: any) {
    const msg = getErrorMessage(err, "Không thể tải danh sách khiếu nại chờ xử lý.");
    throw new Error(msg);
  }
}

/**
 * Admin xử lý khiếu nại
 * POST /api/feedback/{id}/resolve
 * Content-Type: application/json
 */
export async function resolveDispute(
  id: string,
  payload: { refundToParent: boolean; adminResolution: string }
): Promise<void> {
  try {
    await realApiClient.post(`/feedback/${id}/resolve`, payload);
  } catch (err: any) {
    const msg = getErrorMessage(err, "Không thể giải quyết khiếu nại.");
    throw new Error(msg);
  }
}
