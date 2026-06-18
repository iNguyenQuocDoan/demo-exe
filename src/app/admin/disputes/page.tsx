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
  X,
} from "lucide-react";
import { getPendingDisputes, resolveDispute, type DisputeItem } from "@/api/feedbackApi";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatVietnamDateTime } from "@/lib/utils";

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

  // Nâng cấp: State kiểm soát hiển thị form xử lý & lỗi ảnh bằng chứng
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [openedFromDetail, setOpenedFromDetail] = useState(false);
  const [sendImgError, setSendImgError] = useState(false);
  const [replyImgError, setReplyImgError] = useState(false);

  // State phóng to ảnh
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
    setShowResolveForm(true);
    setOpenedFromDetail(false);
    setSendImgError(false);
    setReplyImgError(false);
  };

  const handleOpenDetailOnly = (item: DisputeItem) => {
    setResolveTarget(item);
    setRefundToParent(true);
    setAdminResolution("");
    setResolutionError("");
    setShowResolveForm(false);
    setOpenedFromDetail(true);
    setSendImgError(false);
    setReplyImgError(false);
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
      await resolveDispute(resolveTarget.id, {
        refundToParent,
        adminResolution: trimmedResolution,
      });
      toast.success("Xử lý khiếu nại thành công!");
      setResolveTarget(null);
      setAdminResolution("");
      setShowResolveForm(false);
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
                  const createdDate = formatVietnamDateTime(item.createdAt);

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

                      {/* Evidence Images */}
                      {(item.evidenceSendUrl || item.evidenceReplyUrl) && (
                        <div className="grid grid-cols-2 gap-4 pt-1">
                          {item.evidenceSendUrl && (
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-muted-foreground uppercase">Ảnh bằng chứng khiếu nại:</p>
                              <div
                                onClick={() => setPreviewImage(item.evidenceSendUrl!)}
                                className="relative aspect-video max-w-[200px] border border-border rounded-lg overflow-hidden group cursor-pointer hover:border-primary/50 transition-all bg-muted/20 shadow-sm"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.evidenceSendUrl} alt="Bằng chứng khiếu nại" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="text-white text-[10px] font-medium bg-black/50 px-1.5 py-0.5 rounded">Xem</span>
                                </div>
                              </div>
                            </div>
                          )}
                          {item.evidenceReplyUrl && (
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-muted-foreground uppercase">Ảnh bằng chứng phản hồi:</p>
                              <div
                                onClick={() => setPreviewImage(item.evidenceReplyUrl!)}
                                className="relative aspect-video max-w-[200px] border border-border rounded-lg overflow-hidden group cursor-pointer hover:border-primary/50 transition-all bg-muted/20 shadow-sm"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.evidenceReplyUrl} alt="Bằng chứng phản hồi" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="text-white text-[10px] font-medium bg-black/50 px-1.5 py-0.5 rounded">Xem</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 text-muted-foreground"
                          onClick={() => handleOpenDetailOnly(item)}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Xem chi tiết đầy đủ
                        </Button>

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

          <div className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[92dvh] z-10 animate-scale-in">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border px-5 py-4 shrink-0">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                showResolveForm 
                  ? (refundToParent ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800")
                  : "bg-primary/10 text-primary"
              }`}>
                {showResolveForm 
                  ? (refundToParent ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />)
                  : <Flag className="h-4 w-4" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-foreground">
                  {showResolveForm ? "Quyết định xử lý tranh chấp" : "Chi tiết khiếu nại & tranh chấp"}
                </h2>
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
            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              
              {/* Section 1: Thông tin chung */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Thông tin chung</h3>
                <div className="grid grid-cols-1 gap-2 text-xs bg-muted/40 p-3 rounded-xl border border-border/60">
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Mã khiếu nại đầy đủ:</span>
                    <span className="font-mono font-medium text-foreground text-right break-all ml-4 select-all">{resolveTarget.id}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Mã lịch học đầy đủ:</span>
                    <span className="font-mono font-medium text-foreground text-right break-all ml-4 select-all">{resolveTarget.bookingId}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Thời gian tạo:</span>
                    <span className="font-medium text-foreground">{formatVietnamDateTime(resolveTarget.createdAt)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Loại khiếu nại:</span>
                    <span className="font-medium text-foreground">
                      {resolveTarget.type === "PARENT_TO_TUTOR"
                        ? "Phụ huynh khiếu nại Gia sư"
                        : resolveTarget.type === "TUTOR_TO_PARENT"
                          ? "Gia sư khiếu nại Phụ huynh"
                          : resolveTarget.type || "Chưa xác định"}
                    </span>
                  </div>
                </div>

                {/* Hộp thông tin hai bên */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 space-y-0.5 text-xs">
                    <p className="font-bold text-amber-700 uppercase">Người khiếu nại</p>
                    <p className="font-semibold text-foreground truncate" title={resolveTarget.parentEmail}>{resolveTarget.parentEmail}</p>
                    <p className="text-[10px] text-muted-foreground">Vai trò: Phụ huynh</p>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50/35 p-3 space-y-0.5 text-xs">
                    <p className="font-bold text-blue-700 uppercase">Bên bị khiếu nại</p>
                    <p className="font-semibold text-foreground truncate" title={resolveTarget.tutorName}>{resolveTarget.tutorName}</p>
                    <p className="text-[10px] text-muted-foreground">Vai trò: Gia sư</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Nội dung khiếu nại & phản hồi */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nội dung báo cáo</h3>
                
                {/* Lý do khiếu nại */}
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Lý do khiếu nại của {resolveTarget.type === "TUTOR_TO_PARENT" ? "Gia sư" : "Phụ huynh"}:
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap bg-background p-3 rounded-lg border border-border/50 leading-relaxed max-h-36 overflow-y-auto">
                    {resolveTarget.reason}
                  </p>
                </div>

                {/* Phản hồi */}
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Phản hồi từ {resolveTarget.type === "TUTOR_TO_PARENT" ? "Phụ huynh" : "Gia sư"}:
                  </p>
                  {resolveTarget.responderReply ? (
                    <p className="text-sm text-foreground whitespace-pre-wrap bg-primary/5 p-3 rounded-lg border border-primary/10 leading-relaxed max-h-36 overflow-y-auto">
                      {resolveTarget.responderReply}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic bg-muted/30 p-2.5 rounded-lg border border-border/40 text-center">
                      Chưa có phản hồi từ {resolveTarget.type === "TUTOR_TO_PARENT" ? "phụ huynh" : "gia sư"}.
                    </p>
                  )}
                </div>
              </div>

              {/* Section 3: Bằng chứng hình ảnh */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ảnh bằng chứng</h3>
                
                {!resolveTarget.evidenceSendUrl && !resolveTarget.evidenceReplyUrl ? (
                  <div className="text-xs text-muted-foreground italic bg-muted/20 border border-dashed border-border rounded-xl py-6 text-center">
                    Không có ảnh bằng chứng
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {resolveTarget.evidenceSendUrl && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                          Bằng chứng từ người khiếu nại:
                        </span>
                        {sendImgError ? (
                          <div className="flex flex-col items-center justify-center border border-destructive/20 bg-destructive/5 text-destructive rounded-lg aspect-video w-full text-[10px] font-medium p-2 text-center">
                            Không thể tải ảnh bằng chứng
                          </div>
                        ) : (
                          <div className="relative aspect-video w-full border border-border rounded-lg overflow-hidden group cursor-pointer bg-muted/20 shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={resolveTarget.evidenceSendUrl} 
                              alt="Bằng chứng khiếu nại" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                              onClick={() => setPreviewImage(resolveTarget.evidenceSendUrl!)}
                              onError={() => setSendImgError(true)}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity" onClick={() => setPreviewImage(resolveTarget.evidenceSendUrl!)}>
                              <span className="text-white text-[9px] font-medium bg-black/50 px-1.5 py-0.5 rounded">Xem lớn</span>
                            </div>
                          </div>
                        )}
                        <button 
                          type="button"
                          onClick={() => window.open(resolveTarget.evidenceSendUrl, "_blank")} 
                          className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> Mở tab mới
                        </button>
                      </div>
                    )}

                    {resolveTarget.evidenceReplyUrl && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                          Bằng chứng phản hồi:
                        </span>
                        {replyImgError ? (
                          <div className="flex flex-col items-center justify-center border border-destructive/20 bg-destructive/5 text-destructive rounded-lg aspect-video w-full text-[10px] font-medium p-2 text-center">
                            Không thể tải ảnh bằng chứng
                          </div>
                        ) : (
                          <div className="relative aspect-video w-full border border-border rounded-lg overflow-hidden group cursor-pointer bg-muted/20 shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={resolveTarget.evidenceReplyUrl} 
                              alt="Bằng chứng phản hồi" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                              onClick={() => setPreviewImage(resolveTarget.evidenceReplyUrl!)}
                              onError={() => setReplyImgError(true)}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity" onClick={() => setPreviewImage(resolveTarget.evidenceReplyUrl!)}>
                              <span className="text-white text-[9px] font-medium bg-black/50 px-1.5 py-0.5 rounded">Xem lớn</span>
                            </div>
                          </div>
                        )}
                        <button 
                          type="button"
                          onClick={() => window.open(resolveTarget.evidenceReplyUrl, "_blank")} 
                          className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> Mở tab mới
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 4: Quyết định Admin */}
              <div className="space-y-3 border-t border-border/50 pt-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quyết định của Admin</h3>
                
                {!showResolveForm ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs py-5 rounded-xl shadow-sm"
                      onClick={() => {
                        setRefundToParent(true);
                        setShowResolveForm(true);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Hoàn tiền cho PH
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5 text-xs py-5 rounded-xl"
                      onClick={() => {
                        setRefundToParent(false);
                        setShowResolveForm(true);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                      Không hoàn tiền
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 bg-muted/20 p-3.5 rounded-xl border border-border/80">
                    {/* Refund choice selection inside modal */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground block">
                        Phương án xử lý <span className="text-destructive">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRefundToParent(true)}
                          className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all ${
                            refundToParent
                              ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                              : "border-border bg-background text-muted-foreground hover:border-emerald-300"
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Hoàn tiền cho PH
                        </button>
                        <button
                          type="button"
                          onClick={() => setRefundToParent(false)}
                          className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all ${
                            !refundToParent
                              ? "border-rose-500 bg-rose-50 text-rose-800 shadow-sm"
                              : "border-border bg-background text-muted-foreground hover:border-rose-300"
                          }`}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Không hoàn tiền
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Kết luận / Quyết định xử lý <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        value={adminResolution}
                        onChange={(e) => setAdminResolution(e.target.value)}
                        placeholder="Nhập ghi chú kết luận xử lý rõ ràng của admin (tối thiểu 10 ký tự)..."
                        className="w-full min-h-20 rounded-lg border border-border bg-background px-3 py-2 text-xs resize-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        maxLength={1000}
                      />
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Tối thiểu 10 ký tự</span>
                        <span>{adminResolution.trim().length}/1000</span>
                      </div>
                    </div>

                    {resolutionError && (
                      <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                        <p className="text-[10px] text-destructive leading-relaxed">{resolutionError}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4 shrink-0">
              {!showResolveForm ? (
                <Button variant="outline" size="sm" onClick={() => setResolveTarget(null)}>
                  Đóng
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={submitting}
                    onClick={() => {
                      if (openedFromDetail) {
                        setShowResolveForm(false);
                      } else {
                        setResolveTarget(null);
                      }
                    }}
                  >
                    {openedFromDetail ? "Quay lại" : "Hủy"}
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
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Large Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)} />
          <div className="relative max-w-2xl w-full aspect-video rounded-xl overflow-hidden z-10 border border-border bg-card shadow-2xl flex flex-col">
            <div className="absolute top-3 right-3 z-20">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewImage} alt="Ảnh bằng chứng lớn" className="w-full h-full object-contain bg-black" />
          </div>
        </div>
      )}
    </main>
  );
}
