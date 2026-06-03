"use client";

import { useState } from "react";
import { AlertTriangle, Flag, X } from "lucide-react";
import { createDispute } from "@/api/disputeApi";
import { Button } from "@/components/ui/button";
import { DISPUTE_REASON_LABELS, type DisputeReason } from "@/types";

const REASONS = Object.entries(DISPUTE_REASON_LABELS) as [DisputeReason, string][];

interface Props {
  bookingId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReportDisputeModal({ bookingId, open, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState<DisputeReason | "">("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    if (!reason) { setError("Vui lòng chọn lý do tranh chấp."); return; }
    if (description.trim().length < 20) { setError("Mô tả phải ít nhất 20 ký tự."); return; }
    setError("");
    setSubmitting(true);
    try {
      const result = await createDispute({ bookingId, reason, description });
      if (!result.ok) { setError(result.error ?? "Không thể gửi báo cáo."); return; }
      setReason("");
      setDescription("");
      onSuccess();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal panel — slides up on mobile, centered on desktop */}
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[92dvh]">

        {/* Header — always visible */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-4 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 shrink-0">
            <Flag className="h-4 w-4 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground">Báo cáo tranh chấp</h2>
            <p className="text-xs text-muted-foreground truncate">Booking #{bookingId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Warning */}
          <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed text-amber-800">
              Báo cáo sẽ được admin xem xét trong{" "}
              <span className="font-semibold">1–2 ngày làm việc</span>.
              Vui lòng cung cấp thông tin chính xác và đầy đủ.
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-2.5">
            <p className="text-sm font-medium text-foreground">
              Lý do tranh chấp <span className="text-destructive">*</span>
            </p>
            <div className="space-y-2">
              {REASONS.map(([value, label]) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                    reason === value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  {/* Custom radio dot */}
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      reason === value ? "border-primary" : "border-muted-foreground/40"
                    }`}
                  >
                    {reason === value && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </span>
                  <input
                    type="radio"
                    name="reason"
                    value={value}
                    checked={reason === value}
                    onChange={() => setReason(value)}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Mô tả chi tiết <span className="text-destructive">*</span>
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả cụ thể sự việc: thời gian, diễn biến, bằng chứng nếu có…"
              className="w-full min-h-24 rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
              maxLength={500}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Tối thiểu 20 ký tự</span>
              <span className={description.length >= 480 ? "text-destructive font-medium" : ""}>
                {description.length}/500
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
        </div>

        {/* Footer — always visible */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4 shrink-0">
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="gap-1.5"
            loading={submitting}
            onClick={() => void handleSubmit()}
          >
            <Flag className="h-3.5 w-3.5" />
            Gửi báo cáo
          </Button>
        </div>
      </div>
    </div>
  );
}
