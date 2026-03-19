/**
 * Query helpers – compute free slots from availability + bookings.
 */

import type { TutorAvailability, Booking, FreeSlot, BookingStatus } from "@/types";
import { addDays, format, parseISO, getDay, isWithinInterval } from "date-fns";

// day-of-week conversion: 0=Sun…6=Sat → 1=Mon…7=Sun
function toOurDow(dfDow: number): number {
  return dfDow === 0 ? 7 : dfDow;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

const SLOT_DURATION = 90; // minutes per displayed slot
const BUSY_STATUSES: BookingStatus[] = ["Confirmed", "InProgress", "Completed", "Pending", "AwaitingPayment"];

/**
 * Returns free slots for a tutor between fromDate and toDate (inclusive).
 */
export function computeFreeSlots(
  availability: TutorAvailability,
  bookings: Booking[],
  fromDate: string, // "YYYY-MM-DD"
  toDate: string
): FreeSlot[] {
  const result: FreeSlot[] = [];
  let current = parseISO(fromDate);
  const end = parseISO(toDate);

  while (current <= end) {
    const dateStr = format(current, "yyyy-MM-dd");
    const dow = toOurDow(getDay(current));

    // 1. Base slots from weeklySlots
    let baseRanges: Array<{ start: number; end: number }> = availability.weeklySlots
      .filter((s) => s.dayOfWeek === dow)
      .map((s) => ({ start: timeToMinutes(s.startTime), end: timeToMinutes(s.endTime) }));

    // 2. Apply exceptions for this date
    const excs = availability.exceptions.filter((e) => e.date === dateStr);
    for (const exc of excs) {
      if (exc.type === "BLOCK") {
        const blockStart = timeToMinutes(exc.startTime);
        const blockEnd = timeToMinutes(exc.endTime);
        baseRanges = baseRanges.flatMap((r) => {
          if (blockEnd <= r.start || blockStart >= r.end) return [r];
          const parts: typeof baseRanges = [];
          if (r.start < blockStart) parts.push({ start: r.start, end: blockStart });
          if (r.end > blockEnd) parts.push({ start: blockEnd, end: r.end });
          return parts;
        });
      } else if (exc.type === "AVAILABLE_EXTRA") {
        baseRanges.push({ start: timeToMinutes(exc.startTime), end: timeToMinutes(exc.endTime) });
      }
    }

    // 3. Subtract busy intervals from bookings
    const busyForDay = bookings.filter((b) => {
      if (b.tutorId !== availability.tutorId) return false;
      if (!BUSY_STATUSES.includes(b.status)) return false;
      return b.startAt.startsWith(dateStr) || b.endAt.startsWith(dateStr);
    });

    for (const bk of busyForDay) {
      const bkStart = new Date(bk.startAt);
      const bkEnd = new Date(bk.endAt);
      const bkStartMins = bkStart.getHours() * 60 + bkStart.getMinutes();
      const bkEndMins = bkEnd.getHours() * 60 + bkEnd.getMinutes();
      baseRanges = baseRanges.flatMap((r) => {
        if (bkEndMins <= r.start || bkStartMins >= r.end) return [r];
        const parts: typeof baseRanges = [];
        if (r.start < bkStartMins) parts.push({ start: r.start, end: bkStartMins });
        if (r.end > bkEndMins) parts.push({ start: bkEndMins, end: r.end });
        return parts;
      });
    }

    // 4. Generate SLOT_DURATION-minute slots from remaining ranges
    for (const range of baseRanges) {
      let slotStart = range.start;
      while (slotStart + SLOT_DURATION <= range.end) {
        result.push({
          date: dateStr,
          startTime: minutesToTime(slotStart),
          endTime: minutesToTime(slotStart + SLOT_DURATION),
          duration: SLOT_DURATION,
          tutorId: availability.tutorId,
        });
        slotStart += SLOT_DURATION;
      }
    }

    current = addDays(current, 1);
  }

  return result;
}
