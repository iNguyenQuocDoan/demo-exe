"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flag,
  XCircle,
  ShieldAlert,
} from "lucide-react";
import { getPendingDisputes, resolveDispute, type DisputeItem } from "@/api/feedbackApi";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const STATUS_META: Record<string, {
  label: string;
  color: string;
  variant: Parameters<typeof Badge>[0]["variant"];
}> = {
  PENDING: { label: "Chờ xử lý", color: "text-amber-600 border-amber-200 bg-amber-50", variant: "warning" },
  OPEN: { label: "Chờ xử lý", color: "text-amber-600 border-amber-200 bg-amber-50", variant: "warning" },
  RESOLVED: { label: "Đã giải quyết", color: "text-emerald-600 border-emerald-200 bg-emerald-50", variant: "success" },
  ACCEPTED: { label: "Đã giải quyết", color: "text-emerald-600 border-emerald-200 bg-emerald-50", variant: "success" },
  REJECTED: { label: "Bác bỏ", color: "text-rose-600 border-rose-200 bg-rose-50", variant: "destructive" },
  DISMISSED: { label: "Bác bỏ", color: "text-rose-600 border-rose-200 bg-rose-50", variant: "destructive" },
};

function getStatusDetails(status: string) {
  const normalized = (status ?? "").toUpperCase();
  if (normalized.includes("RESOLV") || normalized.includes("ACCEPT")) return STATUS_META.RESOLVED;
  if (normalized.includes("REJECT") || normalized.includes("DISMISS")) return STATUS_META.REJECTED;
  return STATUS_META.PENDING;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Resolution Modal State
  const [resolveTarget, setResolveTarget] = useState<DisputeItem | null>(null);
  const [refundToParent, setRefundToParent] = useState(true);
  const [adminResolution, setAdminResolution] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resolutionError, setResolutionError] = useState("");

  const loadDisputes = async () => {
    try {
      setError("");
      const list = await getPendingDisputes();
      // Lọc lại phòng hờ backend trả về cả resolved (Swagger ghi pending trả về pending, nhưng viết parser phòng thủ)
      const pendingList = list.filter(
        (item) => getStatusDetails(item.status) === STATUS_META.PENDING
      );
      setDisputes(pendingList);
    } catch (err: any) {
      setError(err?.message ?? "Không thể tải danh sách khiếu nại chờ xử lý.");
    }
  };

  useEffect(() => {
    setLoading(true);
    loadDisputes().finally(() => setLoading(false));
  }, []);

  const handleOpenResolve = (item: DisputeItem, refund: boolean) => {
    setResolveTarget(item);
    setRefundToParent(refund);
    setAdminResolution("");
    setResolutionError("");
  };

  const handleSubmitResolution = async () => {
    if (!resolveTarget) return;
    const trimmedResolution = adminResolution.trim();
    if (!trimmedResolution) {
      setResolutionError("Quyết định xử lý bắt buộc phải nhập.");
      return;
    }
    if (trimmedResolution.length < 10) {
      setResolutionError("Quyết định xử lý phải dài tối thiểu 10 ký tự.");
      return;
    }

    setResolutionError("");
    setSubmitting(true);
    try {
      await resolveDispute(resolveTarget.id, refundToParent, trimmedResolution);
      toast.success("Xử lý khiếu nại thành công!");
      setResolveTarget(null);
      setAdminResolution("");
      await loadDisputes();
    } catch (err: any) {
      setResolutionError(err?.message ?? "Không thể lưu quyết định xử lý.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <PageAnimations />
      <section className="pt-4 pb-8">
        <div className="site-container space-y-5">
          {/* Header */}
          <header className="surface-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 shrink-0">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">Xử lý Tranh chấp & Khiếu nại</h1>
                    {disputes.length > 0 && (
                      <Badge variant="destructive">{disputes.length} chờ xử lý</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Trang dành riêng cho Quản trị viên xem xét lý do và đưa ra quyết định hoàn tiền cho phụ huynh.
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/admin">Quay lại dashboard</Link>
              </Button>
            </div>
          </header>

          {/* List Content */}
          <div className="surface-card p-5 space-y-4">
            {error && (
              <div className="text-sm text-destructive py-6 text-center bg-destructive/5 rounded-xl border border-destructive/10">
                {error}
              </div>
            )}

            {!error && disputes.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 opacity-60" />
                <p className="text-sm font-semibold">Tất cả sạch sẽ!</p>
                <p className="text-xs">Không có báo cáo tranh chấp nào đang chờ xử lý.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map((item) => {
                  const statusDetails = getStatusDetails(item.status);
                  const createdDate = new Date(item.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={item.id}
                      className="border border-border/80 rounded-xl bg-card overflow-hidden hover:border-primary/20 transition-all p-5 flex flex-col gap-4 shadow-sm"
                    >
                      {/* Meta header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusDetails.color}`}>
                            {statusDetails.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Khiếu nại: <span className="font-mono font-medium text-foreground">{item.id.slice(0, 8)}...</span>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Lịch học: <span className="font-mono font-medium text-foreground">{item.bookingId.slice(0, 8)}...</span>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Loại: <span className="font-medium text-foreground">{item.type || "PARENT_TO_TUTOR"}</span>
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{createdDate}</span>
                      </div>

                      {/* Parties */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 space-y-0.5">
                          <p className="text-xs font-bold text-amber-700 uppercase">Người khiếu nại (Phụ huynh)</p>
                          <p className="text-sm font-semibold text-foreground">{item.parentEmail}</p>
                        </div>
                        <div className="rounded-xl border border-blue-200 bg-blue-50/35 p-3.5 space-y-0.5">
                          <p className="text-xs font-bold text-blue-700 uppercase">Bên bị khiếu nại (Gia sư)</p>
                          <p className="text-sm font-semibold text-foreground">{item.tutorName}</p>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Lý do khiếu nại:</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap bg-background p-3 rounded-lg border border-border/50 leading-relaxed">
                          {item.reason}
                        </p>
                      </div>

                      {/* Responder reply if any */}
                      {item.responderReply && (
                        <div className="space-y-1 pl-4 border-l-2 border-primary/40">
                          <p className="text-xs font-bold text-primary uppercase tracking-wide">Phản hồi của Gia sư:</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap bg-primary/5 p-3 rounded-lg border border-primary/10 leading-relaxed">
                            {item.responderReply}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3">
                        <Link href={`/admin/disputes/${item.id}`}>
                          <Button size="sm" variant="ghost" className="gap-1 text-muted-foreground">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Xem chi tiết đầy đủ
                          </Button>
                        </Link>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                            onClick={() => handleOpenResolve(item, true)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Hoàn tiền cho phụ huynh
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5"
                            onClick={() => handleOpenResolve(item, false)}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Không hoàn tiền
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Resolution Modal */}
      {resolveTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setResolveTarget(null)} />

          <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[92dvh] z-10 animate-scale-in">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border px-5 py-4 shrink-0">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                refundToParent ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}>
                {refundToParent ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-foreground">Quyết định xử lý tranh chấp</h2>
                <p className="text-xs text-muted-foreground truncate">Khiếu nại: #{resolveTarget.id.slice(0, 8)}...</p>
              </div>
              <button
                type="button"
                onClick={() => setResolveTarget(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <div className="space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border text-xs leading-relaxed text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">Phương án xử lý:</span>{" "}
                  {refundToParent ? (
                    <span className="text-emerald-700 font-semibold">Hoàn tiền 100% cho phụ huynh</span>
                  ) : (
                    <span className="text-rose-700 font-semibold">Không hoàn tiền (bác bỏ khiếu nại)</span>
                  )}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-foreground">Booking ID:</span> {resolveTarget.bookingId}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Ghi chú / Quyết định xử lý <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={adminResolution}
                  onChange={(e) => setAdminResolution(e.target.value)}
                  placeholder="Nhập ghi chú quyết định xử lý rõ ràng của admin (tối thiểu 10 ký tự)..."
                  className="w-full min-h-28 rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  maxLength={1000}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Tối thiểu 10 ký tự</span>
                  <span>{adminResolution.trim().length}/1000</span>
                </div>
              </div>

              {resolutionError && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-xs text-destructive">{resolutionError}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setResolveTarget(null)} disabled={submitting}>
                Hủy
              </Button>
              <Button
                size="sm"
                className={refundToParent ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"}
                loading={submitting}
                onClick={() => void handleSubmitResolution()}
                disabled={submitting}
              >
                Xác nhận & Lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
