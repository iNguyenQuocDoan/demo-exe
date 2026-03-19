"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createReview, getReviewByBookingId } from "@/api/reviewApi";
import type { Review } from "@/types";

interface ReviewCardProps {
  bookingId: string;
  tutorId: string;
  tutorName: string;
  existingReview?: Review | null;
  onReviewed?: () => void;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} sao`}
          className="p-0.5 focus:outline-none"
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          onClick={() => onChange?.(star)}
          disabled={!onChange}
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewCard({
  bookingId,
  tutorId,
  tutorName,
  existingReview,
  onReviewed,
}: ReviewCardProps) {
  const [review, setReview] = useState<Review | null>(existingReview ?? null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError("Vui lòng nhập nhận xét.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await createReview({ bookingId, tutorId, rating, comment });
      if (result.ok && result.review) {
        setReview(result.review);
        onReviewed?.();
      } else {
        setError(result.error ?? "Không thể gửi đánh giá.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Show submitted review
  if (review) {
    return (
      <div className="surface-card p-4 space-y-2">
        <p className="text-sm font-semibold text-foreground">Đánh giá của bạn</p>
        <StarRating value={review.rating} />
        <p className="text-sm text-muted-foreground">{review.comment}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
        </p>
        {review.tutorReply && (
          <div className="rounded-lg bg-muted/50 border p-3 text-sm space-y-0.5">
            <p className="font-medium text-foreground">Phản hồi từ {tutorName}:</p>
            <p className="text-muted-foreground">{review.tutorReply.text}</p>
          </div>
        )}
      </div>
    );
  }

  // Show review form
  return (
    <div className="surface-card p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">
        Đánh giá gia sư {tutorName}
      </p>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Chọn số sao</p>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Nhận xét</p>
        <Textarea
          rows={3}
          placeholder="Chia sẻ trải nghiệm học với gia sư..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="resize-none"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button onClick={handleSubmit} disabled={submitting} size="sm" className="w-full">
        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
      </Button>
    </div>
  );
}

/**
 * Async loader wrapper — fetches existing review then renders ReviewCard.
 */
export function ReviewCardLoader({
  bookingId,
  tutorId,
  tutorName,
  onReviewed,
}: Omit<ReviewCardProps, "existingReview">) {
  const [existing, setExisting] = useState<Review | null | undefined>(undefined);

  useEffect(() => {
    void getReviewByBookingId(bookingId).then((r) => setExisting(r ?? null));
  }, [bookingId]);

  if (existing === undefined) return null;

  return (
    <ReviewCard
      bookingId={bookingId}
      tutorId={tutorId}
      tutorName={tutorName}
      existingReview={existing}
      onReviewed={onReviewed}
    />
  );
}
