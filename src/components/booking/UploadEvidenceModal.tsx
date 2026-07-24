"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startBooking, tutorCompleteBooking } from "@/api/bookingApi";
import { toast } from "sonner";

interface Props {
  bookingId: string;
  type: "start" | "complete";
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadEvidenceModal({ bookingId, type, open, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const title = type === "start" ? "Bắt đầu buổi học" : "Báo cáo dạy xong";
  const description =
    type === "start"
      ? "Vui lòng tải lên ảnh bằng chứng (chụp cùng học sinh hoặc tại địa điểm dạy) để xác nhận bắt đầu buổi học."
      : "Vui lòng tải lên ảnh bằng chứng (vở ghi, bài tập đã hoàn thành hoặc phòng học) để xác nhận hoàn thành buổi học.";

  const handleFileChange = (selectedFile: File) => {
    setError("");
    
    // Validate file type
    if (!selectedFile.type.startsWith("image/")) {
      setError("Chỉ chấp nhận file ảnh (PNG, JPG, JPEG...).");
      return;
    }

    // Validate size (5MB = 5 * 1024 * 1024)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Dung lượng ảnh không được vượt quá 5MB.");
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0]);
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Vui lòng chọn hoặc tải lên một hình ảnh bằng chứng.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      let res;
      if (type === "start") {
        res = await startBooking(bookingId, file);
      } else {
        res = await tutorCompleteBooking(bookingId, file);
      }

      if (res.ok) {
        toast.success(
          type === "start"
            ? "Đã xác nhận bắt đầu buổi học thành công!"
            : "Đã báo cáo hoàn thành buổi học thành công!"
        );
        clearFile();
        onSuccess();
        onClose();
      } else {
        setError(res.error ?? "Thao tác thất bại. Vui lòng thử lại.");
        toast.error(res.error ?? "Có lỗi xảy ra.");
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message ?? "Không thể gửi dữ liệu lên máy chủ.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    clearFile();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal panel */}
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[92dvh] z-10 animate-scale-in">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-4 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Upload className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground truncate">Mã booking: #{bookingId.slice(0, 8)}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Đóng"
            title="Đóng"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>

          {/* Upload Area */}
          {!previewUrl ? (
            <div
              onDragOver={onDragOver}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-all gap-3 text-center"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={onInputChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5">
                <FileImage className="h-6 w-6 text-primary/70" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Kéo thả ảnh hoặc nhấn để duyệt
                </p>
                <p className="text-xs text-muted-foreground">
                  Hỗ trợ PNG, JPG, JPEG (Tối đa 5MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="relative border border-border rounded-xl overflow-hidden bg-muted/20 p-2">
              <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Ảnh bằng chứng"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between mt-2 px-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs text-foreground truncate font-medium max-w-[200px]">
                    {file?.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    ({file ? (file.size / (1024 * 1024)).toFixed(2) : 0} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  disabled={submitting}
                  className="flex h-7 px-2 items-center gap-1 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" /> Xóa ảnh
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 animate-fade-in">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-destructive leading-tight">{error}</p>
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
            loading={submitting}
            onClick={() => void handleSubmit()}
            disabled={submitting || !file}
          >
            {type === "start" ? "Xác nhận bắt đầu" : "Báo cáo dạy xong"}
          </Button>
        </div>
      </div>
    </div>
  );
}
