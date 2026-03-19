import { db } from "../db";
import { computeFreeSlots } from "@/lib/business/query";
import type { TutorProfile } from "@/types";

function currentUser(): { id: string; fullName: string } | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("auth_user") ?? "null") as { id: string; fullName: string } | null;
  } catch { return null; }
}

function applyFilter(tutors: TutorProfile[], params: Record<string, string>) {
  let result = tutors.filter((t) => t.profileStatus === "Approved");
  if (params.cityId) result = result.filter((t) => t.serviceAreas.cityId === params.cityId);
  if (params.districtId) result = result.filter((t) => t.serviceAreas.districtIds.includes(params.districtId));
  if (params.teachingMode && params.teachingMode !== "ALL")
    result = result.filter((t) => t.teachingMode === params.teachingMode);
  if (params.subjectId) result = result.filter((t) => t.subjects.includes(params.subjectId));
  if (params.minPrice) result = result.filter((t) => t.pricePerHour >= Number(params.minPrice));
  if (params.maxPrice) result = result.filter((t) => t.pricePerHour <= Number(params.maxPrice));
  if (params.sortBy === "price_asc") result.sort((a, b) => a.pricePerHour - b.pricePerHour);
  else if (params.sortBy === "price_desc") result.sort((a, b) => b.pricePerHour - a.pricePerHour);
  else if (params.sortBy === "reviewCount") result.sort((a, b) => b.reviewCount - a.reviewCount);
  else result.sort((a, b) => b.ratingAvg - a.ratingAvg);
  return result;
}

export function handleGetTutors(params: Record<string, string>) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
  const filtered = applyFilter(db.tutors, params);
  const total = filtered.length;
  const tutors = filtered.slice((page - 1) * limit, page * limit);
  return { status: 200, data: { ok: true, tutors, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } };
}

export function handleGetTutor(id: string) {
  const tutor = db.tutors.find((t) => t.id === id);
  if (!tutor) return { status: 404, data: { ok: false, error: "Tutor not found" } };
  return { status: 200, data: { ok: true, tutor } };
}

export function handleUpdateTutor(id: string, body: Partial<TutorProfile>) {
  const idx = db.tutors.findIndex((t) => t.id === id);
  if (idx === -1) return { status: 404, data: { ok: false, error: "Tutor not found" } };
  db.tutors[idx] = { ...db.tutors[idx], ...body };
  return { status: 200, data: { ok: true, tutor: db.tutors[idx] } };
}

export function handleGetTutorReviews(tutorId: string) {
  const reviews = db.reviews.filter((r) => r.tutorId === tutorId);
  return { status: 200, data: { ok: true, reviews } };
}

export function handleGetAllReviews(params: Record<string, string>) {
  const reviews = params.tutorId
    ? db.reviews.filter((r) => r.tutorId === params.tutorId)
    : db.reviews;
  return { status: 200, data: { ok: true, reviews } };
}

export function handleGetReviewByBookingId(bookingId: string) {
  const review = db.reviews.find((r) => r.bookingId === bookingId) ?? null;
  return { status: 200, data: { ok: true, review } };
}

export function handleCreateReview(body: {
  bookingId: string;
  tutorId: string;
  rating: number;
  comment: string;
}) {
  const user = currentUser();
  if (!user) return { status: 401, data: { ok: false, error: "Unauthorized" } };
  const existing = db.reviews.find((r) => r.bookingId === body.bookingId);
  if (existing)
    return { status: 400, data: { ok: false, error: "Booking này đã được đánh giá." } };
  const booking = db.bookings.find((b) => b.id === body.bookingId);
  if (!booking || booking.status !== "Completed")
    return { status: 400, data: { ok: false, error: "Chỉ có thể đánh giá buổi học đã hoàn thành." } };
  const review = {
    id: `rv_${Date.now()}`,
    parentId: user.id,
    parentName: user.fullName,
    tutorId: body.tutorId,
    bookingId: body.bookingId,
    rating: body.rating,
    comment: body.comment,
    createdAt: new Date().toISOString(),
  };
  db.reviews.push(review);
  // Recalculate tutor rating
  const tutorReviews = db.reviews.filter((r) => r.tutorId === body.tutorId);
  const avg = tutorReviews.reduce((s, r) => s + r.rating, 0) / tutorReviews.length;
  const tidx = db.tutors.findIndex((t) => t.id === body.tutorId);
  if (tidx !== -1) {
    db.tutors[tidx].ratingAvg = Math.round(avg * 10) / 10;
    db.tutors[tidx].reviewCount = tutorReviews.length;
  }
  return { status: 200, data: { ok: true, review } };
}

export function handleGetAvailabilityForSlots(tutorId: string) {
  const avail = db.availability.find((a) => a.tutorId === tutorId);
  if (!avail) return { status: 200, data: { ok: true, availability: null } };
  return { status: 200, data: { ok: true, availability: avail } };
}

export function handleGetFreeSlots(tutorId: string, fromDate: string, toDate: string) {
  const avail = db.availability.find((a) => a.tutorId === tutorId);
  if (!avail || !avail.acceptingBookings) return { status: 200, data: { ok: true, slots: [] } };
  const slots = computeFreeSlots(avail, db.bookings, fromDate, toDate);
  return { status: 200, data: { ok: true, slots } };
}
