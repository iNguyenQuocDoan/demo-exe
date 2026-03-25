"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitSessionFeedback } from "@/api/bookingApi";
import type { Booking, QualityFeedback } from "@/types";

const QUALITY_CRITERIA: { key: keyof QualityFeedback; label: string }[] = [
  { key: "teachingMethod", label: "Phương pháp giảng dạy" },
  { key: "punctuality", label: "Đúng giờ / nghiêm túc" },
  { key: "communication", label: "Giao tiếp với phụ huynh" },
  { key: "preparation", label: "Chuẩn bị bài" },
];

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} sao`}
          className="p-0.5 focus:outline-none"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              n <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

interface SessionFeedbackCardProps {
  booking: Booking;
  readOnly?: boolean;
  onSubmitted?: (feedback: QualityFeedback) => void;
}

export function SessionFeedbackCard({ booking, readOnly, onSubmitted }: SessionFeedbackCardProps) {
  const [submitted, setSubmitted] = useState<QualityFeedback | null>(
    booking.sessionFeedback ?? null,
  );
  const [feedback, setFeedback] = useState<QualityFeedback>({
    teachingMethod: 5,
    punctuality: 5,
    communication: 5,
    preparation: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitSessionFeedback(booking.id, feedback);
      if (result.ok) {
        setSubmitted(feedback);
        onSubmitted?.(feedback);
      } else {
        setError(result.error ?? "Không thể gửi feedback.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="surface-card p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Feedback buổi học</p>
        <p className="text-xs text-muted-foreground">Chỉ gia sư và quản trị viên thấy</p>
        <div className="space-y-2">
          {QUALITY_CRITERIA.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">{label}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`h-3.5 w-3.5 ${
                      n <= submitted[key]
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (readOnly) {
    return (
      <div className="surface-card p-4 space-y-2">
        <p className="text-sm font-semibold text-foreground">Feedback buổi học</p>
        <p className="text-xs text-muted-foreground">Phụ huynh chưa gửi feedback cho buổi học này.</p>
      </div>
    );
  }

  return (
    <div className="surface-card p-4 space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Feedback buổi học</p>
        <p className="text-xs text-muted-foreground mt-0.5">Chỉ gia sư và quản trị viên thấy</p>
      </div>
      <div className="space-y-3">
        {QUALITY_CRITERIA.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <span className="text-sm text-foreground">{label}</span>
            <StarPicker
              value={feedback[key]}
              onChange={(v) => setFeedback((prev) => ({ ...prev, [key]: v }))}
            />
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button onClick={handleSubmit} disabled={submitting} size="sm" className="w-full">
        {submitting ? "Đang gửi..." : "Gửi feedback"}
      </Button>
    </div>
  );
}
