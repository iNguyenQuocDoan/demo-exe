"use client";
import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Send, ThumbsUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { useAuthStore } from "@/store/useAuthStore";
import { getReviews } from "@/api/tutorApi";
import { replyToReview } from "@/api/reviewApi";
import type { Review } from "@/types";

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const s = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${s} ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function RatingSummary({ reviews }: { reviews: Review[] }) {
  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="surface-card p-5">
      <div className="flex gap-8 items-center flex-wrap">
        <div className="text-center">
          <div className="text-5xl font-bold text-foreground">{avg.toFixed(1)}</div>
          <StarRating rating={Math.round(avg)} size="md" />
          <div className="text-xs text-muted-foreground mt-1">{reviews.length} đánh giá</div>
        </div>
        <div className="flex-1 min-w-40 space-y-1.5">
          {dist.map(({ star, count }) => {
            const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-right text-muted-foreground">{star}</span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-xs text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  onReply,
}: {
  review: Review;
  onReply: (id: string, text: string) => Promise<void>;
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(review.id, replyText.trim());
    setReplyText("");
    setShowReplyBox(false);
    setSubmitting(false);
  };

  const date = new Date(review.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="surface-card p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {review.parentName.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm">{review.parentName}</div>
              <div className="text-xs text-muted-foreground">{date}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} />
            <Badge
              variant={review.rating >= 4 ? "success" : review.rating >= 3 ? "warning" : "destructive"}
              className="text-xs"
            >
              {review.rating}/5
            </Badge>
          </div>
        </div>

        {/* Comment */}
        <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>

        {/* Existing reply */}
        {review.tutorReply && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <MessageSquare className="h-3.5 w-3.5" />
              Phản hồi của bạn
            </div>
            <p className="text-sm text-foreground">{review.tutorReply.text}</p>
            <div className="text-xs text-muted-foreground">
              {new Date(review.tutorReply.repliedAt).toLocaleDateString("vi-VN")}
            </div>
          </div>
        )}

        {/* Reply actions */}
        {!review.tutorReply && (
          <div>
            {!showReplyBox ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setShowReplyBox(true)}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Phản hồi đánh giá
              </Button>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập phản hồi của bạn..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!replyText.trim() || submitting}
                    className="gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {submitting ? "Đang gửi..." : "Gửi phản hồi"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setShowReplyBox(false); setReplyText(""); }}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}

export default function TutorReviewsPage() {
  const { user, isLoading } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "replied" | "pending">("all");

  const tutorId = user?.tutorProfileId ?? null;

  useEffect(() => {
    if (isLoading || !user) return;
    if (!tutorId) { setLoading(false); return; }
    getReviews(tutorId).then((r) => {
      setReviews(r);
      setLoading(false);
    });
  }, [user, isLoading, tutorId]);

  const handleReply = async (reviewId: string, text: string) => {
    const result = await replyToReview(reviewId, text);
    if (result.ok && result.review) {
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? result.review! : r)));
    } else {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, tutorReply: { text, repliedAt: new Date().toISOString() } }
            : r,
        ),
      );
    }
  };

  const filtered = reviews.filter((r) => {
    if (filter === "replied") return !!r.tutorReply;
    if (filter === "pending") return !r.tutorReply;
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pendingCount = reviews.filter((r) => !r.tutorReply).length;

  if (isLoading || loading) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container space-y-3">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-10 rounded-xl" />
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <PageAnimations />
      <section className="pt-4 pb-8">
        <div className="site-container space-y-3">

          {/* Compact header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Star className="h-4.5 w-4.5 text-primary" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Đánh giá từ phụ huynh</h1>
            </div>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <span className="text-xs font-medium text-warning">{pendingCount} chờ phản hồi</span>
              )}
              <span className="text-sm text-muted-foreground">{reviews.length} đánh giá</span>
            </div>
          </div>

          {/* Rating summary */}
          {reviews.length > 0 && <RatingSummary reviews={reviews} />}

          {/* Filter tabs */}
          {reviews.length > 0 && (
            <div className="surface-card p-3 flex gap-2 flex-wrap">
              {(["all", "pending", "replied"] as const).map((f) => {
                const labels = { all: "Tất cả", pending: "Chờ phản hồi", replied: "Đã phản hồi" };
                const counts = {
                  all: reviews.length,
                  pending: reviews.filter((r) => !r.tutorReply).length,
                  replied: reviews.filter((r) => !!r.tutorReply).length,
                };
                return (
                  <Button
                    key={f}
                    size="sm"
                    variant={filter === f ? "default" : "outline"}
                    onClick={() => setFilter(f)}
                    className="gap-1.5"
                  >
                    {f === "pending" && <ThumbsUp className="h-3.5 w-3.5" />}
                    {labels[f]}
                    <span className="ml-0.5 text-xs opacity-70">({counts[f]})</span>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Review list */}
          {filtered.length === 0 ? (
            <div className="surface-card py-12 text-center">
              <AlertCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {reviews.length === 0 ? "Bạn chưa có đánh giá nào" : "Không có đánh giá nào trong mục này"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <ReviewCard key={r.id} review={r} onReply={handleReply} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
