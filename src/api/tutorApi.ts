import { apiClient } from "@/lib/apiClient";
import type {
  FreeSlot,
  Review,
  TutorFilter,
  TutorProfile,
  PaginationParams,
  PaginationMeta,
} from "@/types";
import { computeFreeSlots } from "@/lib/business/query";

export async function getTutors(
  filter?: Partial<TutorFilter>,
): Promise<TutorProfile[]> {
  const params: Record<string, string | number | undefined> = {};
  if (filter?.cityId) params.cityId = filter.cityId;
  if (filter?.districtId) params.districtId = filter.districtId;
  if (filter?.teachingMode && filter.teachingMode !== "ALL")
    params.teachingMode = filter.teachingMode;
  if (filter?.subjectId) params.subjectId = filter.subjectId;
  if (filter?.minPrice) params.minPrice = filter.minPrice;
  if (filter?.maxPrice) params.maxPrice = filter.maxPrice;
  if (filter?.sortBy) params.sortBy = filter.sortBy;

  const { data } = await apiClient.get<{ ok: boolean; tutors: TutorProfile[] }>(
    "/tutors",
    { params },
  );
  return data.tutors;
}

export async function getTutorsPaginated(
  filter?: Partial<TutorFilter>,
  pagination?: PaginationParams,
): Promise<{ tutors: TutorProfile[]; pagination: PaginationMeta }> {
  const params: Record<string, string | number | undefined> = {};
  if (filter?.cityId) params.cityId = filter.cityId;
  if (filter?.districtId) params.districtId = filter.districtId;
  if (filter?.teachingMode && filter.teachingMode !== "ALL")
    params.teachingMode = filter.teachingMode;
  if (filter?.subjectId) params.subjectId = filter.subjectId;
  if (filter?.minPrice) params.minPrice = filter.minPrice;
  if (filter?.maxPrice) params.maxPrice = filter.maxPrice;
  if (filter?.sortBy) params.sortBy = filter.sortBy;
  if (pagination?.page) params.page = pagination.page;
  if (pagination?.limit) params.limit = pagination.limit;

  const { data } = await apiClient.get<{
    ok: boolean;
    tutors: TutorProfile[];
    pagination: PaginationMeta;
  }>("/tutors", { params });

  return {
    tutors: data.tutors,
    pagination: data.pagination,
  };
}

export async function getTutorById(id: string): Promise<TutorProfile | null> {
  try {
    const { data } = await apiClient.get<{ ok: boolean; tutor: TutorProfile }>(
      `/tutors/${id}`,
    );
    return data.tutor;
  } catch {
    return null;
  }
}

export async function getTutorAvailability(
  tutorId: string,
  fromDate: string,
  toDate: string,
): Promise<FreeSlot[]> {
  try {
    const [availRes, bookingsRes] = await Promise.all([
      apiClient.get<{
        ok: boolean;
        availability: {
          weeklySlots: unknown[];
          exceptions: unknown[];
          acceptingBookings: boolean;
        };
      }>(`/availability/${tutorId}`),
      apiClient
        .get<{ ok: boolean; bookings: Parameters<typeof computeFreeSlots>[1] }>(
          "/bookings",
          { params: { tutorId } },
        )
        .catch(() => ({ data: { ok: false, bookings: [] } })),
    ]);

    if (!availRes.data.availability || !availRes.data.availability.acceptingBookings) return [];

    const avail = availRes.data.availability as Parameters<typeof computeFreeSlots>[0];
    const bookings = bookingsRes.data.bookings ?? [];
    return computeFreeSlots(avail, bookings, fromDate, toDate);
  } catch {
    return [];
  }
}

export async function getReviews(tutorId: string): Promise<Review[]> {
  try {
    const { data } = await apiClient.get<{ ok: boolean; reviews: Review[] }>(
      `/tutors/${tutorId}/reviews`,
    );
    return data.reviews;
  } catch {
    return [];
  }
}

export async function updateTutorProfile(
  id: string,
  updates: Partial<TutorProfile>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.put(`/tutors/${id}`, updates);
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data
        ?.error ?? "Không thể cập nhật hồ sơ";
    return { ok: false, error: msg };
  }
}
