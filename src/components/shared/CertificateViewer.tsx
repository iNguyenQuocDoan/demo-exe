"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, ExternalLink, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|avif)$/i;
const PDF_EXT = /\.pdf$/i;

export function certificateFileName(url: string) {
  try {
    const path = new URL(url, "http://x").pathname;
    return decodeURIComponent(path.split("/").pop() || url);
  } catch {
    return url.split("/").pop() || url;
  }
}

function kind(url: string): "image" | "pdf" | "other" {
  const clean = url.split("?")[0];
  if (IMAGE_EXT.test(clean)) return "image";
  if (PDF_EXT.test(clean)) return "pdf";
  return "other";
}

/**
 * Modal xem bằng cấp / chứng chỉ ở kích thước lớn.
 * Ảnh hiển thị trực tiếp, PDF nhúng iframe, định dạng khác cho tải về.
 * Nhiều file thì điều hướng bằng nút hoặc phím ← →.
 */
export function CertificateViewer({
  urls,
  index,
  onIndexChange,
  onClose,
}: {
  urls: string[];
  /** null = đóng modal */
  index: number | null;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const open = index !== null;
  const current = open ? urls[index] : undefined;
  const total = urls.length;
  // Ghi nhớ theo URL để đổi tài liệu là tự reset trạng thái lỗi
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const failed = !!current && failedUrl === current;

  const go = useCallback(
    (delta: number) => {
      if (index === null || total < 2) return;
      onIndexChange((index + delta + total) % total);
    },
    [index, total, onIndexChange],
  );

  useEffect(() => {
    if (!open || total < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, total, go]);

  if (index === null || !current) return null;

  const name = certificateFileName(current);
  const type = failed ? "other" : kind(current);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[min(96vw,72rem)] gap-0 border-border bg-card p-0 text-foreground">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 pr-12">
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-sm font-semibold">{name}</DialogTitle>
            <DialogDescription className="text-xs">
              {total > 1 ? `Tài liệu ${index + 1} / ${total}` : "Bằng cấp / chứng chỉ"}
            </DialogDescription>
          </div>
          <a
            href={current}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Mở tab mới</span>
          </a>
        </div>

        <div className="relative flex min-h-[50vh] items-center justify-center bg-muted/40 p-3 sm:p-4">
          {type === "image" && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={current}
              alt={name}
              className="max-h-[72vh] w-auto max-w-full rounded-lg object-contain shadow-sm"
              onError={() => setFailedUrl(current)}
            />
          )}

          {type === "pdf" && (
            <iframe
              src={current}
              title={name}
              className="h-[72vh] w-full rounded-lg border border-border bg-white"
            />
          )}

          {type === "other" && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <p className="max-w-sm text-sm text-muted-foreground">
                {failed
                  ? "Không hiển thị được tài liệu này trong trình duyệt."
                  : "Định dạng này không xem trực tiếp được."}{" "}
                Tải về để mở bằng ứng dụng trên máy.
              </p>
              <a
                href={current}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Download className="h-4 w-4" />
                Tải tài liệu
              </a>
            </div>
          )}

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Tài liệu trước"
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:left-4"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Tài liệu kế tiếp"
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:right-4"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
