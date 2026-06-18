"use client";

import { useState } from "react";
import { AlertTriangle, Flag, X, Image as ImageIcon } from "lucide-react";
import { createDispute } from "@/api/feedbackApi";
import { Button } from "@/components/ui/button";

interface Props {
  bookingId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReportDisputeModal({ bookingId, open, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Chỉ chấp nhận file định dạng hình ảnh.");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError("Kích thước file ảnh không được vượt quá 5MB.");
      return;
    }

    setError("");
    setFile(selected);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(selected);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview("");
  };

  const handleClose = () => {
    setReason("");
    setFile(null);
    setFilePreview("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError("Vui lòng nhập lý do khiếu nại.");
      return;
    }
    if (trimmedReason.length < 10) {
      setError("Lý do khiếu nại phải có ít nhất 10 ký tự.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await createDispute(bookingId, { reason: trimmedReason }, file ?? undefined);
      setReason("");
      setFile(null);
      setFilePreview("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Không thể gửi khiếu nại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal panel */}
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[92dvh] z-10">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-4 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 shrink-0">
            <Flag className="h-4 w-4 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground">Tạo khiếu nại / tranh chấp</h2>
            <p className="text-xs text-muted-foreground truncate">Mã lịch học: #{bookingId}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Warning */}
          <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed text-amber-800">
              Khiếu nại sẽ được gửi trực tiếp đến ban quản trị hệ thống và hiển thị trong danh sách tranh chấp của gia sư. Admin sẽ xử lý trong 1-2 ngày làm việc.
            </p>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Lý do khiếu nại <span className="text-destructive">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải (tối thiểu 10 ký tự)..."
              className="w-full min-h-24 rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
              maxLength={1000}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Tối thiểu 10 ký tự</span>
              <span className={reason.trim().length >= 950 ? "text-destructive font-medium" : ""}>
                {reason.trim().length}/1000
              </span>
            </div>
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">
              Hình ảnh bằng chứng (Tùy chọn)
            </label>
            {filePreview ? (
              <div className="relative aspect-video border border-border rounded-xl overflow-hidden group shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={filePreview} alt="Bằng chứng khiếu nại" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border border-dashed border-border rounded-xl p-5 cursor-pointer hover:bg-muted/30 hover:border-primary/50 transition-all text-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground/40 mb-1.5" />
                <span className="text-xs font-semibold text-foreground">Nhấp để chọn ảnh bằng chứng</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Hỗ trợ định dạng hình ảnh tối đa 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4 shrink-0">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="gap-1.5"
            loading={submitting}
            onClick={() => void handleSubmit()}
            disabled={submitting}
          >
            <Flag className="h-3.5 w-3.5" />
            Gửi khiếu nại
          </Button>
        </div>
      </div>
    </div>
  );
}
