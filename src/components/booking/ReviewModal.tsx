"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { createReview } from "@/api/reviewApi";
import { StarRating } from "@/components/booking/ReviewCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  bookingId: string;
  tutorId: string;
  tutorName?: string;
  open: boolean;
  onClose: () => void;
}

export function ReviewModal({ bookingId, tutorId, tutorName, open, onClose }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    if (!comment.trim()) { setError("Vui lòng nhập nhận xét."); return; }
    setError("");
    setSubmitting(true);
    try {
      const result = await createReview({ bookingId, tutorId, rating, comment });
      if (!result.ok) { setError(result.error ?? "Không thể gửi đánh giá."); return; }
      setComment("");
      setRating(5);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[92dvh]">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 shrink-0">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground">Đánh giá gia sư</h2>
            <p className="text-xs text-muted-foreground truncate">
              {tutorName ? tutorName : `Booking #${bookingId}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            title="Đóng"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">Xếp hạng sao</p>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">
              Nhận xét <span className="text-destructive">*</span>
            </p>
            <Textarea
              rows={4}
              placeholder="Chia sẻ trải nghiệm học với gia sư..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
              maxLength={500}
            />
            <p className="text-right text-xs text-muted-foreground">{comment.length}/500</p>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4 shrink-0">
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button size="sm" className="gap-1.5" loading={submitting} onClick={() => void handleSubmit()}>
            <Star className="h-3.5 w-3.5" />
            Gửi đánh giá
          </Button>
        </div>
      </div>
    </div>
  );
}
