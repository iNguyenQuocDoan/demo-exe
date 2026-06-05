import { realApiClient } from "@/lib/realApiClient";
import type {
  DisputeReport,
  DisputeReason,
  DisputeReportStatus,
  DisputeResolution,
} from "@/types";

export interface CreateDisputeInput {
  bookingId: string;
  reason: DisputeReason;
  description: string;
  evidenceUrls?: string[];
}

export interface ResolveDisputeInput {
  resolution: DisputeResolution;
  adminNote?: string;
  refundAmount?: number;
}

interface BeDisputeResponse {
  id: string;
  bookingId: string;
  parentEmail?: string;
  tutorName?: string;
  reason?: string;
  status?: string;
  createdAt?: string;
}

// BE DisputeStatus: PENDING · RESOLVED · REJECTED (không có "Reviewing"/"Dismissed").
function mapBeStatus(s: string | undefined): DisputeReportStatus {
  const v = (s ?? "").toUpperCase();
  if (v.includes("RESOLV")) return "Resolved";
  // BE "REJECTED" = khiếu nại không hợp lệ → Dismissed (trước đây rơi nhầm về Pending)
  if (v.includes("REJECT") || v.includes("DISMISS")) return "Dismissed";
  if (v.includes("REVIEW")) return "Reviewing";
  return "Pending";
}

function mapDispute(be: BeDisputeResponse): DisputeReport {
  return {
    id: be.id,
    bookingId: be.bookingId,
    reporterId: "",
    reporterRole: "parent",
    reporterName: be.parentEmail ?? "",
    reportedId: "",
    reportedRole: "tutor",
    reportedName: be.tutorName ?? "",
    reason: "OTHER",
    description: be.reason ?? "",
    status: mapBeStatus(be.status),
    createdAt: be.createdAt ?? new Date().toISOString(),
  };
}

// BE: POST /api/feedback/dispute (PARENT) — body { bookingId, reason }
export async function createDispute(
  input: CreateDisputeInput,
): Promise<{ ok: boolean; dispute?: DisputeReport; error?: string }> {
  try {
    const beReason = input.description?.trim()
      ? input.description
      : (input.reason as string);
    await realApiClient.post("/feedback/dispute", {
      bookingId: input.bookingId,
      reason: beReason,
    });
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Không thể gửi khiếu nại.";
    return { ok: false, error: msg };
  }
}

// BE: GET /api/feedback/dispute/pending → List<DisputeResponse>
// BE chỉ filter "pending" cứng — các filter khác bỏ qua, trả về kết quả pending kèm filter local
export async function getDisputes(params?: {
  status?: DisputeReportStatus;
  reason?: DisputeReason;
  bookingId?: string;
}): Promise<DisputeReport[]> {
  try {
    const { data } = await realApiClient.get<BeDisputeResponse[]>(
      "/feedback/dispute/pending",
    );
    let list = (data ?? []).map(mapDispute);
    if (params?.status) list = list.filter((d) => d.status === params.status);
    if (params?.bookingId) list = list.filter((d) => d.bookingId === params.bookingId);
    return list;
  } catch {
    return [];
  }
}

// BE chưa có get-by-id — tận dụng list rồi find
export async function getDispute(id: string): Promise<DisputeReport | null> {
  const list = await getDisputes();
  return list.find((d) => d.id === id) ?? null;
}

export async function getDisputesByBooking(bookingId: string): Promise<DisputeReport[]> {
  return getDisputes({ bookingId });
}

export async function updateDisputeStatus(): Promise<{
  ok: boolean;
  dispute?: DisputeReport;
  error?: string;
}> {
  return { ok: false, error: "BE không hỗ trợ cập nhật trạng thái — chỉ resolve" };
}

// BE: POST /api/feedback/{id}/resolve (ADMIN) — body { refundToParent: boolean, adminResolution: string }
export async function resolveDispute(
  id: string,
  input: ResolveDisputeInput,
): Promise<{ ok: boolean; dispute?: DisputeReport; error?: string }> {
  const refundToParent =
    input.resolution === "FULL_REFUND" || input.resolution === "PARTIAL_REFUND";
  try {
    await realApiClient.post(`/feedback/${id}/resolve`, {
      refundToParent,
      adminResolution: input.adminNote ?? input.resolution,
    });
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Không thể xử lý khiếu nại.";
    return { ok: false, error: msg };
  }
}
