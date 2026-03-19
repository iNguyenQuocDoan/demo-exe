import { apiClient } from "@/lib/apiClient";
import type {
  TutorApplication,
  TutorApplicationStatus,
  PaginationParams,
  PaginationMeta,
} from "@/types";

export async function submitTutorApplication(
  data: Omit<TutorApplication, "id" | "status" | "submittedAt">,
): Promise<{ ok: boolean; applicationId?: string; error?: string }> {
  try {
    const { data: res } = await apiClient.post<{
      ok: boolean;
      applicationId: string;
    }>("/applications", data);
    return { ok: true, applicationId: res.applicationId };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data
        ?.error ?? "Không thể gửi hồ sơ. Vui lòng thử lại.";
    return { ok: false, error: msg };
  }
}

export async function getTutorApplication(
  applicationId: string,
): Promise<TutorApplication | null> {
  try {
    const { data } = await apiClient.get<{
      ok: boolean;
      application: TutorApplication;
    }>(`/applications/${applicationId}`);
    return data.application;
  } catch {
    return null;
  }
}

export async function getTutorApplicationByUserId(): Promise<TutorApplication | null> {
  try {
    const { data } = await apiClient.get<{
      ok: boolean;
      application: TutorApplication | null;
    }>("/applications/user/me");
    return data.application;
  } catch {
    return null;
  }
}

export async function getAllTutorApplications(filter?: {
  status?: TutorApplicationStatus;
}): Promise<TutorApplication[]> {
  try {
    const params = filter?.status ? { status: filter.status } : {};
    const { data } = await apiClient.get<{
      ok: boolean;
      applications: TutorApplication[];
    }>("/applications", { params });
    return data.applications;
  } catch {
    return [];
  }
}

export async function getAllTutorApplicationsPaginated(
  filter?: { status?: TutorApplicationStatus },
  pagination?: PaginationParams,
): Promise<{ applications: TutorApplication[]; pagination: PaginationMeta }> {
  try {
    const params: Record<string, string | number | undefined> = {};
    if (filter?.status) params.status = filter.status;
    if (pagination?.page) params.page = pagination.page;
    if (pagination?.limit) params.limit = pagination.limit;

    const { data } = await apiClient.get<{
      ok: boolean;
      applications: TutorApplication[];
      pagination: PaginationMeta;
    }>("/applications", { params });

    return {
      applications: data.applications,
      pagination: data.pagination,
    };
  } catch {
    return {
      applications: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: TutorApplicationStatus,
  _adminId: string,
  notes?: string,
  rejectionReason?: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.put(`/applications/${applicationId}/status`, {
      status,
      adminNotes: notes,
      rejectionReason,
    });
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data
        ?.error ?? "Không thể cập nhật trạng thái";
    return { ok: false, error: msg };
  }
}

export async function resubmitTutorApplication(
  applicationId: string,
  updates: Partial<TutorApplication>,
  resubmissionNotes: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.put(`/applications/${applicationId}/resubmit`, {
      ...updates,
      resubmissionNotes,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Không thể gửi lại hồ sơ" };
  }
}

export async function requestMoreInfo(
  applicationId: string,
  _adminId: string,
  requestMessage: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.put(`/applications/${applicationId}/status`, {
      status: "ReSubmit",
      adminNotes: requestMessage,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Không thể gửi yêu cầu" };
  }
}
