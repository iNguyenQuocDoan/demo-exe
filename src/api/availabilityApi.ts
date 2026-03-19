import { apiClient } from "@/lib/apiClient";
import type { FreeSlot, TutorAvailability, WeeklySlot, AvailabilityException } from "@/types";
import { computeFreeSlots } from "@/lib/business/query";

// Backend stores slotId / exceptionId but frontend types use id.
// This normalizes the gap so the rest of the UI never sees raw backend fields.
type RawSlot = WeeklySlot & { slotId?: string };
type RawException = AvailabilityException & { exceptionId?: string };
type RawAvailability = Omit<TutorAvailability, "weeklySlots" | "exceptions"> & {
  weeklySlots: RawSlot[];
  exceptions: RawException[];
};

function normalizeAvailability(raw: RawAvailability): TutorAvailability {
  return {
    ...raw,
    weeklySlots: (raw.weeklySlots ?? []).map((s) => ({
      ...s,
      id: s.id ?? s.slotId ?? "",
    })),
    exceptions: (raw.exceptions ?? []).map((e) => ({
      ...e,
      id: e.id ?? e.exceptionId ?? "",
    })),
  };
}

export async function getTutorAvailability(tutorId: string): Promise<TutorAvailability | null> {
  try {
    const { data } = await apiClient.get<{ ok: boolean; availability: TutorAvailability | null }>(
      `/availability/${tutorId}`
    );
    return data.availability ? normalizeAvailability(data.availability) : null;
  } catch {
    return null;
  }
}

export async function saveAvailability(
  data: Partial<TutorAvailability> & { tutorId: string }
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.put(`/availability/${data.tutorId}`, data);
    return { ok: true };
  } catch {
    return { ok: false, error: "Không thể lưu lịch dạy" };
  }
}

export async function addWeeklySlot(
  tutorId: string,
  slot: Omit<TutorAvailability["weeklySlots"][0], "id">
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.post(`/availability/${tutorId}/slots`, slot);
    return { ok: true };
  } catch {
    return { ok: false, error: "Không thể thêm khung giờ" };
  }
}

export async function deleteWeeklySlot(
  tutorId: string,
  slotId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.delete(`/availability/${tutorId}/slots/${slotId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Không thể xóa khung giờ" };
  }
}

export async function toggleAcceptingBookings(
  tutorId: string,
  accepting: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.put(`/availability/${tutorId}/toggle`, { accepting });
    return { ok: true };
  } catch {
    return { ok: false, error: "Không thể cập nhật trạng thái" };
  }
}

export async function getFreeSlots(
  tutorId: string,
  startDate: string,
  endDate: string
): Promise<FreeSlot[]> {
  try {
    const avail = await getTutorAvailability(tutorId);
    if (!avail || !avail.acceptingBookings) return [];
    return computeFreeSlots(avail, [], startDate, endDate);
  } catch {
    return [];
  }
}

export async function updateWeeklySlot(
  tutorId: string,
  slotId: string,
  updates: Partial<WeeklySlot>
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.put(`/availability/${tutorId}/slots/${slotId}`, updates);
    return { ok: true };
  } catch {
    return { ok: false, error: "Không thể cập nhật khung giờ" };
  }
}

export async function addAvailabilityException(
  tutorId: string,
  exception: Omit<AvailabilityException, "id">
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.post(`/availability/${tutorId}/exceptions`, exception);
    return { ok: true };
  } catch {
    return { ok: false, error: "Không thể thêm ngoại lệ" };
  }
}

export async function deleteAvailabilityException(
  tutorId: string,
  exceptionId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.delete(`/availability/${tutorId}/exceptions/${exceptionId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Không thể xóa ngoại lệ" };
  }
}
