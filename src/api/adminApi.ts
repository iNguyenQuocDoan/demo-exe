import { apiClient } from "@/lib/apiClient";

export interface ReconciliationIssue {
  type: string;
  referenceId: string;
  action: string;
}

export interface ReconciliationReport {
  timestamp: string;
  fixed: number;
  issues: ReconciliationIssue[];
}

export interface ReconciliationResult {
  timestamp: string;
  reports: Record<string, ReconciliationReport>;
}

export interface FinancialSnapshot {
  totalWalletBalance: number;
  activeHoldAmount: number;
  platformRevenue: number;
  pendingDepositAmount: number;
  pendingWithdrawalAmount: number;
}

export interface ScheduledJob {
  name: string;
  intervalMs: number;
  lastRun?: string;
  lastError?: string;
}

export interface PreBanCheckResult {
  activeBookingCount: number;
  bookings: Array<{
    id: string;
    status: string;
    startAt: string;
    baseAmount: number;
  }>;
}

export async function runReconciliation(): Promise<ReconciliationResult | null> {
  try {
    const { data } = await apiClient.post<ReconciliationResult & { ok: boolean }>(
      "/admin/reconcile",
    );
    return data;
  } catch {
    return null;
  }
}

export async function runReconciliationJob(name: string): Promise<ReconciliationReport | null> {
  try {
    const { data } = await apiClient.post<{ ok: boolean; report: ReconciliationReport }>(
      `/admin/reconcile/${name}`,
    );
    return data.report;
  } catch {
    return null;
  }
}

export async function getFinancialSnapshot(): Promise<FinancialSnapshot | null> {
  try {
    const { data } = await apiClient.get<FinancialSnapshot & { ok: boolean }>(
      "/admin/financial-snapshot",
    );
    return data;
  } catch {
    return null;
  }
}

export async function listScheduledJobs(): Promise<ScheduledJob[]> {
  try {
    const { data } = await apiClient.get<{ ok: boolean; jobs: ScheduledJob[] }>(
      "/admin/jobs",
    );
    return data.jobs;
  } catch {
    return [];
  }
}

export async function triggerJob(name: string): Promise<unknown> {
  try {
    const { data } = await apiClient.post<{ ok: boolean; result: unknown }>(
      `/admin/jobs/${name}/run`,
    );
    return data.result;
  } catch {
    return null;
  }
}

export async function forceCancelBooking(
  bookingId: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.post(`/admin/bookings/${bookingId}/force-cancel`, { reason });
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
      "Không thể hủy buổi học.";
    return { ok: false, error: msg };
  }
}

export async function forceCompleteBooking(
  bookingId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.post(`/admin/bookings/${bookingId}/force-complete`);
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
      "Không thể hoàn thành buổi học.";
    return { ok: false, error: msg };
  }
}

export async function preBanCheck(userId: string): Promise<PreBanCheckResult | null> {
  try {
    const { data } = await apiClient.get<PreBanCheckResult & { ok: boolean }>(
      `/admin/users/${userId}/pre-ban-check`,
    );
    return data;
  } catch {
    return null;
  }
}
