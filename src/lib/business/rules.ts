import { addDays, getDay, parseISO } from "date-fns";
import type { Booking, BookingStatus, FeeConfig, ScheduleSeries, TutorProfile } from "@/types";

function toOurDow(dateFnsDow: number): number {
  return dateFnsDow === 0 ? 7 : dateFnsDow;
}

export function checkTutorInDistrict(tutor: TutorProfile, districtId: string): boolean {
  return tutor.serviceAreas.districtIds.includes(districtId);
}

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
  const totalAmount = baseAmount + platformFee;
  return { baseAmount, platformFee, totalAmount };
}

const BUSY_STATUSES: BookingStatus[] = [
  "Confirmed",
  "InProgress",
  "Completed",
  "Pending",
  "AwaitingPayment",
];

export function hasTimeConflict(
  tutorId: string,
  startAt: string,
  endAt: string,
  bookings: Booking[]
): boolean {
  const newStart = new Date(startAt).getTime();
  const newEnd = new Date(endAt).getTime();

  return bookings.some((booking) => {
    if (booking.tutorId !== tutorId) return false;
    if (!BUSY_STATUSES.includes(booking.status)) return false;
    const bookingStart = new Date(booking.startAt).getTime();
    const bookingEnd = new Date(booking.endAt).getTime();
    return newStart < bookingEnd && newEnd > bookingStart;
  });
}

export interface RecurringSession {
  startAt: string;
  endAt: string;
}

export function buildRecurringSessions(
  series: Omit<
    ScheduleSeries,
    | "id"
    | "status"
    | "parentId"
    | "tutorId"
    | "baseAmountPerSession"
    | "platformFee"
    | "totalAmount"
  >
): RecurringSession[] {
  const { daysOfWeek, startTime, durationMinutes, startDate, occurrenceCount } = series;
  const sessions: RecurringSession[] = [];
  let currentDate = parseISO(startDate);
  const maxLookAhead = occurrenceCount * 14;
  let dayCount = 0;

  while (sessions.length < occurrenceCount && dayCount < maxLookAhead) {
    const dayOfWeek = toOurDow(getDay(currentDate));
    if (daysOfWeek.includes(dayOfWeek)) {
      const [hour, minute] = startTime.split(":").map(Number);
      const startDateTime = new Date(currentDate);
      startDateTime.setHours(hour, minute, 0, 0);
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);
      sessions.push({
        startAt: startDateTime.toISOString(),
        endAt: endDateTime.toISOString(),
      });
    }
    currentDate = addDays(currentDate, 1);
    dayCount += 1;
  }

  return sessions;
}
