import { apiClient } from "@/lib/apiClient";
import type { Review } from "@/types";

export async function getAllReviews(params?: { tutorId?: string }): Promise<Review[]> {
  try {
    const { data } = await apiClient.get<{ ok: boolean; reviews: Review[] }>("/reviews", { params });
    return data.reviews;
  } catch {
    return [];
  }
}

export async function getReviewByBookingId(bookingId: string): Promise<Review | null> {
  try {
    const { data } = await apiClient.get<{ ok: boolean; review: Review | null }>(
      `/reviews/booking/${bookingId}`
    );
    return data.review ?? null;
  } catch {
    return null;
  }
}

export async function createReview(payload: {
  bookingId: string;
  tutorId: string;
  rating: number;
  comment: string;
}): Promise<{ ok: boolean; review?: Review; error?: string }> {
  try {
    const { data } = await apiClient.post<{ ok: boolean; review: Review; error?: string }>(
      "/reviews",
      payload
    );
    return data;
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
    return { ok: false, error: msg ?? "Không thể gửi đánh giá." };
  }
}
