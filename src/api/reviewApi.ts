import { realApiClient } from "@/lib/realApiClient";
import type { Review } from "@/types";

// BE: POST /api/feedback/review (PARENT) — body { bookingId, rating, comment }
export async function createReview(payload: {
  bookingId: string;
  tutorId: string;
  rating: number;
  comment: string;
}): Promise<{ ok: boolean; review?: Review; error?: string }> {
  try {
    await realApiClient.post("/feedback/review", {
      bookingId: payload.bookingId,
      rating: payload.rating,
      comment: payload.comment,
    });
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Không thể gửi đánh giá.";
    return { ok: false, error: msg };
  }
}

// BE chưa expose list / get / reply review — trả mảng rỗng / null để tương thích UI
export async function getAllReviews(_params?: { tutorId?: string }): Promise<Review[]> {
  return [];
}

export async function getReviewByBookingId(_bookingId: string): Promise<Review | null> {
  return null;
}

export async function replyToReview(
  _reviewId: string,
  _text: string,
): Promise<{ ok: boolean; review?: Review; error?: string }> {
  return { ok: false, error: "BE chưa hỗ trợ phản hồi đánh giá" };
}
