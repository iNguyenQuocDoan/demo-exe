"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calendar, Flag, MessageSquare, PlayCircle, ShieldCheck } from "lucide-react";
import { acceptBooking, getBookingById, startBooking, tutorCompleteBooking } from "@/api/bookingApi";
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
import type { Booking } from "@/types";

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
  const [booking, setBooking] = useState<Booking | null>(null);

  const tutorId = user?.tutorProfileId;

  const load = useCallback(async () => {
    if (!bookingId || !tutorId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getBookingById({ bookingId, tutorId });
      if (!data) {
        setError("Không tìm thấy booking hoặc bạn không có quyền xem.");
        setBooking(null);
        return;
      }
      setBooking(data);
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

  const handleStart = async () => {
    if (!bookingId) return;
    setActionLoading(true);
    try {
      const result = await startBooking(bookingId);
      if (!result.ok) setError(result.error ?? "Không thể bắt đầu buổi học.");
      await load();
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!bookingId) return;
    setActionLoading(true);
    try {
      const result = await tutorCompleteBooking(bookingId);
      if (!result.ok) setError(result.error ?? "Không thể hoàn thành buổi học.");
      await load();
    } finally {
      setActionLoading(false);
    }
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
              <Link href="/tutor/bookings">
                <ArrowLeft className="h-4 w-4" />
                Quay lại bookings
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
  // Gia sư xác nhận hoàn thành khi đang dạy, hoặc khi phụ huynh đã xác nhận trước.
  const canComplete = booking.status === "InProgress" || booking.status === "ParentCompleted";
  const canReport = ["Confirmed", "InProgress", "TutorCompleted", "ParentCompleted", "Completed"].includes(booking.status);

  const chatHref = `/tutor/chats?convId=${buildConvId(booking.parentId, booking.tutorId)}&bookingId=${booking.id}`;

  const startAt = booking.startAt ? new Date(booking.startAt) : null;
  const dateLabel = startAt
    ? startAt.toLocaleString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <section className="pt-4 pb-8">
        <div className="site-container space-y-4">
          <header className="surface-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <Button asChild variant="ghost" size="sm" className="-ml-2 gap-2 px-2">
                  <Link href="/tutor/bookings">
                    <ArrowLeft className="h-4 w-4" />
                    Danh sách booking
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold text-foreground">Chi tiết booking</h1>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {dateLabel}
                  <span className="ml-1 text-muted-foreground/60">#{booking.id}</span>
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
                  <Button className="gap-2 bg-success hover:bg-success/90 text-white" loading={actionLoading} onClick={handleStart}>
                    <PlayCircle className="h-4 w-4" />
                    Bắt đầu buổi học
                  </Button>
                ) : null}
                {canComplete ? (
                  <Button
                    className="gap-2"
                    loading={actionLoading}
                    onClick={handleComplete}
                  >
                    <Flag className="h-4 w-4" />
                    Hoàn thành buổi học
                  </Button>
                ) : null}
              </div>
            </div>
          </header>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <BookingGoalCard booking={booking} />
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Trạng thái booking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    Trạng thái hiện tại:
                    <span className="ml-1 font-medium">{statusMeta.label}</span>
                  </p>
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
    </main>
  );
}
