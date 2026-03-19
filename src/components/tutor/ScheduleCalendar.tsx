"use client";
import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  BookOpen,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { CalendarEvent, BookingStatus } from "@/types";

interface ScheduleCalendarProps {
  events: CalendarEvent[];
  onAccept?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  onReschedule?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

type ViewMode = "week" | "list";

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const STATUS_CONFIG: Record<
  BookingStatus,
  {
    label: string;
    variant: "default" | "warning" | "success" | "destructive" | "secondary";
    pill: string;
  }
> = {
  Pending:        { label: "Chờ duyệt",      variant: "warning",     pill: "bg-warning/15 text-warning border-warning/30" },
  AwaitingPayment:{ label: "Chờ thanh toán", variant: "warning",     pill: "bg-warning/15 text-warning border-warning/30" },
  Confirmed:      { label: "Đã xác nhận",    variant: "success",     pill: "bg-success/15 text-success border-success/30" },
  InProgress:     { label: "Đang học",       variant: "default",     pill: "bg-primary/15 text-primary border-primary/30" },
  Completed:      { label: "Hoàn thành",     variant: "secondary",   pill: "bg-muted text-muted-foreground border-border" },
  Cancelled:      { label: "Đã hủy",         variant: "destructive", pill: "bg-destructive/10 text-destructive border-destructive/25" },
  Disputed:       { label: "Tranh chấp",     variant: "destructive", pill: "bg-destructive/10 text-destructive border-destructive/25" },
  Resolved:       { label: "Đã giải quyết",  variant: "secondary",   pill: "bg-muted text-muted-foreground border-border" },
};

/** Background tint for week-view event chips */
const EVENT_CHIP_BG: Partial<Record<BookingStatus, string>> = {
  Pending:  "bg-warning/10 border-warning/20 text-warning-foreground",
  Confirmed:"bg-success/10 border-success/20 text-success-foreground",
  InProgress:"bg-primary/10 border-primary/20 text-primary-foreground",
  Completed:"bg-muted border-border text-muted-foreground",
  Cancelled:"bg-destructive/8 border-destructive/15 text-destructive",
};

function StatusBadge({ status }: { status?: BookingStatus }) {
  if (!status) return null;
  const cfg = STATUS_CONFIG[status];
  return (
    <Badge variant={cfg.variant} className="text-xs shrink-0">
      {cfg.label}
    </Badge>
  );
}

export function ScheduleCalendar({
  events,
  onAccept,
  onReject,
  onReschedule,
  onCancel,
  onEventClick,
}: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  /* ── Navigation ── */
  const shift = (delta: number) => {
    const d = new Date(currentDate);
    if (viewMode === "week") d.setDate(d.getDate() + delta * 7);
    else d.setMonth(d.getMonth() + delta);
    setCurrentDate(d);
  };

  /* ── Week helpers ── */
  const getWeekDates = () => {
    const start = new Date(currentDate);
    const dow = start.getDay();
    start.setDate(start.getDate() - dow + (dow === 0 ? -6 : 1));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const toDateStr = (d: Date) => d.toISOString().split("T")[0];
  const today = toDateStr(new Date());
  const weekDates = getWeekDates();

  const eventsForDate = (d: Date) => {
    const s = toDateStr(d);
    return events.filter((e) => e.date === s);
  };

  /* ── Week range label ── */
  const weekLabel = `${weekDates[0].toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })} – ${weekDates[6].toLocaleDateString("vi-VN", { day: "numeric", month: "numeric", year: "numeric" })}`;

  /* ── Upcoming events for list view ── */
  const upcomingEvents = [...events]
    .filter((e) => e.date >= today)
    .sort((a, b) =>
      `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)
    );

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="surface-card flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => shift(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-9 px-3" onClick={() => setCurrentDate(new Date())}>
            Hôm nay
          </Button>
          <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => shift(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-2 text-sm font-semibold text-foreground">
            {viewMode === "week" ? weekLabel : currentDate.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => setViewMode("week")}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            Theo tuần
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => setViewMode("list")}
          >
            <List className="h-3.5 w-3.5" />
            Danh sách
          </Button>
        </div>
      </div>

      {/* ══ WEEK VIEW ══ */}
      {viewMode === "week" && (
        <div className="surface-card overflow-hidden">
          {/* Day header row */}
          <div className="grid grid-cols-7 border-b border-border">
            {weekDates.map((date, i) => {
              const isToday = toDateStr(date) === today;
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-0.5 py-3 text-center ${i < 6 ? "border-r border-border" : ""} ${isToday ? "bg-primary/5" : ""}`}
                >
                  <span className={`text-xs font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {DAY_LABELS[date.getDay()]}
                  </span>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {date.toLocaleDateString("vi-VN", { month: "numeric" })}/
                    {date.getFullYear().toString().slice(2)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Event cells */}
          <div className="grid grid-cols-7 divide-x divide-border">
            {weekDates.map((date, i) => {
              const dayEvts = eventsForDate(date);
              const isToday = toDateStr(date) === today;
              return (
                <div
                  key={i}
                  className={`min-h-40 p-1.5 space-y-1 ${isToday ? "bg-primary/3" : ""}`}
                >
                  {dayEvts.length === 0 ? (
                    <div className="flex h-full min-h-36 items-center justify-center">
                      <span className="text-xs text-muted-foreground/40">—</span>
                    </div>
                  ) : (
                    dayEvts.map((evt, idx) => {
                      const chipCls = (evt.status && EVENT_CHIP_BG[evt.status]) ?? "bg-muted border-border";
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onEventClick?.(evt)}
                          className={`w-full rounded-lg border px-2 py-1.5 text-left transition-opacity hover:opacity-80 ${chipCls}`}
                        >
                          <div className="text-xs font-semibold leading-tight truncate">
                            {evt.startTime} – {evt.endTime}
                          </div>
                          <div className="mt-0.5 text-xs leading-tight truncate opacity-80">
                            {evt.title}
                          </div>
                          {evt.status && (
                            <div className="mt-1">
                              <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium border ${(STATUS_CONFIG[evt.status]?.pill ?? "")}`}>
                                {STATUS_CONFIG[evt.status]?.label}
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ LIST VIEW ══ */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <div className="surface-card flex flex-col items-center gap-3 py-16 text-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-base font-medium text-muted-foreground">Chưa có lịch dạy nào sắp tới</p>
              <p className="text-sm text-muted-foreground/70">Các buổi học mới sẽ xuất hiện ở đây sau khi phụ huynh đặt lịch.</p>
            </div>
          ) : (
            upcomingEvents.map((evt, idx) => {
              const dateObj = new Date(evt.date + "T00:00:00");
              const isToday = evt.date === today;
              return (
                <div key={idx} className="surface-card overflow-hidden">
                  {/* Color accent top bar */}
                  <div className={`h-1 ${
                    evt.status === "Pending"   ? "bg-warning" :
                    evt.status === "Confirmed" ? "bg-success" :
                    evt.status === "InProgress"? "bg-primary" :
                    evt.status === "Cancelled" ? "bg-destructive" :
                    "bg-border"
                  }`} />

                  <div className="p-5">
                    {/* Row 1: date + status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className={`text-sm font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>
                          {isToday ? "Hôm nay — " : ""}
                          {dateObj.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
                        </span>
                      </div>
                      <StatusBadge status={evt.status} />
                    </div>

                    {/* Row 2: title + time */}
                    <div className="mb-3">
                      <h4 className="text-lg font-bold text-foreground leading-snug">{evt.title}</h4>
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{evt.startTime} – {evt.endTime}</span>
                      </div>
                    </div>

                    {/* Row 3: meta chips */}
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                      {evt.studentName && (
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 shrink-0 text-primary" />
                          {evt.studentName}
                        </span>
                      )}
                      {evt.subject && (
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
                          {evt.subject}
                        </span>
                      )}
                      {evt.amount != null && (
                        <span className="flex items-center gap-1.5 font-semibold text-primary">
                          <Banknote className="h-3.5 w-3.5 shrink-0" />
                          {formatCurrency(evt.amount)}
                        </span>
                      )}
                    </div>

                    {/* Row 4: actions */}
                    {(evt.canAccept || evt.canReject || evt.canReschedule || evt.canCancel) && (
                      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                        {evt.canAccept && (
                          <Button
                            size="sm"
                            className="gap-1.5"
                            onClick={() => onAccept?.(evt.bookingId!)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Chấp nhận
                          </Button>
                        )}
                        {evt.canReject && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => onReject?.(evt.bookingId!)}
                          >
                            <XCircle className="h-4 w-4" />
                            Từ chối
                          </Button>
                        )}
                        {evt.canCancel && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1.5 ml-auto"
                            onClick={() => onCancel?.(evt.bookingId!)}
                          >
                            Hủy buổi học
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
