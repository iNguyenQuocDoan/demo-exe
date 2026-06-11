"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  BookOpen,
  Calendar,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getPendingDisputes, resolveDispute, type DisputeItem } from "@/api/feedbackApi";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { toast } from "sonner";

const STATUS_META: Record<string, {
  label: string;
  color: string;
  variant: Parameters<typeof Badge>[0]["variant"];
}> = {
  PENDING: { label: "Chờ xử lý", color: "text-amber-600 border-amber-200 bg-amber-50", variant: "warning" },
  OPEN: { label: "Chờ xử lý", color: "text-amber-600 border-amber-200 bg-amber-50", variant: "warning" },
  RESOLVED: { label: "Đã hoàn tiền", color: "text-emerald-600 border-emerald-200 bg-emerald-50", variant: "success" },
  ACCEPTED: { label: "Đã hoàn tiền", color: "text-emerald-600 border-emerald-200 bg-emerald-50", variant: "success" },
  REJECTED: { label: "Bác bỏ", color: "text-rose-600 border-rose-200 bg-rose-50", variant: "destructive" },
  DISMISSED: { label: "Bác bỏ", color: "text-rose-600 border-rose-200 bg-rose-50", variant: "destructive" },
};

function getStatusDetails(status: string) {
  const normalized = (status ?? "").toUpperCase();
  if (normalized.includes("RESOLV") || normalized.includes("ACCEPT")) return STATUS_META.RESOLVED;
  if (normalized.includes("REJECT") || normalized.includes("DISMISS")) return STATUS_META.REJECTED;
  return STATUS_META.PENDING;
}

export default function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<DisputeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminResolution, setAdminResolution] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadReport = async () => {
    try {
      const list = await getPendingDisputes();
      const item = list.find((d) => d.id === id);
      if (item) {
        setReport(item);
      } else {
        setError("Không tìm thấy khiếu nại đang chờ xử lý này.");
      }
    } catch (err: any) {
      setError(err?.message ?? "Không thể tải chi tiết khiếu nại.");
    }
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    loadReport().finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (refund: boolean) => {
    if (!report) return;
    const trimmedResolution = adminResolution.trim();
    if (!trimmedResolution) {
      toast.error("Vui lòng nhập ghi chú / quyết định xử lý.");
      return;
    }
    if (trimmedResolution.length < 10) {
      toast.error("Quyết định xử lý phải dài tối thiểu 10 ký tự.");
      return;
    }

    setSaving(true);
    try {
      await resolveDispute(report.id, refund, trimmedResolution);
      toast.success("Xử lý khiếu nại thành công!");
      router.push("/admin/disputes");
    } catch (err: any) {
      toast.error(err?.message ?? "Có lỗi xảy ra khi xử lý khiếu nại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="mx-auto max-w-3xl space-y-4 p-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </section>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-dvh bg-(--bg-app) flex flex-col items-center justify-center p-6 gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground font-semibold text-center">
          {error || "Không tìm thấy thông tin khiếu nại."}
        </p>
        <Button variant="outline" onClick={() => router.push("/admin/disputes")}>
          Quay lại danh sách
        </Button>
      </main>
    );
  }

  const meta = getStatusDetails(report.status);
  const createdDate = new Date(report.createdAt).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <main className="min-h-dvh bg-(--bg-app) py-6">
      <PageAnimations />
      <div className="mx-auto max-w-3xl space-y-6 px-4">
        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/disputes")} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold truncate">Chi tiết khiếu nại #{report.id.slice(0, 8)}...</h1>
              <Badge variant={meta.variant}>{meta.label}</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Ngày tạo: {createdDate}</p>
          </div>
        </div>

        {/* Parties */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Người khiếu nại (Phụ huynh)</p>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm truncate">{report.parentEmail}</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bên bị khiếu nại (Gia sư)</p>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-rose-500" />
              <span className="font-semibold text-sm truncate">{report.tutorName}</span>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border/50 pb-3 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Booking ID:</span>
              <span className="font-mono font-medium text-foreground">{report.bookingId}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              <span className="text-muted-foreground">Loại tranh chấp:</span>
              <span className="font-medium text-foreground">{report.type || "PARENT_TO_TUTOR"}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Nội dung khiếu nại:</p>
            <p className="rounded-lg bg-background border border-border/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {report.reason}
            </p>
          </div>

          {report.responderReply && (
            <div className="space-y-1.5 border-l-2 border-primary/40 pl-4">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">Phản hồi của Gia sư:</p>
              <p className="rounded-lg bg-primary/5 border border-primary/10 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {report.responderReply}
              </p>
            </div>
          )}
        </div>

        {/* Admin Action Form */}
        {getStatusDetails(report.status) === STATUS_META.PENDING && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border/50 pb-3">
              <ShieldAlert className="h-4 w-4 text-primary" />
              <p className="font-semibold text-sm sm:text-base">Quyết định xử lý của Admin</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Ghi chú / Quyết định xử lý bắt buộc <span className="text-destructive">*</span>
              </label>
              <textarea
                value={adminResolution}
                onChange={(e) => setAdminResolution(e.target.value)}
                rows={4}
                placeholder="Vui lòng nhập đầy đủ ghi chú quyết định (tối thiểu 10 ký tự)..."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tối thiểu 10 ký tự</span>
                <span>{adminResolution.trim().length} ký tự</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <Button
                onClick={() => void handleAction(true)}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" /> Giải quyết (Hoàn tiền PH)
              </Button>
              <Button
                variant="destructive"
                onClick={() => void handleAction(false)}
                disabled={saving}
                className="gap-1.5"
              >
                <XCircle className="h-4 w-4" /> Bác bỏ (Không hoàn tiền)
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/disputes")}
                disabled={saving}
              >
                Quay lại
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
