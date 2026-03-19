import { apiClient } from "@/lib/apiClient";
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
  subjectName?: string;   // snapshot display name
  grade: string;
  teachingMode: string;
  studentName?: string;
  notes?: string;
  location?: string;
  baseAmount: number;
  parentGoal?: string;    // parent intent (required by UI, optional here for compat)
  goalTags?: string[];
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

export async function getBookings(params: {
  parentId?: string;
  tutorId?: string;
}): Promise<Booking[]> {
  const { data } = await apiClient.get<{ ok: boolean; bookings: Booking[] }>(
    "/bookings",
    { params },
  );
  return data.bookings;
}

export async function getBookingsPaginated(
  params: { parentId?: string; tutorId?: string; status?: string },
  pagination?: PaginationParams,
): Promise<{ bookings: Booking[]; pagination: PaginationMeta }> {
  const queryParams: Record<string, string | number | undefined> = {
    ...params,
  };
  if (pagination?.page) queryParams.page = pagination.page;
  if (pagination?.limit) queryParams.limit = pagination.limit;

  const { data } = await apiClient.get<{
    ok: boolean;
    bookings: Booking[];
    pagination: PaginationMeta;
  }>("/bookings", { params: queryParams });

  return {
    bookings: data.bookings,
    pagination: data.pagination,
  };
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<{ ok: boolean; booking?: Booking; error?: string }> {
  try {
    const { data } = await apiClient.post<{ ok: boolean; booking: Booking }>(
      "/bookings",
      input,
    );
    return { ok: true, booking: data.booking };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data
        ?.error ?? "Không thể tạo booking";
    return { ok: false, error: msg };
  }
}

async function bookingAction(
  id: string,
  action: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.put(`/bookings/${id}/${action}`);
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data
        ?.error ?? "Thao tác thất bại";
    return { ok: false, error: msg };
  }
}

export const acceptBooking = (id: string) => bookingAction(id, "accept");
export const startBooking = (id: string) => bookingAction(id, "start");
export const completeBooking = (id: string) => bookingAction(id, "complete");
export const cancelBooking = (
  id: string,
  _cancelBy?: string,
  _reason?: string,
) => bookingAction(id, "cancel");

export async function getSeries(params: {
  parentId?: string;
  tutorId?: string;
}): Promise<ScheduleSeries[]> {
  try {
    const { data } = await apiClient.get<{
      ok: boolean;
      series: ScheduleSeries[];
    }>("/series", { params });
    return data.series;
  } catch {
    return [];
  }
}

export async function previewSeries(
  input: CreateSeriesInput,
): Promise<Booking[]> {
  try {
    const { data } = await apiClient.post<{ ok: boolean; sessions: Booking[] }>(
      "/series/preview",
      input,
    );
    return data.sessions;
  } catch {
    return [];
  }
}

export async function createSeries(input: CreateSeriesInput): Promise<{
  ok: boolean;
  series?: ScheduleSeries;
  sessions?: Booking[];
  conflicts?: Booking[];
  error?: string;
}> {
  try {
    const { data } = await apiClient.post<{
      ok: boolean;
      series: ScheduleSeries;
      sessions: Booking[];
      conflicts: Booking[];
    }>("/series", input);
    return data;
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data
        ?.error ?? "Không thể tạo lịch học";
    return { ok: false, error: msg };
  }
}

export async function acceptSeries(
  seriesId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.put(`/series/${seriesId}/accept`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Không thể xác nhận lịch học" };
  }
}
