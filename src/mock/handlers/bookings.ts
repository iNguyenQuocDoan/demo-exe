import { db } from "../db";
import { computeFeeBreakdown, computePlatformFee, hasTimeConflict, buildRecurringSessions } from "../rules";
import type { Booking, BookingStatus, ScheduleSeries } from "@/types";

function currentUserId(): string {
  if (typeof window === "undefined") return "";
  try { return (JSON.parse(localStorage.getItem("auth_user") ?? "{}") as { id?: string }).id ?? ""; }
  catch { return ""; }
}

function uid(): string { return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

export function handleGetBookings(params: Record<string, string>) {
  let list = [...db.bookings];
  if (params.parentId) list = list.filter((b) => b.parentId === params.parentId);
  if (params.tutorId) list = list.filter((b) => b.tutorId === params.tutorId);
  if (params.status) list = list.filter((b) => b.status === params.status);
  list.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(params.limit) || 100));
  const total = list.length;
  const bookings = params.page ? list.slice((page - 1) * limit, page * limit) : list;
  return { status: 200, data: { ok: true, bookings, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } };
}

export function handleCreateBooking(body: {
  tutorId: string; startAt: string; endAt: string;
  subject?: string; subjectName?: string; grade?: string; teachingMode?: string;
  studentName?: string; notes?: string; location?: string; baseAmount: number;
  parentGoal?: string; goalTags?: string[];
}) {
  const parentId = currentUserId();
  if (!parentId) return { status: 401, data: { ok: false, error: "Unauthorized" } };

  if (hasTimeConflict(body.tutorId, body.startAt, body.endAt, db.bookings))
    return { status: 409, data: { ok: false, error: "Khung giờ này đã được đặt" } };

  // body.baseAmount is already the session amount (pricePerHour * duration / 60), not the hourly rate
  const baseAmount = body.baseAmount ?? 0;
  const platformFee = computePlatformFee(baseAmount, db.feeConfig);
  const totalAmount = baseAmount; // parent pays baseAmount only; platform fee deducted from tutor payout
  // Deduct from parent wallet
  const wallet = db.wallets.find((w) => w.userId === parentId);
  if (wallet && wallet.balance < totalAmount)
    return { status: 400, data: { ok: false, error: "Số dư khả dụng không đủ để đặt buổi học này" } };

  const booking: Booking = {
    id: `b_${uid()}`, type: "NORMAL", parentId,
    tutorId: body.tutorId, startAt: body.startAt, endAt: body.endAt,
    baseAmount, platformFee, totalAmount,
    status: "Pending",
    subject: body.subject, subjectName: body.subjectName, grade: body.grade,
    teachingMode: body.teachingMode as Booking["teachingMode"],
    studentName: body.studentName, notes: body.notes, location: body.location,
    parentGoal: body.parentGoal, goalTags: body.goalTags,
  };
  db.bookings.push(booking);
  db.saveBookings();

  if (wallet) {
    db.addTransaction({ walletId: wallet.id, userId: parentId, type: "BOOKING_HOLD", amount: -totalAmount, balanceBefore: 0, balanceAfter: 0, status: "Completed", description: `Giữ tiền buổi học`, referenceId: booking.id, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() });
  }
  return { status: 201, data: { ok: true, booking } };
}

function setBookingStatus(id: string, status: BookingStatus) {
  const b = db.bookings.find((b) => b.id === id);
  if (!b) return { status: 404, data: { ok: false, error: "Booking not found" } };
  b.status = status;
  db.saveBookings();
  return { status: 200, data: { ok: true, booking: b } };
}

export function handleAcceptBooking(id: string) { return setBookingStatus(id, "Confirmed"); }
export function handleStartBooking(id: string) { return setBookingStatus(id, "InProgress"); }

export function handleCompleteBooking(id: string) {
  const b = db.bookings.find((b) => b.id === id);
  if (!b) return { status: 404, data: { ok: false, error: "Booking not found" } };
  b.status = "Completed";
  db.saveBookings();

  // Pay tutor (find tutor's user account)
  const tutorProfile = db.tutors.find((t) => t.id === b.tutorId);
  const tutorUser = db.rawUsers.find((u) => u.tutorProfileId === b.tutorId);
  if (tutorUser) {
    const tutorWallet = db.getOrCreateWallet(tutorUser.id);
    const tutorEarning = b.baseAmount - b.platformFee; // tutor gets 90% (platform fee deducted)
    db.addTransaction({ walletId: tutorWallet.id, userId: tutorUser.id, type: "TUTOR_PAYOUT", amount: tutorEarning, balanceBefore: 0, balanceAfter: 0, status: "Completed", description: `Thanh toán gia sư ${tutorProfile?.fullName ?? ""}`, referenceId: id, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() });
  }
  return { status: 200, data: { ok: true, booking: b } };
}

export function handleCancelBooking(id: string) {
  const b = db.bookings.find((b) => b.id === id);
  if (!b) return { status: 404, data: { ok: false, error: "Booking not found" } };
  b.status = "Cancelled";
  db.saveBookings();

  // Refund parent
  if (b.parentId) {
    const wallet = db.wallets.find((w) => w.userId === b.parentId);
    if (wallet) {
      db.addTransaction({ walletId: wallet.id, userId: b.parentId, type: "REFUND", amount: b.totalAmount, balanceBefore: 0, balanceAfter: 0, status: "Completed", description: `Hoàn tiền buổi học bị hủy`, referenceId: id, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() });
    }
  }
  return { status: 200, data: { ok: true, booking: b } };
}

export function handleGetSeries(params: Record<string, string>) {
  let list = [...db.series];
  if (params.parentId) list = list.filter((s) => s.parentId === params.parentId);
  if (params.tutorId) list = list.filter((s) => s.tutorId === params.tutorId);
  return { status: 200, data: { ok: true, series: list } };
}

export function handlePreviewSeries(body: {
  tutorId: string; daysOfWeek: number[]; startTime: string;
  durationMinutes: number; startDate: string; occurrenceCount: number;
  subject?: string; grade?: string; teachingMode?: string; baseAmountPerSession: number;
}) {
  const sessions = buildRecurringSessions({ ...body, pattern: "WEEKLY" });
  const { totalAmount } = computeFeeBreakdown(body.baseAmountPerSession, body.durationMinutes, db.feeConfig);
  const previews: Booking[] = sessions.map((s, i) => ({
    id: `preview_${i}`, type: "SERIES_SESSION" as const, parentId: currentUserId(),
    tutorId: body.tutorId, startAt: s.startAt, endAt: s.endAt,
    baseAmount: body.baseAmountPerSession,
    platformFee: totalAmount - body.baseAmountPerSession,
    totalAmount, status: "Pending",
    subject: body.subject, grade: body.grade,
    teachingMode: body.teachingMode as Booking["teachingMode"],
  }));
  return { status: 200, data: { ok: true, sessions: previews } };
}

export function handleCreateSeries(body: {
  tutorId: string; daysOfWeek: number[]; startTime: string;
  durationMinutes: number; startDate: string; occurrenceCount: number;
  subject?: string; grade?: string; teachingMode?: string;
  studentName?: string; baseAmountPerSession: number;
}) {
  const parentId = currentUserId();
  if (!parentId) return { status: 401, data: { ok: false, error: "Unauthorized" } };

  const sessions = buildRecurringSessions({ ...body, pattern: "WEEKLY" });
  const { baseAmount, platformFee, totalAmount } = computeFeeBreakdown(body.baseAmountPerSession, body.durationMinutes, db.feeConfig);

  const series: ScheduleSeries = {
    id: `ser_${uid()}`, parentId, tutorId: body.tutorId,
    pattern: "WEEKLY", daysOfWeek: body.daysOfWeek, startTime: body.startTime,
    durationMinutes: body.durationMinutes, startDate: body.startDate,
    occurrenceCount: body.occurrenceCount, status: "Pending",
    baseAmountPerSession: baseAmount, platformFee, totalAmount: totalAmount * sessions.length,
  };
  db.series.push(series);

  const bookings: Booking[] = sessions.map((s) => ({
    id: `b_${uid()}`, type: "SERIES_SESSION" as const, parentId, tutorId: body.tutorId,
    seriesId: series.id, startAt: s.startAt, endAt: s.endAt,
    baseAmount, platformFee, totalAmount, status: "Pending",
    subject: body.subject, grade: body.grade,
    teachingMode: body.teachingMode as Booking["teachingMode"],
    studentName: body.studentName,
  }));
  db.bookings.push(...bookings);
  db.saveBookings();
  db.saveSeries();
  return { status: 201, data: { ok: true, series, sessions: bookings, conflicts: [] } };
}

export function handleAcceptSeries(seriesId: string) {
  const s = db.series.find((s) => s.id === seriesId);
  if (!s) return { status: 404, data: { ok: false, error: "Series not found" } };
  s.status = "Confirmed";
  db.bookings.filter((b) => b.seriesId === seriesId).forEach((b) => { b.status = "Confirmed"; });
  db.saveBookings();
  db.saveSeries();
  return { status: 200, data: { ok: true, series: s } };
}
