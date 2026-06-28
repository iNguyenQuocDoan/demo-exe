"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calendar, Flag, MessageSquare, Monitor, AlertTriangle, CheckCircle2, Image as ImageIcon, X, Clock, ShieldCheck } from "lucide-react";
import { getTutorNameMap } from "@/api/referenceApi";
import { completeBooking, getBookingDetail, type BookingDetail } from "@/api/bookingApi";
import { buildConvId } from "@/api/chatApi";
import { bookingStatusMeta } from "@/lib/bookingStatus";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingGoalCard } from "@/components/booking/BookingGoalCard";
import { ReportDisputeModal } from "@/components/booking/ReportDisputeModal";
import { BookingReportsList } from "@/components/booking/BookingReportsList";
import { ReviewCardLoader } from "@/components/booking/ReviewCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatVietnamDateTime, formatVietnamDate, formatVietnamTime } from "@/lib/utils";

export default function ParentBookingDetailPage() {
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
  const [tutorName, setTutorName] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user || !bookingId) return;
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
      // BE detail trả về tutorName trực tiếp -> ưu tiên dùng.
      if (data.tutorName) {
        setTutorName(data.tutorName);
      } else {
        const map = await getTutorNameMap([data.tutorId]);
        setTutorName(map[data.tutorId] ?? data.tutorId);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Không thể tải dữ liệu chi tiết booking.");
    } finally {
      setLoading(false);
    }
  }, [bookingId, user]);

  useEffect(() => {
    if (isLoading) return;
    void load();
  }, [isLoading, load]);

  const handleComplete = async () => {
    if (!bookingId) return;
    setActionLoading(true);
    try {
      const result = await completeBooking(bookingId);
      if (!result.ok) setError(result.error ?? "Không thể xác nhận hoàn thành.");
      await load();
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container space-y-3">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </section>
      </main>
    );
  }

  if (!booking || error) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container space-y-3">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/parent/bookings">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Link>
            </Button>
            <div className="surface-card p-5 text-sm text-destructive">
              {error ?? "Không có dữ liệu booking."}
            </div>
          </div>
        </section>
      </main>
    );
  }

  const statusMeta = bookingStatusMeta(booking.status, "parent");
  const teachingMode = "Trực tiếp";
  // Phụ huynh xác nhận hoàn thành khi đang học, hoặc khi gia sư đã báo xong trước.
  const canComplete = booking.status === "InProgress" || booking.status === "TutorCompleted";
  const canReport = ["Confirmed", "InProgress", "TutorCompleted", "ParentCompleted", "Completed"].includes(booking.status);

  const chatHref = `/messages?partnerId=${booking.tutorId}`;

  const startDate = formatVietnamDate(booking.startAt);
  const startTime = formatVietnamTime(booking.startAt);

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <section className="pt-4 pb-8">
        <div className="site-container space-y-3">

          {/* Back link */}
          <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5 px-2 text-muted-foreground hover:text-foreground">
            <Link href="/parent/bookings">
              <ArrowLeft className="h-4 w-4" />
              Lịch học của tôi
            </Link>
          </Button>

          {/* Summary strip */}
          <div className="surface-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <h1 className="text-lg font-semibold text-foreground">
                  Chi tiết booking · <span className="text-muted-foreground font-normal text-base">Gia sư {tutorName}</span>
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge meta={statusMeta} className="text-xs" />
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                    <Monitor className="h-3 w-3" />
                    {teachingMode}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {startDate} · {startTime}
                  </span>
                  <span className="text-xs text-muted-foreground">#{booking.id.slice(0, 8)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
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
                {canComplete ? (
                  <Button
                    size="sm"
                    className="gap-2"
                    loading={actionLoading}
                    onClick={handleComplete}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Xác nhận hoàn thành
                  </Button>
                ) : null}
                <Button asChild size="sm" className="gap-2">
                  <Link href={chatHref}>
                    <MessageSquare className="h-4 w-4" />
                    Mở chat
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3">
              <BookingGoalCard booking={booking} />

              {/* Payment Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Thông tin chung &amp; Thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs leading-relaxed">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground block font-medium">Phụ huynh học sinh</span>
                      <span className="font-semibold text-foreground">{booking.parentName || "Phụ huynh"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-medium">Gia sư phụ trách</span>
                      <span className="font-semibold text-foreground">{tutorName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-medium">Học phí tổng</span>
                      <span className="font-bold text-success text-sm">{formatCurrency(booking.totalAmount)}</span>
                      {booking.baseAmount !== booking.totalAmount && (
                        <span className="text-[10px] text-muted-foreground block">
                          Gốc: {formatCurrency(booking.baseAmount)}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-medium">Thời gian đặt lịch</span>
                      <span className="font-medium text-foreground">
                        {formatVietnamDateTime(booking.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Late warning area */}
              {booking.late && (
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-destructive font-semibold text-xs">
                      <AlertTriangle className="h-4 w-4" />
                      Ghi nhận Gia sư đi muộn
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Gia sư bắt đầu buổi học trễ giờ. Số tiền phạt trễ sẽ được tự động hoàn lại ví của bạn sau khi buổi học kết thúc hoàn tất.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-background/60 border border-border p-2.5 rounded-lg">
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Thời gian trễ</span>
                        <span className="font-semibold text-foreground text-xs">{booking.lateMinutes ?? 0} phút</span>
                      </div>
                      <div className="bg-background/60 border border-border p-2.5 rounded-lg">
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Tiền phạt hoàn trả</span>
                        <span className="font-semibold text-success text-xs">{formatCurrency(booking.penaltyAmount ?? 0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* System message */}
              {booking.message && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Ghi chú từ hệ thống</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-muted/40 border border-border rounded-xl text-xs text-muted-foreground italic">
                      &ldquo;{booking.message}&rdquo;
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-3">
              {/* Timeline Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Tiến trình buổi học
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5">
                  <div className="relative border-l border-border pl-4 space-y-4 py-1">
                    {/* Step 1: Created */}
                    <div className="relative">
                      <div className="absolute -left-[21px] mt-1.5 h-2 w-2 rounded-full bg-success ring-4 ring-background" />
                      <span className="text-xs font-medium text-foreground">Đã tạo lịch học thành công</span>
                      <p className="text-[10px] text-muted-foreground">
                        {formatVietnamDateTime(booking.createdAt)}
                      </p>
                    </div>

                    {/* Step 2: Confirmed */}
                    <div className="relative">
                      <div className={`absolute -left-[21px] mt-1.5 h-2 w-2 rounded-full ring-4 ring-background ${booking.status !== "Pending" && booking.status !== "AwaitingPayment" ? "bg-success" : "bg-muted-foreground/30"}`} />
                      <span className={`text-xs font-medium ${booking.status !== "Pending" && booking.status !== "AwaitingPayment" ? "text-foreground" : "text-muted-foreground"}`}>
                        Gia sư đã xác nhận dạy học
                      </span>
                    </div>

                    {/* Step 3: Start checkin */}
                    <div className="relative">
                      <div className={`absolute -left-[21px] mt-1.5 h-2 w-2 rounded-full ring-4 ring-background ${booking.startCheckInTime ? "bg-success" : "bg-muted-foreground/30"}`} />
                      <span className={`text-xs font-medium ${booking.startCheckInTime ? "text-foreground" : "text-muted-foreground"}`}>
                        Gia sư đã check-in điểm danh
                      </span>
                      {booking.startCheckInTime && (
                        <p className="text-[10px] text-muted-foreground">
                          {formatVietnamDateTime(booking.startCheckInTime)}
                        </p>
                      )}
                    </div>

                    {/* Step 4: Tutor complete checkin */}
                    <div className="relative">
                      <div className={`absolute -left-[21px] mt-1.5 h-2 w-2 rounded-full ring-4 ring-background ${booking.endCheckInTime ? "bg-success" : "bg-muted-foreground/30"}`} />
                      <span className={`text-xs font-medium ${booking.endCheckInTime ? "text-foreground" : "text-muted-foreground"}`}>
                        Gia sư báo cáo hoàn thành dạy
                      </span>
                      {booking.endCheckInTime && (
                        <p className="text-[10px] text-muted-foreground">
                          {formatVietnamDateTime(booking.endCheckInTime)}
                        </p>
                      )}
                    </div>

                    {/* Step 5: Completed */}
                    <div className="relative">
                      <div className={`absolute -left-[21px] mt-1.5 h-2 w-2 rounded-full ring-4 ring-background ${booking.status === "Completed" ? "bg-success" : "bg-muted-foreground/30"}`} />
                      <span className={`text-xs font-medium ${booking.status === "Completed" ? "text-foreground" : "text-muted-foreground"}`}>
                        Phụ huynh đã duyệt và hoàn tất
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
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Hình ảnh buổi học từ gia sư
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">Ảnh check-in</span>
                      {booking.startImageUrl ? (
                        <div
                          onClick={() => setPreviewImage(booking.startImageUrl!)}
                          className="relative aspect-video border border-border rounded-lg overflow-hidden group cursor-pointer hover:border-primary/50 transition-all shadow-sm"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={booking.startImageUrl} alt="Ảnh bắt đầu học" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-[10px] font-medium bg-black/50 px-1.5 py-0.5 rounded">Xem</span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-0.5 text-center p-1 bg-muted/15">
                          <ImageIcon className="h-4.5 w-4.5 text-muted-foreground/35" />
                          <span className="text-[9px] text-muted-foreground">Chưa có ảnh</span>
                        </div>
                      )}
                      {booking.startCheckInTime && (
                        <span className="text-[9px] text-muted-foreground block truncate">
                          {formatVietnamTime(booking.startCheckInTime)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">Ảnh hoàn thành</span>
                      {booking.endImageUrl ? (
                        <div
                          onClick={() => setPreviewImage(booking.endImageUrl!)}
                          className="relative aspect-video border border-border rounded-lg overflow-hidden group cursor-pointer hover:border-primary/50 transition-all shadow-sm"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={booking.endImageUrl} alt="Ảnh báo cáo xong" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-[10px] font-medium bg-black/50 px-1.5 py-0.5 rounded">Xem</span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-0.5 text-center p-1 bg-muted/15">
                          <ImageIcon className="h-4.5 w-4.5 text-muted-foreground/35" />
                          <span className="text-[9px] text-muted-foreground">Chưa có ảnh</span>
                        </div>
                      )}
                      {booking.endCheckInTime && (
                        <span className="text-[9px] text-muted-foreground block truncate">
                          {formatVietnamTime(booking.endCheckInTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Confirmation Checks */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                    Trạng thái phê duyệt
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-xs">
                  <div className={`p-2.5 rounded-xl border flex flex-col gap-1 ${booking.tutorConfirmed ? "bg-success/5 border-success/20 text-success" : "bg-muted/30 border-border text-muted-foreground"}`}>
                    <span className="font-semibold uppercase tracking-wider text-[9px]">Gia sư xác nhận</span>
                    <span className="font-bold flex items-center gap-0.5">
                      {booking.tutorConfirmed ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Đã xong
                        </>
                      ) : (
                        "Chưa xong"
                      )}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-xl border flex flex-col gap-1 ${booking.parentConfirmed ? "bg-success/5 border-success/20 text-success" : "bg-muted/30 border-border text-muted-foreground"}`}>
                    <span className="font-semibold uppercase tracking-wider text-[9px]">Phụ huynh duyệt</span>
                    <span className="font-bold flex items-center gap-0.5">
                      {booking.parentConfirmed ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Đã duyệt
                        </>
                      ) : (
                        "Chưa duyệt"
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <BookingReportsList bookingId={booking.id} refreshKey={reportRefreshKey} />
              {booking.status === "Completed" && (
                <ReviewCardLoader
                  bookingId={booking.id}
                  tutorId={booking.tutorId}
                  tutorName={tutorName}
                />
              )}
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

      {/* Large Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)} />
          <div className="relative max-w-2xl w-full aspect-video rounded-xl overflow-hidden z-10 border border-border bg-card shadow-2xl flex flex-col animate-scale-in">
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
