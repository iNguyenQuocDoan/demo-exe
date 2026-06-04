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
  TutorCompleted: { label: "Chờ PH xác nhận", variant: "warning",    pill: "bg-warning/15 text-warning border-warning/30" },
  ParentCompleted:{ label: "Chờ GS xác nhận", variant: "warning",    pill: "bg-warning/15 text-warning border-warning/30" },
  Completed:      { label: "Hoàn thành",     variant: "secondary",   pill: "bg-muted text-muted-foreground border-border" },
  Cancelled:      { label: "Đã hủy",         variant: "destructive", pill: "bg-destructive/10 text-destructive border-destructive/25" },
  Disputed:       { label: "Tranh chấp",     variant: "destructive", pill: "bg-destructive/10 text-destructive border-destructive/25" },
  Resolved:       { label: "Đã giải quyết",  variant: "secondary",   pill: "bg-muted text-muted-foreground border-border" },
};

/** Minutes since midnight from a "HH:mm" string. */
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** Pixel height of one hour row in the time grid. */
const GRID_HOUR_PX = 48;

/** Color of a time-grid event block by type/status. */
function eventBlockClass(e: CalendarEvent): string {
  if (e.type === "availability")
    return "border-dashed border-success/50 bg-success/10 text-success";
  switch (e.status) {
    case "Pending":
    case "AwaitingPayment":
      return "border-warning/40 bg-warning/15 text-warning-foreground";
    case "Confirmed":
      return "border-primary/50 bg-primary/15 text-primary";
    case "InProgress":
      return "border-success/50 bg-success/20 text-success";
    case "Cancelled":
    case "Disputed":
      return "border-destructive/40 bg-destructive/10 text-destructive";
    default: // Completed / Resolved
      return "border-border bg-muted text-muted-foreground";
  }
}

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

      {/* ══ WEEK VIEW — time grid (Google Calendar style) ══ */}
      {viewMode === "week" && (() => {
        const weekEvents = events.filter((e) => weekDates.some((d) => toDateStr(d) === e.date));
        let minH = 7;
        let maxH = 21;
        for (const e of weekEvents) {
          minH = Math.min(minH, Math.floor(toMin(e.startTime) / 60));
          maxH = Math.max(maxH, Math.ceil(toMin(e.endTime) / 60));
        }
        minH = Math.max(0, minH);
        maxH = Math.min(24, Math.max(maxH, minH + 1));
        const hours = Array.from({ length: maxH - minH }, (_, i) => minH + i);
        const gridH = hours.length * GRID_HOUR_PX;

        return (
          <div className="surface-card overflow-x-auto p-0">
            <div className="min-w-[760px]">
              {/* Header: weekday + date */}
              <div className="flex border-b border-border">
                <div className="w-14 shrink-0" />
                {weekDates.map((date, i) => {
                  const isToday = toDateStr(date) === today;
                  return (
                    <div key={i} className={`flex-1 py-2 text-center ${i < 6 ? "border-r border-border" : ""} ${isToday ? "bg-primary/5" : ""}`}>
                      <div className={`text-xs font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                        {DAY_LABELS[date.getDay()]}
                      </div>
                      <div className={`mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Body: hour gutter + day columns */}
              <div className="flex">
                <div className="w-14 shrink-0">
                  {hours.map((h) => (
                    <div key={h} style={{ height: GRID_HOUR_PX }} className="relative">
                      <span className="absolute -top-2 right-1.5 text-[10px] text-muted-foreground">{h}:00</span>
                    </div>
                  ))}
                </div>

                {weekDates.map((date, i) => {
                  const isToday = toDateStr(date) === today;
                  const dayEvents = [...eventsForDate(date)].sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
                  // Lane assignment so overlapping events sit side by side.
                  const laneEnds: number[] = [];
                  const placed = dayEvents.map((e) => {
                    const s = toMin(e.startTime);
                    const en = Math.max(toMin(e.endTime), s + 30);
                    let lane = laneEnds.findIndex((end) => end <= s);
                    if (lane === -1) {
                      lane = laneEnds.length;
                      laneEnds.push(en);
                    } else {
                      laneEnds[lane] = en;
                    }
                    return { e, s, en, lane };
                  });
                  const lanes = Math.max(1, laneEnds.length);
                  return (
                    <div
                      key={i}
                      className={`relative flex-1 ${i < 6 ? "border-r border-border" : ""} ${isToday ? "bg-primary/3" : ""}`}
                      style={{ height: gridH }}
                    >
                      {hours.map((h) => (
                        <div key={h} style={{ height: GRID_HOUR_PX }} className="border-t border-border/50" />
                      ))}
                      {placed.map(({ e, s, en, lane }) => {
                        const widthPct = 100 / lanes;
                        return (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => onEventClick?.(e)}
                            style={{
                              top: ((s - minH * 60) / 60) * GRID_HOUR_PX,
                              height: Math.max(((en - s) / 60) * GRID_HOUR_PX - 2, 18),
                              left: `calc(${lane * widthPct}% + 1px)`,
                              width: `calc(${widthPct}% - 2px)`,
                            }}
                            className={`absolute overflow-hidden rounded-md border px-1.5 py-1 text-left leading-tight transition-opacity hover:opacity-80 ${eventBlockClass(e)}`}
                          >
                            <div className="truncate text-[10px] font-semibold">{e.startTime}–{e.endTime}</div>
                            <div className="truncate text-[11px] font-medium">
                              {e.type === "availability" ? "Ca trống" : e.title}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

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
