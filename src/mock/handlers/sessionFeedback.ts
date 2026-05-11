import { db } from "../db";
import type { SessionFeedback } from "@/types";

function currentUser(): { id: string; fullName: string; role: string; tutorProfileId?: string } | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("auth_user") ?? "null") as {
      id: string;
      fullName: string;
      role: string;
      tutorProfileId?: string;
    } | null;
  } catch {
    return null;
  }
}

export function handleSubmitFeedback(body: {
  bookingId?: string;
  teachingMethod?: number;
  punctuality?: number;
  communication?: number;
  lessonPreparation?: number;
  notes?: string;
}) {
  const user = currentUser();
  if (!user) return { status: 401, data: { ok: false, error: "Unauthorized" } };
  if (user.role !== "parent")
    return { status: 403, data: { ok: false, error: "Chỉ phụ huynh có thể gửi feedback." } };
  if (!body.bookingId) return { status: 400, data: { ok: false, error: "Thiếu bookingId." } };

  const booking = db.bookings.find((b) => b.id === body.bookingId);
  if (!booking) return { status: 404, data: { ok: false, error: "Không tìm thấy booking." } };
  if (booking.parentId !== user.id)
    return { status: 403, data: { ok: false, error: "Bạn không phải phụ huynh của buổi học này." } };
  if (booking.status !== "Completed")
    return { status: 400, data: { ok: false, error: "Chỉ có thể đánh giá khi buổi học đã hoàn thành." } };

  const dup = db.sessionFeedbacks.find((f) => f.bookingId === body.bookingId);
  if (dup) return { status: 409, data: { ok: false, error: "Bạn đã đánh giá buổi học này." } };

  const clamp = (n?: number) => Math.max(1, Math.min(5, Math.round(Number(n ?? 0))));

  const feedback: SessionFeedback = {
    id: `sf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    bookingId: body.bookingId,
    parentId: user.id,
    tutorId: booking.tutorId,
    teachingMethod: clamp(body.teachingMethod),
    punctuality: clamp(body.punctuality),
    communication: clamp(body.communication),
    lessonPreparation: clamp(body.lessonPreparation),
    notes: body.notes?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  db.sessionFeedbacks.push(feedback);
  db.saveSessionFeedbacks();
  return { status: 201, data: { ok: true, feedback } };
}

export function handleGetFeedbackByBooking(bookingId: string) {
  const feedback = db.sessionFeedbacks.find((f) => f.bookingId === bookingId) ?? null;
  return { status: 200, data: { ok: true, feedback } };
}

export function handleGetTutorFeedbackSummary(tutorId: string) {
  const list = db.sessionFeedbacks.filter((f) => f.tutorId === tutorId);
  const count = list.length;
  const summary = {
    teachingMethod: 0,
    punctuality: 0,
    communication: 0,
    lessonPreparation: 0,
  };
  if (count > 0) {
    for (const f of list) {
      summary.teachingMethod += f.teachingMethod;
      summary.punctuality += f.punctuality;
      summary.communication += f.communication;
      summary.lessonPreparation += f.lessonPreparation;
    }
    summary.teachingMethod = +(summary.teachingMethod / count).toFixed(2);
    summary.punctuality = +(summary.punctuality / count).toFixed(2);
    summary.communication = +(summary.communication / count).toFixed(2);
    summary.lessonPreparation = +(summary.lessonPreparation / count).toFixed(2);
  }
  return { status: 200, data: { ok: true, count, summary } };
}
