import { apiClient } from "@/lib/apiClient";
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

/**
 * Backend: POST /api/disputes (alias: /api/reports)
 */
export async function createDispute(
  input: CreateDisputeInput,
): Promise<{ ok: boolean; dispute?: DisputeReport; error?: string }> {
  try {
    const { data } = await apiClient.post<{ ok: boolean; dispute: DisputeReport }>(
      "/disputes",
      input,
    );
    return { ok: true, dispute: data.dispute };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
      "Không thể gửi khiếu nại.";
    return { ok: false, error: msg };
  }
}

export async function getDisputes(params?: {
  status?: DisputeReportStatus;
  reason?: DisputeReason;
  bookingId?: string;
}): Promise<DisputeReport[]> {
  try {
    const { data } = await apiClient.get<{ ok: boolean; disputes: DisputeReport[] }>(
      "/disputes",
      { params },
    );
    return data.disputes;
  } catch {
    return [];
  }
}

export async function getDispute(id: string): Promise<DisputeReport | null> {
  try {
    const { data } = await apiClient.get<{ ok: boolean; dispute: DisputeReport }>(
      `/disputes/${id}`,
    );
    return data.dispute;
  } catch {
    return null;
  }
}

export async function getDisputesByBooking(bookingId: string): Promise<DisputeReport[]> {
  try {
    const { data } = await apiClient.get<{ ok: boolean; disputes: DisputeReport[] }>(
      `/disputes/booking/${bookingId}`,
    );
    return data.disputes;
  } catch {
    return [];
  }
}

export async function updateDisputeStatus(
  id: string,
  status: DisputeReportStatus,
  adminNote?: string,
): Promise<{ ok: boolean; dispute?: DisputeReport; error?: string }> {
  try {
    const { data } = await apiClient.patch<{ ok: boolean; dispute: DisputeReport }>(
      `/disputes/${id}/status`,
      { status, adminNote },
    );
    return { ok: true, dispute: data.dispute };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
      "Không thể cập nhật khiếu nại.";
    return { ok: false, error: msg };
  }
}

export async function resolveDispute(
  id: string,
  input: ResolveDisputeInput,
): Promise<{ ok: boolean; dispute?: DisputeReport; error?: string }> {
  try {
    const { data } = await apiClient.post<{ ok: boolean; dispute: DisputeReport }>(
      `/disputes/${id}/resolve`,
      input,
    );
    return { ok: true, dispute: data.dispute };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
      "Không thể xử lý khiếu nại.";
    return { ok: false, error: msg };
  }
}
