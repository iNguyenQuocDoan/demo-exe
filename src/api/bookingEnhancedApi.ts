import { acceptBooking, completeBooking, getBookings } from "@/api/bookingApi";
import type { ContactOwner, WeekPlan } from "@/types/booking-enhanced";
import type { Booking } from "@/types";
import {
  changeContactOwner,
  confirmCompletionByRole,
  getBookingEnhancement,
  getLatestContactOwnerChange,
  saveStudyPlanDraft,
  sendStudyPlanToParent,
  updateFlowStatus,
  type BookingEnhancement,
  type BookingFlowStatus,
  type StudyPlanPayload,
} from "@/lib/bookingEnhancedMock";

export interface EnhancedBookingDetail {
  booking: Booking;
  enhancement: BookingEnhancement;
}

interface GetByIdParams {
  bookingId: string;
  parentId?: string;
  tutorId?: string;
}

function toRank(status: Booking["status"]): number {
  if (status === "Pending" || status === "AwaitingPayment") return 0;
  if (status === "Confirmed") return 1;
  if (status === "InProgress") return 2;
  if (status === "Completed") return 3;
  return 4;
}

export function parseConvId(convId: string): { parentId: string; tutorId: string } | null {
  const parts = convId.split("_");
  if (parts.length !== 2) return null;
  const [parentId, tutorId] = parts;
  if (!parentId || !tutorId) return null;
  return { parentId, tutorId };
}

export async function getBookingById(params: GetByIdParams): Promise<Booking | null> {
  const { bookingId, parentId, tutorId } = params;
  const list = await getBookings({ parentId, tutorId });
  return list.find((item) => item.id === bookingId) ?? null;
}

export async function getEnhancedBookingDetail(
  params: GetByIdParams,
): Promise<EnhancedBookingDetail | null> {
  const booking = await getBookingById(params);
  if (!booking) return null;

  return {
    booking,
    enhancement: getBookingEnhancement(booking),
  };
}

export async function resolveEnhancedBookingForConversation(
  parentId: string,
  tutorId: string,
): Promise<EnhancedBookingDetail | null> {
  const bookings = await getBookings({ parentId });
  const matches = bookings
    .filter((item) => item.tutorId === tutorId)
    .sort((a, b) => {
      const rank = toRank(a.status) - toRank(b.status);
      if (rank !== 0) return rank;
      return new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
    });

  const picked = matches[0];
  if (!picked) return null;

  return {
    booking: picked,
    enhancement: getBookingEnhancement(picked),
  };
}

export async function confirmBookingAndUnlock(
  bookingId: string,
): Promise<{ ok: boolean; error?: string }> {
  const result = await acceptBooking(bookingId);
  if (!result.ok) return result;

  updateFlowStatus(bookingId, "confirmed");
  return { ok: true };
}

export interface SavePlanInput {
  bookingId: string;
  overview: string;
  duration: string;
  roadmapLines: string[];
  objectives: string[];
  materials: string[];
  homework: string[];
  progressMeasure: string;
  scheduleSuggestions?: string;
  tutorNotes?: string;
  offlineTravelHint?: string;
  offlinePreparationReminder?: string;
}

function toWeeklyPlans(input: SavePlanInput): WeekPlan[] {
  const roadmap = input.roadmapLines.filter(Boolean);
  const objectives = input.objectives.filter(Boolean);
  const materials = input.materials.filter(Boolean);
  const homework = input.homework.filter(Boolean);

  return roadmap.map((line, index) => ({
    weekNumber: index + 1,
    topics: [line],
    objectives: objectives.length > 0 ? objectives : ["<OBJECTIVE_PLACEHOLDER>"],
    materials,
    homework,
    assessmentMethod: input.progressMeasure,
  }));
}

function toPayload(input: SavePlanInput): StudyPlanPayload {
  return {
    overview: input.overview,
    duration: input.duration,
    weeklyPlans: toWeeklyPlans(input),
    materialsNeeded: input.materials,
    tutorNotes: input.tutorNotes,
    suggestedScheduleText: input.scheduleSuggestions,
    offlineTravelHint: input.offlineTravelHint,
    offlinePreparationReminder: input.offlinePreparationReminder,
  };
}

export async function savePlanDraft(input: SavePlanInput): Promise<BookingEnhancement | null> {
  return saveStudyPlanDraft(input.bookingId, toPayload(input));
}

export async function sendPlan(input: SavePlanInput): Promise<BookingEnhancement | null> {
  return sendStudyPlanToParent(input.bookingId, toPayload(input));
}

export async function setFlowStatus(
  bookingId: string,
  flowStatus: BookingFlowStatus,
): Promise<BookingEnhancement | null> {
  return updateFlowStatus(bookingId, flowStatus);
}

export async function setContactOwner(
  bookingId: string,
  owner: ContactOwner,
  reason: string,
  changedBy: string,
): Promise<BookingEnhancement | null> {
  return changeContactOwner(bookingId, owner, reason, changedBy);
}

export function getLatestOwnerChange(detail: EnhancedBookingDetail): string | null {
  const latest = getLatestContactOwnerChange(detail.enhancement);
  if (!latest) return null;

  return `${latest.from?.name ?? "System"} -> ${latest.to.name}`;
}

export async function confirmCompletion(
  bookingId: string,
  role: "parent" | "tutor",
): Promise<{ ok: boolean; enhancement?: BookingEnhancement; error?: string }> {
  const result = confirmCompletionByRole(bookingId, role);
  if (!result) return { ok: false, error: "Không tìm thấy booking." };

  if (result.bothConfirmed) {
    const payoutResult = await completeBooking(bookingId);
    if (!payoutResult.ok) {
      return { ok: false, error: payoutResult.error ?? "Không thể hoàn tất booking." };
    }
  }

  return { ok: true, enhancement: result.enhancement };
}

