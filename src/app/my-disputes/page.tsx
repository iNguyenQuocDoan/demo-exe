"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Flag,
  MessageSquare,
  XCircle,
  Search,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { getMyDisputes, replyDispute, type DisputeItem } from "@/api/feedbackApi";
import { useAuthStore } from "@/store/useAuthStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { toast } from "sonner";
import { formatVietnamDateTime } from "@/lib/utils";

const STATUS_META: Record<string, {
  label: string;
  color: string;
  variant: Parameters<typeof Badge>[0]["variant"];
}> = {
  PENDING: { label: "Chờ xử lý", color: "text-amber-600 border-amber-200 bg-amber-50", variant: "warning" },
  OPEN: { label: "Chờ xử lý", color: "text-amber-600 border-amber-200 bg-amber-50", variant: "warning" },
  RESOLVED: { label: "Đã hoàn tiền", color: "text-emerald-600 border-emerald-200 bg-emerald-50", variant: "success" },
  ACCEPTED: { label: "Đã hoàn tiền", color: "text-emerald-600 border-emerald-200 bg-emerald-50", variant: "success" },
  REJECTED: { label: "Bác bỏ (Không hoàn tiền)", color: "text-rose-600 border-rose-200 bg-rose-50", variant: "destructive" },
  DISMISSED: { label: "Bác bỏ (Không hoàn tiền)", color: "text-rose-600 border-rose-200 bg-rose-50", variant: "destructive" },
};

function getStatusDetails(status: string) {
  const normalized = (status ?? "").toUpperCase();
  if (normalized.includes("RESOLV") || normalized.includes("ACCEPT")) return STATUS_META.RESOLVED;
  if (normalized.includes("REJECT") || normalized.includes("DISMISS")) return STATUS_META.REJECTED;
  return STATUS_META.PENDING;
}

export default function MyDisputesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State modal phản hồi
  const [replyTarget, setReplyTarget] = useState<DisputeItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [replyFilePreview, setReplyFilePreview] = useState<string>("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState("");

  // State phóng to ảnh
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Bộ lọc tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "resolved" | "rejected">("all");

  const loadDisputes = async () => {
    try {
      setError("");
      const data = await getMyDisputes();
      // Sắp xếp khiếu nại mới nhất lên đầu
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setDisputes(sorted);
    } catch (err: any) {
      setError(err?.message ?? "Không thể tải danh sách khiếu nại.");
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setLoading(true);
    loadDisputes().finally(() => setLoading(false));
  }, [user, authLoading]);

  // Bộ lọc dữ liệu
  const filteredDisputes = useMemo(() => {
    return disputes.filter((item) => {
      // Lọc theo text (tutorName, parentEmail, bookingId, reason)
      const matchesSearch =
        item.tutorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.parentEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bookingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Lọc theo trạng thái
      const statusDetails = getStatusDetails(item.status);
      if (statusFilter === "pending") {
        return statusDetails === STATUS_META.PENDING;
      }
      if (statusFilter === "resolved") {
        return statusDetails === STATUS_META.RESOLVED;
      }
      if (statusFilter === "rejected") {
        return statusDetails === STATUS_META.REJECTED;
      }
      return true;
    });
  }, [disputes, searchQuery, statusFilter]);

  const handleReplyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setReplyError("Chỉ chấp nhận file định dạng hình ảnh.");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setReplyError("Kích thước file ảnh không được vượt quá 5MB.");
      return;
    }

    setReplyError("");
    setReplyFile(selected);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReplyFilePreview(reader.result as string);
    };
    reader.readAsDataURL(selected);
  };

  const handleRemoveReplyFile = () => {
    setReplyFile(null);
    setReplyFilePreview("");
  };

  // Xử lý gửi phản hồi
  const handleSendReply = async () => {
    if (!replyTarget) return;
    const trimmedReply = replyText.trim();
    if (!trimmedReply) {
      setReplyError("Vui lòng nhập nội dung phản hồi.");
      return;
    }
    if (trimmedReply.length < 5) {
      setReplyError("Nội dung phản hồi phải tối thiểu 5 ký tự.");
      return;
    }

    setReplyError("");
    setSubmittingReply(true);
    try {
      await replyDispute(
        replyTarget.id,
        trimmedReply,
        replyFile ?? undefined
      );
      toast.success("Gửi phản hồi thành công!");
      setReplyTarget(null);
      setReplyText("");
      setReplyFile(null);
      setReplyFilePreview("");
      // Tải lại danh sách
      await loadDisputes();
    } catch (err: any) {
      setReplyError(err?.message ?? "Không thể gửi phản hồi.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const pendingCount = disputes.filter(
    (item) => getStatusDetails(item.status) === STATUS_META.PENDING
  ).length;

  if (authLoading || loading) {
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
                  <Flag className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">Tranh chấp & Khiếu nại của tôi</h1>
                    {pendingCount > 0 && (
                      <Badge variant="warning">{pendingCount} chờ xử lý</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Quản lý, xem và gửi phản hồi các khiếu nại giữa phụ huynh và gia sư.
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href={user?.role === "tutor" ? "/dashboard/tutor" : "/parent/bookings"}>
                  <ArrowLeft className="h-4 w-4" /> Quay lại
                </Link>
              </Button>
            </div>
          </header>

          {/* Controls */}
          <div className="surface-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm theo ID, tên, nội dung khiếu nại..."
                className="w-full pl-9 pr-4 py-2 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === "all"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/30"
                }`}
              >
                Tất cả ({disputes.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("pending")}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === "pending"
                    ? "border-amber-400 bg-amber-50 text-amber-800"
                    : "border-border bg-background text-muted-foreground hover:border-amber-300"
                }`}
              >
                Chờ xử lý ({disputes.filter(d => getStatusDetails(d.status) === STATUS_META.PENDING).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("resolved")}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === "resolved"
                    ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                    : "border-border bg-background text-muted-foreground hover:border-emerald-300"
                }`}
              >
                Đã hoàn tiền ({disputes.filter(d => getStatusDetails(d.status) === STATUS_META.RESOLVED).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("rejected")}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === "rejected"
                    ? "border-rose-400 bg-rose-50 text-rose-800"
                    : "border-border bg-background text-muted-foreground hover:border-rose-300"
                }`}
              >
                Bác bỏ ({disputes.filter(d => getStatusDetails(d.status) === STATUS_META.REJECTED).length})
              </button>
            </div>
          </div>

          {/* List content */}
          {error && (
            <div className="surface-card p-5 text-sm text-destructive text-center">
              {error}
            </div>
          )}

          {!error && filteredDisputes.length === 0 ? (
            <div className="surface-card py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <AlertTriangle className="h-10 w-10 opacity-30 text-amber-500" />
              <p className="text-sm font-semibold">Không tìm thấy tranh chấp nào.</p>
              <p className="text-xs">Các tranh chấp hoặc khiếu nại của bạn sẽ hiển thị tại đây.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDisputes.map((item) => {
                const statusDetails = getStatusDetails(item.status);
                const isTutor = user?.role === "tutor";
                const isParent = user?.role === "parent";
                const isPending = statusDetails === STATUS_META.PENDING;
                const hasNoReply = !item.responderReply;

                const isTutorTarget = item.type === "PARENT_TO_TUTOR" || !item.type;
                const isParentTarget = item.type === "TUTOR_TO_PARENT";

                const canReply = isPending && hasNoReply && (
                  (isTutor && isTutorTarget) ||
                  (isParent && isParentTarget)
                );
                
                const createdDate = formatVietnamDateTime(item.createdAt);
                const responderLabel = item.type === "TUTOR_TO_PARENT" ? "Phụ huynh" : "Gia sư";

                return (
                  <article
                    key={item.id}
                    className="surface-card p-5 border border-border/60 hover:border-primary/30 transition-all flex flex-col gap-4 shadow-sm"
                  >
                    {/* Header info */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusDetails.color}`}>
                          {statusDetails.label}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          Khiếu nại: #{item.id.slice(0, 8)}...
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          Lịch học: #{item.bookingId.slice(0, 8)}...
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{createdDate}</span>
                    </div>

                    {/* Parties details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-muted/30 p-3.5 rounded-xl border border-border/40">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Người khiếu nại (Phụ huynh)</p>
                        <p className="text-sm font-medium text-foreground">{item.parentEmail}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Bên bị khiếu nại (Gia sư)</p>
                        <p className="text-sm font-medium text-foreground">{item.tutorName}</p>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lý do khiếu nại:</h4>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-background p-3 rounded-lg border border-border/45">
                        {item.reason}
                      </p>
                    </div>

                    {/* Responder reply */}
                    {item.responderReply ? (
                      <div className="space-y-1 pl-4 border-l-2 border-primary/40">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Phản hồi của {responderLabel}:</h4>
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-primary/5 p-3 rounded-lg border border-primary/10">
                          {item.responderReply}
                        </p>
                      </div>
                    ) : (
                      !canReply && (
                        <div className="text-xs text-muted-foreground italic flex items-center gap-1.5 bg-muted/40 p-2.5 rounded-lg border border-border/30">
                          <Clock className="h-3.5 w-3.5" />
                          Chưa có phản hồi từ {responderLabel.toLowerCase()}.
                        </div>
                      )
                    )}

                    {/* Evidence Images */}
                    {(item.evidenceSendUrl || item.evidenceReplyUrl) && (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        {item.evidenceSendUrl && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground block uppercase">Ảnh bằng chứng khiếu nại:</span>
                            <div
                              onClick={() => setPreviewImage(item.evidenceSendUrl!)}
                              className="relative aspect-video max-w-[200px] border border-border rounded-lg overflow-hidden group cursor-pointer hover:border-primary/50 transition-all shadow-sm bg-muted/20"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.evidenceSendUrl} alt="Bằng chứng gửi" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-white text-[10px] font-medium bg-black/50 px-1.5 py-0.5 rounded">Xem</span>
                              </div>
                            </div>
                          </div>
                        )}
                        {item.evidenceReplyUrl && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground block uppercase">Ảnh bằng chứng phản hồi:</span>
                            <div
                              onClick={() => setPreviewImage(item.evidenceReplyUrl!)}
                              className="relative aspect-video max-w-[200px] border border-border rounded-lg overflow-hidden group cursor-pointer hover:border-primary/50 transition-all shadow-sm bg-muted/20"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.evidenceReplyUrl} alt="Bằng chứng nhận" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-white text-[10px] font-medium bg-black/50 px-1.5 py-0.5 rounded">Xem</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2.5 pt-1">
                      <Button asChild size="sm" variant="outline">
                        <Link href={isTutor ? `/tutor/bookings/${item.bookingId}` : `/parent/bookings/${item.bookingId}`}>
                          Xem chi tiết lịch học
                        </Link>
                      </Button>
                      
                      {canReply && (
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => {
                            setReplyTarget(item);
                            setReplyText("");
                            setReplyFile(null);
                            setReplyFilePreview("");
                            setReplyError("");
                          }}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Gửi phản hồi
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modal phản hồi của Gia sư */}
      {replyTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReplyTarget(null)} />
          
          <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[92dvh] z-10 animate-scale-in">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border px-5 py-4 shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-foreground">Phản hồi khiếu nại</h2>
                <p className="text-xs text-muted-foreground truncate">Mã khiếu nại: #{replyTarget.id.slice(0, 8)}...</p>
              </div>
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Nội dung khiếu nại của {replyTarget.type === "TUTOR_TO_PARENT" ? "Gia sư" : "Phụ huynh"}:</p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg border border-border/50 text-foreground italic whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed">
                  {replyTarget.reason}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Nội dung phản hồi từ bạn <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập nội dung phản hồi để làm rõ sự việc (tối thiểu 5 ký tự)..."
                  className="w-full min-h-24 rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                  maxLength={1000}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Tối thiểu 5 ký tự</span>
                  <span>{replyText.trim().length}/1000</span>
                </div>
              </div>

              {/* Evidence Upload for Reply */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Hình ảnh bằng chứng phản hồi (Tùy chọn)
                </label>
                {replyFilePreview ? (
                  <div className="relative aspect-video border border-border rounded-xl overflow-hidden group shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={replyFilePreview} alt="Bằng chứng phản hồi" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveReplyFile}
                      className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-sm"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border border-dashed border-border rounded-xl p-4 cursor-pointer hover:bg-muted/30 hover:border-primary/50 transition-all text-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground/40 mb-1" />
                    <span className="text-xs font-semibold text-foreground">Nhấp để chọn ảnh bằng chứng phản hồi</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Hỗ trợ định dạng hình ảnh tối đa 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReplyFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {replyError && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-xs text-destructive">{replyError}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setReplyTarget(null)} disabled={submittingReply}>
                Hủy
              </Button>
              <Button
                size="sm"
                className="gap-1.5"
                loading={submittingReply}
                onClick={() => void handleSendReply()}
                disabled={submittingReply}
              >
                Gửi phản hồi
              </Button>
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
