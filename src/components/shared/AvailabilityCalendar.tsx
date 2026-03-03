"use client";
import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getTutorAvailability } from "@/api/tutorApi";
import type { FreeSlot } from "@/types";
import { format, addWeeks, subWeeks, startOfWeek, addDays, isToday, isBefore, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

const DAY_NAMES = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

interface BusySlot {
  date: string;
  startTime: string;
}

interface Props {
  tutorId: string;
  onSelectSlot?: (slot: FreeSlot) => void;
  selectedSlot?: FreeSlot | null;
  busySlots?: BusySlot[];
}

export function AvailabilityCalendar({ tutorId, onSelectSlot, selectedSlot, busySlots = [] }: Props) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [slots, setSlots] = useState<FreeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const fromDate = format(weekStart, "yyyy-MM-dd");
  const toDate = format(addDays(weekStart, 6), "yyyy-MM-dd");

  useEffect(() => {
    setLoading(true);
    getTutorAvailability(tutorId, fromDate, toDate).then((data) => {
      setSlots(data);
      setLoading(false);
    });
  }, [tutorId, fromDate, toDate]);

  // Group free slots by date
  const slotsByDate: Record<string, FreeSlot[]> = {};
  slots.forEach((s) => {
    if (!slotsByDate[s.date]) slotsByDate[s.date] = [];
    slotsByDate[s.date].push(s);
  });

  // Group busy slots by date
  const busyByDate: Record<string, Set<string>> = {};
  busySlots.forEach((s) => {
    if (!busyByDate[s.date]) busyByDate[s.date] = new Set();
    busyByDate[s.date].add(s.startTime);
  });

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const isPast = (date: Date, time: string) => {
    const [h, m] = time.split(":").map(Number);
    const dt = new Date(date);
    dt.setHours(h, m, 0, 0);
    return isBefore(dt, new Date());
  };

  return (
    <div className="space-y-4">
      {/* Week navigator */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setWeekStart((w) => subWeeks(w, 1))}
          disabled={isBefore(subWeeks(weekStart, 1), startOfWeek(new Date(), { weekStartsOn: 1 }))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-[hsl(222_47%_11%)]">
          {format(weekStart, "dd/MM")} – {format(addDays(weekStart, 6), "dd/MM/yyyy")}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setWeekStart((w) => addWeeks(w, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-2">
          {days.map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Day headers */}
          {days.map((day, i) => (
            <div
              key={i}
              className={cn(
                "rounded-lg py-2 text-xs font-semibold",
                isToday(day)
                  ? "bg-[hsl(221_83%_53%)] text-white"
                  : "text-[hsl(215_16%_47%)]"
              )}
            >
              <div>{DAY_NAMES[i]}</div>
              <div className="text-sm font-bold">{format(day, "d")}</div>
            </div>
          ))}

          {/* Slots */}
          {days.map((day, i) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const daySlots = slotsByDate[dateStr] ?? [];
            const dayBusy = busyByDate[dateStr] ?? new Set<string>();

            // Collect all slot times to render (free + busy)
            const busyTimes = Array.from(dayBusy).filter(
              (t) => !daySlots.some((s) => s.startTime === t)
            );

            const isEmpty = daySlots.length === 0 && busyTimes.length === 0;

            return (
              <div key={`slots-${i}`} className="space-y-1">
                {isEmpty ? (
                  <div className="py-1 text-xs text-[hsl(215_16%_47%)]">—</div>
                ) : (
                  <>
                    {daySlots.map((slot) => {
                      const past = isPast(day, slot.startTime);
                      const isSelected =
                        selectedSlot?.date === slot.date &&
                        selectedSlot.startTime === slot.startTime;

                      return (
                        <button
                          type="button"
                          key={`free-${slot.date}-${slot.startTime}`}
                          onClick={() => !past && onSelectSlot?.(slot)}
                          disabled={past}
                          className={cn(
                            "w-full rounded-lg py-1.5 text-xs font-medium transition-all",
                            past
                              ? "bg-[hsl(210_40%_94%)] text-[hsl(215_16%_70%)] cursor-not-allowed line-through"
                              : isSelected
                              ? "bg-[hsl(221_83%_53%)] text-white shadow-sm"
                              : "bg-[hsl(221_83%_95%)] text-[hsl(221_83%_40%)] hover:bg-[hsl(221_83%_85%)] cursor-pointer"
                          )}
                        >
                          {slot.startTime}
                        </button>
                      );
                    })}
                    {busyTimes.map((time) => (
                      <button
                        type="button"
                        key={`busy-${dateStr}-${time}`}
                        disabled
                        title="Đã có người đặt"
                        className="w-full rounded-lg py-1.5 text-xs font-medium bg-red-100 text-red-500 cursor-not-allowed line-through"
                      >
                        {time}
                      </button>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {slots.length === 0 && !loading && (
        <p className="text-center text-sm text-[hsl(215_16%_47%)] py-4">
          Gia sư không có lịch trống trong tuần này.
        </p>
      )}

      <p className="text-xs text-[hsl(215_16%_47%)] flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        Mỗi slot = 90 phút dạy
      </p>
    </div>
  );
}
