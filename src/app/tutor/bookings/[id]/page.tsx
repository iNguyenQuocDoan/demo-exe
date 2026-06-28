"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calendar, Flag, MessageSquare, PlayCircle, ShieldCheck, AlertTriangle, CheckCircle2, Image as ImageIcon, ExternalLink, X, Clock, HelpCircle } from "lucide-react";
import { acceptBooking, getBookingDetail, type BookingDetail } from "@/api/bookingApi";
import { buildConvId } from "@/api/chatApi";
import { bookingStatusMeta } from "@/lib/bookingStatus";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingGoalCard } from "@/components/booking/BookingGoalCard";
import { ReportDisputeModal } from "@/components/booking/ReportDisputeModal";
import { BookingReportsList } from "@/components/booking/BookingReportsList";
import { UploadEvidenceModal } from "@/components/booking/UploadEvidenceModal";
import { formatCurrency, formatVietnamDateTime, formatVietnamDate, formatVietnamTime, formatVietnamWeekdayDateTime } from "@/lib/utils";

export default function TutorBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const bookingId = useMemo(
    () => (Array.isArray(params?.id) ? params.id[0] : params?.id),
    [params],
  );

  const { user, isLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportRefreshKey, setReportRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [uploadTarget, setUploadTarget] = useState<{ id: string; type: "start" | "complete" } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const tutorId = user?.tutorProfileId;

  const load = useCallback(async () => {
    if (!bookingId || !tutorId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getBookingDetail(bookingId);
      if (!data) {
        setError("Không tìm thấy booking hoặc bạn không có quyền xem.");
        setBooking(null);
        return;
      }
      setBooking(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Không thể tải dữ liệu chi tiết booking.");
    } finally {
      setLoading(false);
    }
  }, [bookingId, tutorId]);

  useEffect(() => {
    if (isLoading) return;
    void load();
  }, [isLoading, load]);

  const handleConfirm = async () => {
    if (!bookingId) return;
    setActionLoading(true);
    try {
      const result = await acceptBooking(bookingId);
      if (!result.ok) setError(result.error ?? "Không thể xác nhận booking.");
      await load();
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartClick = () => {
    if (!bookingId) return;
    setUploadTarget({ id: bookingId, type: "start" });
  };

  const handleCompleteClick = () => {
    if (!bookingId) return;
    setUploadTarget({ id: bookingId, type: "complete" });
  };

  if (isLoading || loading) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </section>
      </main>
    );
  }

  if (!booking || !tutorId || error) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container space-y-3">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/tutor/calendar?tab=bookings">
                <ArrowLeft className="h-4 w-4" />
                Quay lại calendar
              </Link>
            </Button>
            <Card>
              <CardContent className="p-6 text-sm text-destructive">
                {error ?? "Không có dữ liệu booking."}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    );
  }

  const statusMeta = bookingStatusMeta(booking.status, "tutor");
  const canConfirm = booking.status === "Pending" || booking.status === "AwaitingPayment";
  const canStart = booking.status === "Confirmed";
  // Gia sư xác nhận hoàn thành khi đang dạy, hoặc khi phụ huynh đã xác nhận trước (ParentCompleted).
  const canComplete = booking.status === "InProgress" || booking.status === "ParentCompleted";
  const canReport = ["Confirmed", "InProgress", "TutorCompleted", "ParentCompleted", "Completed"].includes(booking.status);

  const chatHref = `/messages?partnerId=${booking.parentId}`;

  const dateLabel = formatVietnamWeekdayDateTime(booking.startAt);

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <section className="pt-4 pb-8">
        <div className="site-container space-y-4">
          <header className="surface-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <Button asChild variant="ghost" size="sm" className="-ml-2 gap-2 px-2 text-muted-foreground hover:text-foreground">
                  <Link href="/tutor/calendar?tab=bookings">
                    <ArrowLeft className="h-4 w-4" />
                    Danh sách booking
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold text-foreground">Chi tiết booking</h1>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {dateLabel}
                  <span className="ml-1 text-muted-foreground/60">#{booking.id.slice(0, 8)}</span>
                </p>
                {(booking.subjectName ?? booking.subject) ? (
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {booking.subjectName ?? booking.subject}
                    </span>
                    {booking.grade ? <span>{booking.grade}</span> : null}
                    <span>·</span>
                    <span>Trực tiếp</span>
                    {booking.studentName ? <span>· Học sinh: {booking.studentName}</span> : null}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge meta={statusMeta} className="text-xs" />
                {canReport && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
                    onClick={() => setReportOpen(true)}
                  >
                    <Flag className="h-4 w-4" />
                    Báo cáo
                  </Button>
                )}
                <Button asChild variant="outline" className="gap-2">
                  <Link href={chatHref}>
                    <MessageSquare className="h-4 w-4" />
                    Mở chat
                  </Link>
                </Button>
                {canConfirm ? (
                  <Button className="gap-2" loading={actionLoading} onClick={handleConfirm}>
                    <ShieldCheck className="h-4 w-4" />
                    Xác nhận booking
                  </Button>
                ) : null}
                {canStart ? (
                  <Button className="gap-2 bg-success hover:bg-success/90 text-white" loading={actionLoading} onClick={handleStartClick}>
                    <PlayCircle className="h-4 w-4" />
                    Bắt đầu buổi học
                  </Button>
                ) : null}
                {canComplete ? (
                  <Button
                    className="gap-2"
                    loading={actionLoading}
                    onClick={handleCompleteClick}
                  >
                    <Flag className="h-4 w-4" />
                    Báo cáo dạy xong
                  </Button>
                ) : null}
              </div>
            </div>
          </header>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <BookingGoalCard booking={booking} />

              {/* Main Information Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Thông tin thanh toán &amp; Thời gian</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground block uppercase font-medium">Phụ huynh học sinh</span>
                      <span className="font-semibold text-foreground">{booking.parentName || "Phụ huynh"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block uppercase font-medium">Gia sư giảng dạy</span>
                      <span className="font-semibold text-foreground">{booking.tutorName || "Gia sư"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block uppercase font-medium">Tổng chi phí</span>
                      <span className="font-bold text-success text-base">{formatCurrency(booking.totalAmount)}</span>
                      {booking.baseAmount !== booking.totalAmount && (
                        <span className="text-xs text-muted-foreground block">
                          Gốc: {formatCurrency(booking.baseAmount)}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block uppercase font-medium">Ngày tạo đặt lịch</span>
                      <span className="font-medium text-foreground">
                        {formatVietnamDateTime(booking.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Penalty Card if late */}
              {booking.late && (
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                      <AlertTriangle className="h-4.5 w-4.5" />
                      Cảnh báo đi muộn
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Hệ thống ghi nhận buổi học được bắt đầu muộn hơn so với lịch hẹn dự kiến.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-background/50 border border-border p-2.5 rounded-lg">
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Số phút đi trễ</span>
                        <span className="font-semibold text-foreground text-sm">{booking.lateMinutes ?? 0} phút</span>
                      </div>
                      <div className="bg-background/50 border border-border p-2.5 rounded-lg">
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Số tiền phạt</span>
                        <span className="font-semibold text-destructive text-sm">{formatCurrency(booking.penaltyAmount ?? 0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Message section if present */}
              {booking.message && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Ghi chú &amp; Lời nhắn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-muted/30 border border-border rounded-xl text-xs text-muted-foreground italic leading-relaxed">
                      &ldquo;{booking.message}&rdquo;
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              {/* Timeline Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4.5 w-4.5 text-primary" />
                    Tiến trình buổi học
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                  <div className="relative border-l border-border pl-4 space-y-4 py-1">
                    {/* Step 1: Created */}
                    <div className="relative">
                      <div className="absolute -left-[21px] mt-1.5 h-2.5 w-2.5 rounded-full bg-success ring-4 ring-background" />
                      <span className="text-xs font-semibold text-foreground">Đã tạo booking thành công</span>
                      <p className="text-[10px] text-muted-foreground">
                        {formatVietnamDateTime(booking.createdAt)}
                      </p>
                    </div>

                    {/* Step 2: Confirmed */}
                    <div className="relative">
                      <div className={`absolute -left-[21px] mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background ${booking.status !== "Pending" && booking.status !== "AwaitingPayment" ? "bg-success" : "bg-muted-foreground/30"}`} />
                      <span className={`text-xs font-semibold ${booking.status !== "Pending" && booking.status !== "AwaitingPayment" ? "text-foreground" : "text-muted-foreground"}`}>
                        Gia sư đã xác nhận buổi học
                      </span>
                    </div>

                    {/* Step 3: Start checkin */}
                    <div className="relative">
                      <div className={`absolute -left-[21px] mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background ${booking.startCheckInTime ? "bg-success" : "bg-muted-foreground/30"}`} />
                      <span className={`text-xs font-semibold ${booking.startCheckInTime ? "text-foreground" : "text-muted-foreground"}`}>
                        Gia sư check-in bắt đầu học
                      </span>
                      {booking.startCheckInTime && (
                        <p className="text-[10px] text-muted-foreground">
                          {formatVietnamDateTime(booking.startCheckInTime)}
                        </p>
                      )}
                    </div>

                    {/* Step 4: Tutor complete checkin */}
                    <div className="relative">
                      <div className={`absolute -left-[21px] mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background ${booking.endCheckInTime ? "bg-success" : "bg-muted-foreground/30"}`} />
                      <span className={`text-xs font-semibold ${booking.endCheckInTime ? "text-foreground" : "text-muted-foreground"}`}>
                        Gia sư báo cáo dạy xong
                      </span>
                      {booking.endCheckInTime && (
                        <p className="text-[10px] text-muted-foreground">
                          {formatVietnamDateTime(booking.endCheckInTime)}
                        </p>
                      )}
                    </div>

                    {/* Step 5: Completed */}
                    <div className="relative">
                      <div className={`absolute -left-[21px] mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background ${booking.status === "Completed" ? "bg-success" : "bg-muted-foreground/30"}`} />
                      <span className={`text-xs font-semibold ${booking.status === "Completed" ? "text-foreground" : "text-muted-foreground"}`}>
                        Phụ huynh xác nhận hoàn thành
                      </span>
                      {booking.completedAt && (
                        <p className="text-[10px] text-muted-foreground">
                          {formatVietnamDateTime(booking.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Evidence Images */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="h-4.5 w-4.5 text-primary" />
                    Hình ảnh minh chứng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">Ảnh check-in đầu giờ</span>
                      {booking.startImageUrl ? (
                        <div
                          onClick={() => setPreviewImage(booking.startImageUrl!)}
                          className="relative aspect-video border border-border rounded-lg overflow-hidden group cursor-pointer hover:border-primary/50 transition-all shadow-sm"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={booking.startImageUrl} alt="Ảnh bắt đầu học" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-[10px] font-medium bg-black/50 px-2 py-1 rounded">Phóng to</span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-center p-2 bg-muted/10">
                          <ImageIcon className="h-5 w-5 text-muted-foreground/30" />
                          <span className="text-[10px] text-muted-foreground">Chưa cập nhật</span>
                        </div>
                      )}
                      {booking.startCheckInTime && (
                        <span className="text-[9px] text-muted-foreground leading-tight block">
                          Thời gian: {formatVietnamTime(booking.startCheckInTime)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">Ảnh báo cáo dạy xong</span>
                      {booking.endImageUrl ? (
                        <div
                          onClick={() => setPreviewImage(booking.endImageUrl!)}
                          className="relative aspect-video border border-border rounded-lg overflow-hidden group cursor-pointer hover:border-primary/50 transition-all shadow-sm"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={booking.endImageUrl} alt="Ảnh báo cáo xong" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-[10px] font-medium bg-black/50 px-2 py-1 rounded">Phóng to</span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-center p-2 bg-muted/10">
                          <ImageIcon className="h-5 w-5 text-muted-foreground/30" />
                          <span className="text-[10px] text-muted-foreground">Chưa cập nhật</span>
                        </div>
                      )}
                      {booking.endCheckInTime && (
                        <span className="text-[9px] text-muted-foreground leading-tight block">
                          Thời gian: {formatVietnamTime(booking.endCheckInTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Confirmed Checks */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                    Trạng thái xác nhận hai bên
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border flex flex-col gap-1.5 justify-center ${booking.tutorConfirmed ? "bg-success/5 border-success/20 text-success" : "bg-muted/30 border-border text-muted-foreground"}`}>
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Gia sư xác nhận</span>
                    <span className="font-bold text-sm flex items-center gap-1">
                      {booking.tutorConfirmed ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Đã xác nhận
                        </>
                      ) : (
                        "Chưa xác nhận"
                      )}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl border flex flex-col gap-1.5 justify-center ${booking.parentConfirmed ? "bg-success/5 border-success/20 text-success" : "bg-muted/30 border-border text-muted-foreground"}`}>
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Phụ huynh xác nhận</span>
                    <span className="font-bold text-sm flex items-center gap-1">
                      {booking.parentConfirmed ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Đã xác nhận
                        </>
                      ) : (
                        "Chưa xác nhận"
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <BookingReportsList bookingId={booking.id} refreshKey={reportRefreshKey} />
            </div>
          </div>
        </div>
      </section>

      <ReportDisputeModal
        bookingId={booking.id}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSuccess={() => { void load(); setReportRefreshKey((k) => k + 1); }}
      />

      {uploadTarget && (
        <UploadEvidenceModal
          bookingId={uploadTarget.id}
          type={uploadTarget.type}
          open={!!uploadTarget}
          onClose={() => setUploadTarget(null)}
          onSuccess={() => void load()}
        />
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
