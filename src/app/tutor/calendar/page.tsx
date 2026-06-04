"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle, Banknote, BookOpen, Calendar, CalendarClock,
  CalendarDays, CheckCircle2, Clock, Flag, MapPin, MessageSquare,
  Phone, PlayCircle, Search, User, XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/useAuthStore";
import { formatCurrency } from "@/lib/utils";
import {
  getBookings, acceptBooking, cancelBooking,
  startBooking, tutorCompleteBooking,
} from "@/api/bookingApi";
import { getTutorAllSlots } from "@/api/tutorApi";
import { getUserContactMap, type UserContact } from "@/api/referenceApi";
import { getOrCreateConversation } from "@/api/chatApi";
import { ScheduleCalendar } from "@/components/tutor/ScheduleCalendar";
import { AvailabilityManager } from "@/components/tutor/AvailabilityManager";
import type { Booking, CalendarEvent } from "@/types";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<
  Booking["status"],
  { label: string; variant: "default" | "warning" | "success" | "destructive" }
> = {
  Pending:         { label: "Chờ xác nhận",       variant: "warning" },
  AwaitingPayment: { label: "Chờ thanh toán",      variant: "warning" },
  Confirmed:       { label: "Đã xác nhận",         variant: "success" },
  InProgress:      { label: "Đang trong giờ học",  variant: "default" },
  TutorCompleted:  { label: "Chờ phụ huynh xác nhận", variant: "warning" },
  ParentCompleted: { label: "Chờ bạn xác nhận",     variant: "warning" },
  Completed:       { label: "Hoàn thành",          variant: "success" },
  Cancelled:       { label: "Đã hủy",              variant: "destructive" },
  Disputed:        { label: "Tranh chấp",          variant: "destructive" },
  Resolved:        { label: "Đã giải quyết",       variant: "default" },
};

const pad = (n: number) => String(n).padStart(2, "0");
function bookingToEvent(b: Booking): CalendarEvent {
  const start  = new Date(b.startAt);
  const end    = new Date(b.endAt);
  const fmt    = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const date   = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
  const status = b.status as CalendarEvent["status"];
  return {
    id: b.id, type: "booking",
    title: [b.subject, b.studentName].filter(Boolean).join(" - ") || `Buổi học ${b.id.slice(-4)}`,
    date, startTime: fmt(start), endTime: fmt(end), status,
    bookingId: b.id, studentName: b.studentName, subject: b.subject, amount: b.totalAmount,
    canAccept: status === "Pending",
    canReject: status === "Pending" || status === "Confirmed",
  };
}

interface TutorSlotLite { id: string; startTime: string; endTime: string; status: string; hourlyRate: number; }
function slotToEvent(s: TutorSlotLite): CalendarEvent {
  const start = new Date(s.startTime);
  const end   = new Date(s.endTime);
  const fmt   = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return {
    id: `slot-${s.id}`,
    type: "availability",
    title: "Ca trống",
    date: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    startTime: fmt(start), endTime: fmt(end),
    amount: s.hourlyRate,
  };
}

/* ─── CancelInline ───────────────────────────────────────────────────────── */

function CancelInline({ onConfirm, onCancel, loading }: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="mt-3 border-t border-border pt-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Lý do hủy buổi học:</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Nhập lý do hủy..."
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      <div className="flex gap-2">
        <Button size="sm" variant="destructive" className="h-7 text-xs gap-1"
          onClick={() => onConfirm(reason || "Gia sư hủy buổi học")}
          loading={loading} disabled={loading}>
          <XCircle className="h-3 w-3" /> Xác nhận hủy
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onCancel} disabled={loading}>
          Quay lại
        </Button>
      </div>
    </div>
  );
}

/* ─── BookingCard ─────────────────────────────────────────────────────────── */

function BookingCard({
  booking, parentContactMap,
  onAccept, onDecline, onStart, onCancel, onComplete, onChat,
  actionLoadingId,
}: {
  booking: Booking;
  parentContactMap: Record<string, UserContact>;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onStart?: (id: string) => void;
  onCancel?: (id: string, reason: string) => void;
  onComplete?: (id: string) => void;
  onChat?: (booking: Booking) => void;
  actionLoadingId?: string | null;
}) {
  const [showCancel, setShowCancel] = useState(false);

  const parentContact = parentContactMap[booking.parentId] ?? { name: booking.parentId };
  const parentName    = parentContact.name;
  // Trạng thái lấy thẳng từ BE (InProgress là status thật sau khi gia sư bấm "Bắt đầu").
  const effectiveStatus: Booking["status"] = booking.status;
  const showContact   = ["Confirmed", "InProgress"].includes(effectiveStatus);
  const start         = new Date(booking.startAt);
  const end           = new Date(booking.endAt);
  const durationMin   = Math.round((end.getTime() - start.getTime()) / 60000);
  const { label, variant } = STATUS_CONFIG[effectiveStatus] ?? { label: effectiveStatus, variant: "default" as const };
  const busy = actionLoadingId === booking.id;

  return (
    <div className="border border-border rounded-xl p-5 bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{parentName}</span>
            </div>
            <Badge variant={booking.type === "SERIES_SESSION" ? "secondary" : "default"} className="text-xs">
              {booking.type === "SERIES_SESSION" ? "Định kỳ" : "Buổi lẻ"}
            </Badge>
            <Badge variant={variant} className="text-xs">{label}</Badge>
          </div>

          {showContact && (parentContact.phone || parentContact.address) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {parentContact.phone && (
                <a href={`tel:${parentContact.phone}`}
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                  <Phone className="h-3.5 w-3.5" />{parentContact.phone}
                </a>
              )}
              {parentContact.address && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />{parentContact.address}
                </div>
              )}
            </div>
          )}

          {(booking.subject || booking.grade) && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{booking.subject}{booking.grade ? ` – ${booking.grade}` : ""}</span>
            </div>
          )}
          {booking.studentName && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>Học sinh: <strong className="text-foreground">{booking.studentName}</strong></span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {start.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              {" – "}
              {end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              <span className="text-muted-foreground/60 ml-0.5">({durationMin} phút)</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>Trực tiếp{booking.location ? `: ${booking.location}` : ""}</span>
          </div>

          {booking.notes && (
            <p className="text-xs italic text-muted-foreground bg-muted/40 rounded px-2 py-1">
              &ldquo;{booking.notes}&rdquo;
            </p>
          )}
          {booking.status === "Cancelled" && booking.reason && (
            <p className="text-xs text-destructive/80 bg-destructive/5 border border-destructive/20 rounded px-2 py-1 flex items-start gap-1">
              <XCircle className="h-3 w-3 mt-0.5 shrink-0" />
              <span>Lý do hủy: {booking.reason}</span>
            </p>
          )}

          <div className="flex items-center gap-1.5 text-sm">
            <Banknote className="h-3.5 w-3.5 text-success" />
            <span className="font-semibold text-foreground">{formatCurrency(booking.totalAmount)}</span>
            <span className="text-muted-foreground text-xs">({formatCurrency(booking.baseAmount)})</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0 min-w-30">
          <Button size="sm" variant="outline" asChild className="w-full">
            <Link href={`/tutor/bookings/${booking.id}`}>Chi tiết</Link>
          </Button>
          {booking.status === "Pending" && onAccept && onDecline && (
            <>
              <Button size="sm" onClick={() => onAccept(booking.id)}
                loading={busy} disabled={!!actionLoadingId} className="gap-1 w-full">
                <CheckCircle2 className="h-3.5 w-3.5" /> Chấp nhận
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDecline(booking.id)}
                loading={busy} disabled={!!actionLoadingId} className="gap-1 w-full">
                <XCircle className="h-3.5 w-3.5" /> Từ chối
              </Button>
            </>
          )}
          {["Confirmed", "InProgress", "ParentCompleted", "TutorCompleted"].includes(effectiveStatus) && !showCancel && (
            <>
              {effectiveStatus === "Confirmed" && onStart && (
                <Button size="sm" onClick={() => onStart(booking.id)}
                  disabled={!!actionLoadingId}
                  className="gap-1 w-full bg-success hover:bg-success/90 text-white">
                  <PlayCircle className="h-3.5 w-3.5" /> Bắt đầu buổi học
                </Button>
              )}
              {/* Gia sư xác nhận xong khi đang dạy, hoặc khi phụ huynh đã xác nhận trước (ParentCompleted). */}
              {(effectiveStatus === "InProgress" || effectiveStatus === "ParentCompleted") && onComplete && (
                <Button size="sm" onClick={() => onComplete(booking.id)}
                  loading={busy} disabled={!!actionLoadingId}
                  className="gap-1 w-full bg-primary hover:bg-primary/90 text-white">
                  <Flag className="h-3.5 w-3.5" /> Hoàn thành buổi học
                </Button>
              )}
              {effectiveStatus === "TutorCompleted" && (
                <p className="text-[11px] leading-tight text-muted-foreground text-center">
                  Đã báo hoàn thành — chờ phụ huynh xác nhận
                </p>
              )}
              {onCancel && (effectiveStatus === "Confirmed" || effectiveStatus === "InProgress") && (
                <Button size="sm" variant="outline" onClick={() => setShowCancel(true)}
                  disabled={!!actionLoadingId} className="gap-1 w-full text-destructive hover:text-destructive">
                  <XCircle className="h-3.5 w-3.5" /> Hủy buổi học
                </Button>
              )}
            </>
          )}
          {["Confirmed", "InProgress", "ParentCompleted", "TutorCompleted", "Cancelled"].includes(booking.status) && onChat && (
            <Button size="sm" variant="outline" onClick={() => onChat(booking)} className="gap-1 w-full">
              <MessageSquare className="h-3.5 w-3.5" /> Nhắn tin
            </Button>
          )}
        </div>
      </div>

      {showCancel && onCancel && (
        <CancelInline
          loading={busy}
          onConfirm={(reason) => { setShowCancel(false); onCancel(booking.id, reason); }}
          onCancel={() => setShowCancel(false)}
        />
      )}
    </div>
  );
}

/* ─── Booking list tabs ───────────────────────────────────────────────────── */

const BOOKING_TABS = [
  { key: "pending",   label: "Chờ xác nhận", statuses: ["Pending", "AwaitingPayment"] as Booking["status"][] },
  { key: "confirmed", label: "Đang dạy",      statuses: ["Confirmed", "InProgress", "ParentCompleted", "TutorCompleted"] as Booking["status"][] },
  { key: "completed", label: "Hoàn thành",    statuses: ["Completed", "Resolved"]     as Booking["status"][] },
  { key: "cancelled", label: "Đã hủy",        statuses: ["Cancelled", "Disputed"]     as Booking["status"][] },
];

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function TutorCalendarPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuthStore();

  const [bookings, setBookings]               = useState<Booking[]>([]);
  const [slots, setSlots]                     = useState<TutorSlotLite[]>([]);
  const [parentContactMap, setParentContactMap] = useState<Record<string, UserContact>>({});
  const [loading, setLoading]                 = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [bookingSubTab, setBookingSubTab]     = useState("pending");
  const [search, setSearch]                   = useState("");

  const mainTab = searchParams.get("tab") ?? "bookings";
  const setMainTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const tutorId = user?.tutorProfileId ?? null;

  const load = useCallback(async (tid: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [b, sl] = await Promise.all([
        getBookings({ tutorId: tid }),
        getTutorAllSlots(tid).catch(() => [] as TutorSlotLite[]),
      ]);
      setBookings(b);
      setSlots(sl);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading || !user) return;
    if (!tutorId) { queueMicrotask(() => setLoading(false)); return; }
    void load(tutorId);
  }, [isLoading, load, tutorId, user]);

  useEffect(() => {
    const parentIds = bookings.map((b) => b.parentId);
    if (parentIds.length === 0) return;
    let active = true;
    void getUserContactMap(parentIds).then((map) => { if (!active) return; setParentContactMap(map); });
    return () => { active = false; };
  }, [bookings]);

  const withLoading = (id: string, fn: () => Promise<void>) => {
    setActionLoadingId(id);
    return fn().finally(() => setActionLoadingId(null));
  };

  const handleAccept   = (id: string) => withLoading(id, async () => {
    const res = await acceptBooking(id);
    if (!res.ok) { alert(res.error ?? "Không thể chấp nhận buổi học"); return; }
    if (tutorId) await load(tutorId, true);
  });
  const handleDecline  = (id: string) => withLoading(id, async () => {
    if (!tutorId) return;
    const res = await cancelBooking(id, tutorId, "Gia sư từ chối");
    if (!res.ok) { alert(res.error ?? "Không thể từ chối buổi học"); return; }
    await load(tutorId, true);
  });
  const handleCancel   = (id: string, reason: string) => withLoading(id, async () => {
    if (!tutorId) return;
    const res = await cancelBooking(id, tutorId, reason);
    if (!res.ok) { alert(res.error ?? "Không thể hủy buổi học"); return; }
    await load(tutorId, true);
  });
  // Bắt đầu buổi học → PUT /bookings/{id}/start (BE chuyển sang InProgress).
  const handleStart = (id: string) => withLoading(id, async () => {
    const res = await startBooking(id);
    if (!res.ok) { alert(res.error ?? "Không thể bắt đầu buổi học"); return; }
    if (tutorId) await load(tutorId, true);
  });
  // Gia sư xác nhận hoàn thành → POST /bookings/{id}/tutor-complete (KHÔNG dùng /complete
  // vì endpoint đó chỉ dành cho PARENT). Sau đó phụ huynh mới xác nhận để giải ngân.
  const handleComplete = (id: string) => withLoading(id, async () => {
    const res = await tutorCompleteBooking(id);
    if (!res.ok) { alert(res.error ?? "Không thể hoàn thành buổi học"); return; }
    if (tutorId) await load(tutorId, true);
    setBookingSubTab("completed");
  });
  const handleChat = useCallback(async (booking: Booking) => {
    if (!user) return;
    const parentName = parentContactMap[booking.parentId]?.name ?? booking.parentId;
    const conv = await getOrCreateConversation(booking.parentId, booking.tutorId, parentName, user.fullName);
    router.push(`/tutor/chats?convId=${conv.id}&bookingId=${booking.id}`);
  }, [parentContactMap, user, router]);

  // calendar handlers
  const handleCalAccept = async (id: string) => { await acceptBooking(id); if (tutorId) void load(tutorId, true); };
  const handleCalReject = async (id: string) => { await cancelBooking(id, tutorId ?? "", "Gia sư từ chối"); if (tutorId) void load(tutorId, true); };
  const handleCalCancel = async (id: string) => {
    if (!confirm("Bạn có chắc muốn hủy buổi học này?")) return;
    await cancelBooking(id, tutorId ?? "", "Gia sư hủy buổi học");
    if (tutorId) void load(tutorId, true);
  };

  const bookingEvents = bookings.map(bookingToEvent);
  const slotEvents = slots
    .filter((s) => (s.status ?? "").toUpperCase() === "AVAILABLE")
    .map(slotToEvent);
  const events = [...bookingEvents, ...slotEvents];
  const pendingCount  = bookingEvents.filter((e) => e.status === "Pending").length;
  const upcomingCount = bookingEvents.filter(
    (e) => e.date >= new Date().toISOString().split("T")[0] && e.status !== "Cancelled"
  ).length;

  if (isLoading || loading) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container space-y-4">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-10 rounded-xl" />
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <section className="pt-4 pb-8">
        <div className="site-container space-y-4">

          {/* Page header */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-4.5 w-4.5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Lịch của tôi</h1>
          </div>

          {/* Main tabs */}
          <Tabs value={mainTab} onValueChange={setMainTab}>
            <TabsList className="w-full">
              <TabsTrigger value="bookings" className="flex-1 gap-1.5 text-xs sm:text-sm">
                <BookOpen className="h-3.5 w-3.5" /> Lịch đặt
                {bookings.filter((b) => b.status === "Pending").length > 0 && (
                  <span className="ml-1 text-xs bg-warning/20 text-warning rounded-full px-1.5 py-0.5 leading-none">
                    {bookings.filter((b) => b.status === "Pending").length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex-1 gap-1.5 text-xs sm:text-sm">
                <CalendarDays className="h-3.5 w-3.5" /> Lịch dạy
              </TabsTrigger>
              <TabsTrigger value="availability" className="flex-1 gap-1.5 text-xs sm:text-sm">
                <CalendarClock className="h-3.5 w-3.5" /> Lịch trống
              </TabsTrigger>
            </TabsList>

            {/* ── Tab: Lịch đặt ─────────────────────────────────────────── */}
            <TabsContent value="bookings" className="mt-4 space-y-4">
              <div className="surface-card p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tên phụ huynh..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <Tabs value={bookingSubTab} onValueChange={setBookingSubTab}>
                <TabsList className="w-full">
                  {BOOKING_TABS.map(({ key, label, statuses }) => {
                    const count = bookings.filter((b) => statuses.includes(b.status)).length;
                    return (
                      <TabsTrigger key={key} value={key} className="flex-1 text-xs sm:text-sm">
                        {label}
                        {count > 0 && (
                          <span className="ml-1.5 text-xs bg-primary/20 text-primary rounded-full px-1.5 py-0.5 leading-none">
                            {count}
                          </span>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {BOOKING_TABS.map(({ key, statuses }) => {
                  const filtered = bookings
                    .filter((b) => statuses.includes(b.status))
                    .filter((b) => {
                      if (!search.trim()) return true;
                      const q = search.toLowerCase();
                      const name = (parentContactMap[b.parentId]?.name ?? b.parentId).toLowerCase();
                      return name.includes(q);
                    })
                    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

                  return (
                    <TabsContent key={key} value={key} className="mt-4 space-y-3">
                      {filtered.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                          <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">Chưa có lịch nào trong mục này</p>
                        </div>
                      ) : (
                        filtered.map((b) => (
                          <BookingCard
                            key={b.id}
                            booking={b}
                            parentContactMap={parentContactMap}
                            onAccept={key === "pending" ? handleAccept : undefined}
                            onDecline={key === "pending" ? handleDecline : undefined}
                            onStart={key === "confirmed" ? handleStart : undefined}
                            onCancel={key === "confirmed" ? handleCancel : undefined}
                            onComplete={key === "confirmed" ? handleComplete : undefined}
                            onChat={handleChat}
                            actionLoadingId={actionLoadingId}
                          />
                        ))
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </TabsContent>

            {/* ── Tab: Lịch dạy ─────────────────────────────────────────── */}
            <TabsContent value="schedule" className="mt-4 space-y-4">
              <div className="surface-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-foreground">Lịch dạy của tôi</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Quản lý và theo dõi các buổi học sắp tới</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="surface-card flex flex-col items-center px-4 py-2 min-w-20">
                      <span className="text-2xl font-bold text-primary">{upcomingCount}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">Sắp tới</span>
                    </div>
                    {pendingCount > 0 && (
                      <div className="surface-card flex flex-col items-center px-4 py-2 min-w-20 border-warning/40">
                        <span className="text-2xl font-bold text-warning">{pendingCount}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">Chờ duyệt</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <ScheduleCalendar
                events={events}
                onAccept={handleCalAccept}
                onReject={handleCalReject}
                onCancel={handleCalCancel}
              />
            </TabsContent>

            {/* ── Tab: Lịch trống ────────────────────────────────────────── */}
            <TabsContent value="availability" className="mt-4">
              <AvailabilityManager />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  );
}
