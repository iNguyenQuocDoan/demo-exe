/**
 * Business rules – pure functions, no side effects.
 */

import type { TutorProfile, Booking, FeeConfig, ScheduleSeries, BookingStatus } from "@/types";
import { addDays, format, parseISO, getDay, isWithinInterval, parseJSON } from "date-fns";

// Day mapping: date-fns uses 0=Sun,1=Mon... our schema uses 1=Mon...7=Sun
function toOurDow(dfDow: number): number {
  return dfDow === 0 ? 7 : dfDow;
}

// ─── District filter ──────────────────────────────────────────────────────────
export function checkTutorInDistrict(tutor: TutorProfile, districtId: string): boolean {
  return tutor.serviceAreas.districtIds.includes(districtId);
}

// ─── Fee calculation ──────────────────────────────────────────────────────────
export function computePlatformFee(
  baseAmount: number,
  feeConfig: FeeConfig
): number {
  if (feeConfig.feeType === "PERCENT") {
    return Math.round((baseAmount * feeConfig.feeValue) / 100);
  }
  return feeConfig.feeValue;
}

export function computeFeeBreakdown(
  pricePerHour: number,
  durationMinutes: number,
  feeConfig: FeeConfig
) {
  const baseAmount = Math.round((pricePerHour * durationMinutes) / 60);
  const platformFee = computePlatformFee(baseAmount, feeConfig);
  const totalAmount = baseAmount; // parent pays baseAmount only; platformFee is deducted from tutor payout
  return { baseAmount, platformFee, totalAmount };
}

// ─── Conflict detection ───────────────────────────────────────────────────────
const BUSY_STATUSES: BookingStatus[] = ["Confirmed", "InProgress", "Completed", "Pending", "AwaitingPayment"];

export function hasTimeConflict(
  tutorId: string,
  startAt: string,
  endAt: string,
  bookings: Booking[]
): boolean {
  const newStart = new Date(startAt).getTime();
  const newEnd = new Date(endAt).getTime();

  return bookings.some((b) => {
    if (b.tutorId !== tutorId) return false;
    if (!BUSY_STATUSES.includes(b.status)) return false;
    const bStart = new Date(b.startAt).getTime();
    const bEnd = new Date(b.endAt).getTime();
    // Overlap: newStart < bEnd AND newEnd > bStart
    return newStart < bEnd && newEnd > bStart;
  });
}

// ─── Recurring series builder ─────────────────────────────────────────────────
export interface RecurringSession {
  startAt: string;
  endAt: string;
}

export function buildRecurringSessions(series: Omit<ScheduleSeries, "id" | "status" | "parentId" | "tutorId" | "baseAmountPerSession" | "platformFee" | "totalAmount">): RecurringSession[] {
  const { daysOfWeek, startTime, durationMinutes, startDate, occurrenceCount } = series;
  const sessions: RecurringSession[] = [];
  let current = parseISO(startDate);
  const maxLookAhead = occurrenceCount * 14; // safety limit
  let days = 0;

  while (sessions.length < occurrenceCount && days < maxLookAhead) {
    const dow = toOurDow(getDay(current));
    if (daysOfWeek.includes(dow)) {
      const [hh, mm] = startTime.split(":").map(Number);
      const startDate = new Date(current);
      startDate.setHours(hh, mm, 0, 0);
      const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
      sessions.push({
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
      });
    }
    current = addDays(current, 1);
    days++;
  }

  return sessions;
}
