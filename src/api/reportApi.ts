import { apiClient } from "@/lib/apiClient";
import type { DisputeReport, DisputeReason, DisputeReportStatus } from "@/types";

export interface CreateReportInput {
  bookingId: string;
  reason: DisputeReason;
  description: string;
}

export async function createReport(
  input: CreateReportInput,
): Promise<{ ok: boolean; report?: DisputeReport; error?: string }> {
  try {
    const { data } = await apiClient.post<{ ok: boolean; report: DisputeReport }>(
      "/reports",
      input,
    );
    return data;
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
      "Không thể gửi báo cáo.";
    return { ok: false, error: msg };
  }
}

export async function getReports(params?: {
  status?: DisputeReportStatus;
  bookingId?: string;
}): Promise<{ reports: DisputeReport[]; total: number }> {
  try {
    const { data } = await apiClient.get<{
      ok: boolean;
      reports: DisputeReport[];
      total: number;
    }>("/reports", { params });
    return { reports: data.reports, total: data.total };
  } catch {
    return { reports: [], total: 0 };
  }
}

export async function getMyReports(params?: {
  bookingId?: string;
}): Promise<DisputeReport[]> {
  try {
    const { data } = await apiClient.get<{ ok: boolean; reports: DisputeReport[] }>(
      "/reports/me",
      { params },
    );
    return data.reports;
  } catch {
    return [];
  }
}

export async function getReportsAgainstMe(params?: {
  bookingId?: string;
}): Promise<DisputeReport[]> {
  try {
    const { data } = await apiClient.get<{ ok: boolean; reports: DisputeReport[] }>(
      "/reports/against-me",
      { params },
    );
    return data.reports;
  } catch {
    return [];
  }
}

export async function updateReport(
  id: string,
  body: { status?: DisputeReportStatus; adminNote?: string },
): Promise<{ ok: boolean; report?: DisputeReport; error?: string }> {
  try {
    const { data } = await apiClient.put<{ ok: boolean; report: DisputeReport }>(
      `/reports/${id}`,
      body,
    );
    return data;
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
      "Không thể cập nhật báo cáo.";
    return { ok: false, error: msg };
  }
}
