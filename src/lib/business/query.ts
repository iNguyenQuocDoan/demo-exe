import { addDays, format, getDay, parseISO } from "date-fns";
import type { Booking, BookingStatus, FreeSlot, TutorAvailability } from "@/types";

function toOurDow(dateFnsDow: number): number {
  return dateFnsDow === 0 ? 7 : dateFnsDow;
}

function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTime(minutes: number): string {
  const hour = Math.floor(minutes / 60).toString().padStart(2, "0");
  const minute = (minutes % 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
}

const SLOT_DURATION = 90;
const BUSY_STATUSES: BookingStatus[] = [
  "Confirmed",
  "InProgress",
  "Completed",
  "Pending",
  "AwaitingPayment",
];

export function computeFreeSlots(
  availability: TutorAvailability,
  bookings: Booking[],
  fromDate: string,
  toDate: string
): FreeSlot[] {
  const result: FreeSlot[] = [];
  let currentDate = parseISO(fromDate);
  const endDate = parseISO(toDate);

  while (currentDate <= endDate) {
    const dateString = format(currentDate, "yyyy-MM-dd");
    const dayOfWeek = toOurDow(getDay(currentDate));

    let ranges = availability.weeklySlots
      .filter((slot) => slot.dayOfWeek === dayOfWeek)
      .map((slot) => ({
        start: timeToMinutes(slot.startTime),
        end: timeToMinutes(slot.endTime),
      }));

    const exceptions = availability.exceptions.filter((exception) => exception.date === dateString);
    for (const exception of exceptions) {
      if (exception.type === "BLOCK") {
        const blockStart = timeToMinutes(exception.startTime);
        const blockEnd = timeToMinutes(exception.endTime);
        ranges = ranges.flatMap((range) => {
          if (blockEnd <= range.start || blockStart >= range.end) return [range];
          const parts: typeof ranges = [];
          if (range.start < blockStart) parts.push({ start: range.start, end: blockStart });
          if (range.end > blockEnd) parts.push({ start: blockEnd, end: range.end });
          return parts;
        });
      } else if (exception.type === "AVAILABLE_EXTRA") {
        ranges.push({
          start: timeToMinutes(exception.startTime),
          end: timeToMinutes(exception.endTime),
        });
      }
    }

    // Merge overlapping/duplicate ranges to prevent duplicate slots
    ranges.sort((a, b) => a.start - b.start);
    const merged: typeof ranges = [];
    for (const range of ranges) {
      if (merged.length === 0 || range.start >= merged[merged.length - 1].end) {
        merged.push({ ...range });
      } else {
        merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, range.end);
      }
    }
    ranges = merged;

    const busyBookings = bookings.filter((booking) => {
      if (booking.tutorId !== availability.tutorId) return false;
      if (!BUSY_STATUSES.includes(booking.status)) return false;
      return booking.startAt.startsWith(dateString) || booking.endAt.startsWith(dateString);
    });

    for (const booking of busyBookings) {
      const start = new Date(booking.startAt);
      const end = new Date(booking.endAt);
      const bookingStart = start.getHours() * 60 + start.getMinutes();
      const bookingEnd = end.getHours() * 60 + end.getMinutes();

      ranges = ranges.flatMap((range) => {
        if (bookingEnd <= range.start || bookingStart >= range.end) return [range];
        const parts: typeof ranges = [];
        if (range.start < bookingStart) parts.push({ start: range.start, end: bookingStart });
        if (range.end > bookingEnd) parts.push({ start: bookingEnd, end: range.end });
        return parts;
      });
    }

    for (const range of ranges) {
      let slotStart = range.start;
      while (slotStart + SLOT_DURATION <= range.end) {
        result.push({
          date: dateString,
          startTime: minutesToTime(slotStart),
          endTime: minutesToTime(slotStart + SLOT_DURATION),
          duration: SLOT_DURATION,
          tutorId: availability.tutorId,
        });
        slotStart += SLOT_DURATION;
      }
    }

    currentDate = addDays(currentDate, 1);
  }

  return result;
}
