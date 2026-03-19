"use client";

import type { Booking, BookingStatus, TeachingMode } from "@/types";
import type {
  CompletionConfirmation,
  ContactOwner,
  ContactOwnerChange,
  ContactPreference,
  LearningGoal,
  LearningPreferences,
  LocationInfo,
  SessionType,
  StudyPlan,
  StudentLevel,
  WeekPlan,
} from "@/types/booking-enhanced";

const STORAGE_KEY = "tutor_booking_enhanced_v3";

export type BookingFlowStatus =
  | "pending_confirmation"
  | "confirmed"
  | "tutor_preparing_plan"
  | "plan_sent"
  | "in_session"
  | "awaiting_completion"
  | "completed";

export interface BookingEnhancement {
  bookingId: string;
  flowStatus: BookingFlowStatus;
  contactPreferences: ContactPreference[];
  learningPreferences: LearningPreferences;
  locationInfo: LocationInfo;
  currentContactOwner: ContactOwner;
  contactOwnerHistory: ContactOwnerChange[];
  studyPlan?: StudyPlan;
  completionConfirmation?: CompletionConfirmation;
}

export interface StudyPlanPayload {
  overview: string;
  duration: string;
  weeklyPlans: WeekPlan[];
  materialsNeeded?: string[];
  tutorNotes?: string;
  suggestedScheduleText?: string;
  offlineTravelHint?: string;
  offlinePreparationReminder?: string;
}

export const FLOW_STATUS_META: Record<
  BookingFlowStatus,
  {
    labelVi: string;
    labelEn: string;
    variant: "warning" | "success" | "default" | "secondary";
  }
> = {
  pending_confirmation: {
    labelVi: "Chờ xác nhận",
    labelEn: "Pending confirmation",
    variant: "warning",
  },
  confirmed: {
    labelVi: "Đã xác nhận",
    labelEn: "Confirmed",
    variant: "success",
  },
  tutor_preparing_plan: {
    labelVi: "Gia sư đang chuẩn bị kế hoạch",
    labelEn: "Tutor preparing plan",
    variant: "default",
  },
  plan_sent: {
    labelVi: "Đã gửi kế hoạch",
    labelEn: "Plan sent",
    variant: "default",
  },
  in_session: {
    labelVi: "Đang học",
    labelEn: "In session",
    variant: "default",
  },
  awaiting_completion: {
    labelVi: "Chờ xác nhận hoàn thành",
    labelEn: "Awaiting completion",
    variant: "warning",
  },
  completed: {
    labelVi: "Hoàn tất",
    labelEn: "Completed",
    variant: "secondary",
  },
};

export const FLOW_TIMELINE: BookingFlowStatus[] = [
  "pending_confirmation",
  "confirmed",
  "tutor_preparing_plan",
  "plan_sent",
  "in_session",
  "awaiting_completion",
  "completed",
];

type EnhancementStore = Record<string, BookingEnhancement>;

const SEED_OWNER_TUTOR_AN: ContactOwner = {
  userId: "tu1",
  name: "Nguyen Van An",
  role: "TUTOR",
  assignedAt: "2026-03-01T08:00:00.000Z",
};

const SEED_OWNER_SUPPORT: ContactOwner = {
  userId: "support_01",
  name: "Linh Tran",
  role: "SUPPORT_STAFF",
  assignedAt: "2026-03-02T09:20:00.000Z",
};

const SEED_ENHANCEMENTS: EnhancementStore = {
  b1: {
    bookingId: "b1",
    flowStatus: "completed",
    learningPreferences: {
      teachingMode: "OFFLINE",
      sessionType: "ONE_ON_ONE",
      studentLevel: "INTERMEDIATE",
      goals: ["IMPROVE_GRADES", "EXAM_PREP"],
      preferredSchedule: {
        daysOfWeek: [2, 4],
        timeSlots: ["evening"],
      },
      frequency: "2 sessions/week",
      notes: "<PARENT_NOTE_PLACEHOLDER>",
    },
    contactPreferences: [
      { method: "IN_APP_CHAT", priority: 1, isVisible: true },
      {
        method: "EMAIL",
        priority: 2,
        value: "parent@demo.vn",
        isVisible: true,
      },
    ],
    locationInfo: {
      district: "Quận 7",
      city: "TP. Hồ Chí Minh",
      meetingPlatform: "GOOGLE_MEET",
      meetingLink: "https://meet.google.com/abc-def-ghi",
    },
    currentContactOwner: SEED_OWNER_SUPPORT,
    contactOwnerHistory: [
      {
        id: "owner_change_b1_1",
        bookingId: "b1",
        from: SEED_OWNER_TUTOR_AN,
        to: SEED_OWNER_SUPPORT,
        reason: "Parent requested schedule support",
        changedAt: "2026-03-02T09:20:00.000Z",
        changedBy: "system",
      },
    ],
    studyPlan: {
      id: "plan_b1",
      bookingId: "b1",
      tutorId: "t1",
      createdAt: "2026-03-01T09:00:00.000Z",
      updatedAt: "2026-03-02T10:00:00.000Z",
      status: "SENT",
      overview: "Kế hoạch ôn luyện Toán lớp 10 trong 4 tuần, tập trung vào hình học không gian và giải tích để chuẩn bị thi giữa kỳ.",
      duration: "4 tuần",
      weeklyPlans: [
        {
          weekNumber: 1,
          topics: ["Hình học không gian – ôn lại nền tảng"],
          objectives: ["Nắm vững các công thức thể tích hình chóp, hình trụ, hình cầu"],
          materials: ["Bộ bài tập hình học số 01", "Slide tổng hợp công thức"],
          homework: ["Làm lại 5 bài tập thể tích từ đề thi cũ"],
          assessmentMethod: "Kiểm tra nhanh cuối buổi (10 phút)",
        },
        {
          weekNumber: 2,
          topics: ["Đạo hàm và ứng dụng – tìm cực trị"],
          objectives: ["Thành thạo quy tắc đạo hàm cơ bản và bài toán tìm cực trị"],
          materials: ["Bộ bài tập giải tích số 02"],
          homework: ["Giải 10 bài tìm cực trị hàm số"],
          assessmentMethod: "Bài kiểm tra ngắn 15 phút",
        },
      ],
      materialsNeeded: ["Vở ghi bài", "Bộ bài tập hình học số 01", "Bộ bài tập giải tích số 02"],
      tutorNotes: "Học sinh cần chú ý phân biệt công thức thể tích các khối, hay nhầm lẫn giữa hình chóp và hình trụ.",
      suggestedSchedule: {
        sessions: [
          {
            date: "2026-03-03",
            startTime: "19:00",
            endTime: "20:30",
            topic: "Hình học không gian – ôn nền tảng",
          },
        ],
      },
    },
  },
  b2: {
    bookingId: "b2",
    flowStatus: "confirmed",
    learningPreferences: {
      teachingMode: "OFFLINE",
      sessionType: "ONE_ON_ONE",
      studentLevel: "INTERMEDIATE",
      goals: ["EXAM_PREP", "HOMEWORK_HELP"],
      preferredSchedule: {
        daysOfWeek: [2, 4],
        timeSlots: ["evening"],
      },
      frequency: "2 sessions/week",
      notes: "Need short homework after each class",
    },
    contactPreferences: [
      { method: "IN_APP_CHAT", priority: 1, isVisible: true },
      {
        method: "PHONE",
        priority: 2,
        value: "0909123456",
        isVisible: true,
      },
      {
        method: "ZALO",
        priority: 3,
        value: "0909123456",
        isVisible: true,
      },
    ],
    locationInfo: {
      district: "Quận 7",
      city: "TP. Hồ Chí Minh",
      meetingPlatform: "ZOOM",
      meetingLink: "https://zoom.us/j/123456789",
    },
    currentContactOwner: SEED_OWNER_TUTOR_AN,
    contactOwnerHistory: [],
  },
  b5: {
    bookingId: "b5",
    flowStatus: "in_session",
    learningPreferences: {
      teachingMode: "OFFLINE",
      sessionType: "ONE_ON_ONE",
      studentLevel: "INTERMEDIATE",
      goals: ["IMPROVE_GRADES"],
      frequency: "1 session/week",
    },
    contactPreferences: [
      { method: "IN_APP_CHAT", priority: 1, isVisible: true },
      { method: "PHONE", priority: 2, value: "0901234567", isVisible: true },
    ],
    locationInfo: {
      district: "Quận 3",
      city: "TP. Hồ Chí Minh",
      fullAddress: "78 Võ Thị Sáu, Phường 6, Quận 3, TP. Hồ Chí Minh",
      landmark: "Gần siêu thị Vinmart",
      travelTimeEstimate: 15,
    },
    currentContactOwner: SEED_OWNER_TUTOR_AN,
    contactOwnerHistory: [],
  },
  b3: {
    bookingId: "b3",
    flowStatus: "pending_confirmation",
    learningPreferences: {
      teachingMode: "OFFLINE",
      sessionType: "GROUP",
      studentLevel: "BEGINNER",
      goals: ["IMPROVE_GRADES", "CATCH_UP"],
      preferredSchedule: {
        daysOfWeek: [3, 6],
        timeSlots: ["evening"],
      },
      frequency: "2 sessions/week",
      notes: "Prefer practical speaking activities",
    },
    contactPreferences: [
      { method: "IN_APP_CHAT", priority: 1, isVisible: true },
      {
        method: "PHONE",
        priority: 2,
        value: "0987654321",
        isVisible: true,
      },
      {
        method: "EMAIL",
        priority: 3,
        value: "parent@demo.vn",
        isVisible: true,
      },
    ],
    locationInfo: {
      district: "Quận 2",
      city: "TP. Hồ Chí Minh",
      fullAddress: "123 Đường Lê Lợi, Phường 1, Quận 2",
      landmark: "Gần trường THPT Trưng Vương",
      travelTimeEstimate: 25,
    },
    currentContactOwner: {
      userId: "t2",
      name: "Le Ha Phuong",
      role: "TUTOR",
      assignedAt: "2026-03-01T10:20:00.000Z",
    },
    contactOwnerHistory: [],
  },
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function cloneRecord(record: BookingEnhancement): BookingEnhancement {
  return JSON.parse(JSON.stringify(record)) as BookingEnhancement;
}

function loadStore(): EnhancementStore {
  const seeded = JSON.parse(JSON.stringify(SEED_ENHANCEMENTS)) as EnhancementStore;
  if (!isBrowser()) return seeded;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seeded;
    const parsed = JSON.parse(raw) as EnhancementStore;
    return { ...seeded, ...parsed };
  } catch {
    return seeded;
  }
}

function saveStore(store: EnhancementStore) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function deriveFlowStatus(status: BookingStatus): BookingFlowStatus {
  if (status === "Pending" || status === "AwaitingPayment") {
    return "pending_confirmation";
  }
  if (status === "Confirmed") {
    return "confirmed";
  }
  if (status === "InProgress") {
    return "in_session";
  }
  return "completed";
}

const TAG_TO_GOAL: Partial<Record<string, LearningGoal>> = {
  "Củng cố nền tảng": "IMPROVE_GRADES",
  "Ôn thi": "EXAM_PREP",
  "Luyện kỹ năng nói": "EXAM_PREP",
  "Bài tập về nhà": "HOMEWORK_HELP",
  "Chuẩn bị thi ĐH": "EXAM_PREP",
  "Học trước chương trình": "ENRICHMENT",
};

function pickDefaultGoals(subject?: string): LearningGoal[] {
  if (subject === "english") {
    return ["EXAM_PREP", "HOMEWORK_HELP"];
  }
  return ["IMPROVE_GRADES"];
}

function pickDefaultLevel(grade?: string): StudentLevel {
  if (!grade) return "BEGINNER";
  if (grade.includes("11") || grade.includes("12")) return "INTERMEDIATE";
  return "BEGINNER";
}

function pickDefaultSessionType(teachingMode?: TeachingMode): SessionType {
  if (teachingMode === "OFFLINE") return "GROUP";
  return "ONE_ON_ONE";
}

function buildDefaultContactPreferences(_teachingMode?: TeachingMode): ContactPreference[] {
  return [
    { method: "IN_APP_CHAT", priority: 1, isVisible: true },
    { method: "PHONE", priority: 2, value: "<PHONE_PLACEHOLDER>", isVisible: true },
    { method: "ZALO", priority: 3, value: "<ZALO_ID_PLACEHOLDER>", isVisible: true },
  ];
}

function buildDefaultLocation(_teachingMode?: TeachingMode): LocationInfo {
  return {
    district: "District 2",
    city: "HCMC",
    fullAddress: "<FULL_ADDRESS_PLACEHOLDER>",
    landmark: "<LANDMARK_PLACEHOLDER>",
    travelTimeEstimate: 20,
  };
}

function buildDefaultOwner(booking: Booking): ContactOwner {
  return {
    userId: booking.tutorId,
    name: booking.tutorId,
    role: "TUTOR",
    assignedAt: new Date().toISOString(),
  };
}

function buildDefaultEnhancement(booking: Booking): BookingEnhancement {
  const tagGoals = (booking.goalTags ?? [])
    .map((t) => TAG_TO_GOAL[t])
    .filter((g): g is LearningGoal => g !== undefined);
  const goals = tagGoals.length > 0 ? tagGoals : pickDefaultGoals(booking.subject);

  return {
    bookingId: booking.id,
    flowStatus: deriveFlowStatus(booking.status),
    contactPreferences: buildDefaultContactPreferences(booking.teachingMode),
    learningPreferences: {
      teachingMode: "OFFLINE",
      sessionType: pickDefaultSessionType(booking.teachingMode),
      studentLevel: pickDefaultLevel(booking.grade),
      goals,
      preferredSchedule: {
        daysOfWeek: [2, 4],
        timeSlots: ["evening"],
      },
      frequency: "2 sessions/week",
      notes: booking.parentGoal ?? booking.notes ?? undefined,
    },
    locationInfo: buildDefaultLocation(booking.teachingMode),
    currentContactOwner: buildDefaultOwner(booking),
    contactOwnerHistory: [],
  };
}

function syncFlowWithBooking(
  current: BookingFlowStatus,
  bookingStatus: BookingStatus,
): BookingFlowStatus {
  const fallback = deriveFlowStatus(bookingStatus);

  if (fallback === "pending_confirmation") return "pending_confirmation";
  if (fallback === "in_session") return "in_session";
  if (fallback === "completed") return "completed";

  if (current === "pending_confirmation") {
    return "confirmed";
  }

  return current;
}

export function isSensitiveInfoVisible(flowStatus: BookingFlowStatus): boolean {
  return flowStatus !== "pending_confirmation";
}


export function initBookingEnhancement(
  booking: Booking,
  input: {
    contactPhone?: string;
    contactZalo?: string;
    locationDistrict?: string;
    locationCity?: string;
    locationFullAddress?: string;
  },
): void {
  const store = loadStore();
  const base = buildDefaultEnhancement(booking);

  const prefs: ContactPreference[] = [
    { method: "IN_APP_CHAT", priority: 1, isVisible: true },
  ];
  if (input.contactPhone) {
    prefs.push({ method: "PHONE", priority: 2, value: input.contactPhone, isVisible: true });
  }
  if (input.contactZalo) {
    prefs.push({ method: "ZALO", priority: prefs.length + 1, value: input.contactZalo, isVisible: true });
  }

  const loc: LocationInfo = {
    district: input.locationDistrict ?? base.locationInfo.district,
    city: input.locationCity ?? base.locationInfo.city,
  };
  if (input.locationFullAddress) {
    loc.fullAddress = input.locationFullAddress;
  }

  store[booking.id] = { ...base, contactPreferences: prefs, locationInfo: loc };
  saveStore(store);
}

export function getBookingEnhancement(booking: Booking): BookingEnhancement {
  const store = loadStore();
  const current = cloneRecord(
    store[booking.id] ?? buildDefaultEnhancement(booking),
  );

  current.flowStatus = syncFlowWithBooking(current.flowStatus, booking.status);
  if (!current.currentContactOwner) {
    current.currentContactOwner = buildDefaultOwner(booking);
  }

  store[booking.id] = current;
  saveStore(store);

  return current;
}

export function updateFlowStatus(
  bookingId: string,
  flowStatus: BookingFlowStatus,
): BookingEnhancement | null {
  const store = loadStore();
  const existing = store[bookingId];
  if (!existing) return null;

  const next = cloneRecord(existing);
  next.flowStatus = flowStatus;
  store[bookingId] = next;
  saveStore(store);
  return next;
}

function parseScheduleText(
  suggestedScheduleText: string | undefined,
): StudyPlan["suggestedSchedule"] {
  if (!suggestedScheduleText?.trim()) return undefined;

  const sessions = suggestedScheduleText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => ({
      date: `2026-03-${String(index + 10).padStart(2, "0")}`,
      startTime: "19:00",
      endTime: "20:30",
      topic: line,
    }));

  if (sessions.length === 0) return undefined;
  return { sessions };
}

function appendOfflineNotes(
  currentNote: string | undefined,
  payload: StudyPlanPayload,
): string | undefined {
  const lines = [currentNote?.trim() ?? ""];
  if (payload.offlineTravelHint?.trim()) {
    lines.push(`Travel hint: ${payload.offlineTravelHint.trim()}`);
  }
  if (payload.offlinePreparationReminder?.trim()) {
    lines.push(`Prep reminder: ${payload.offlinePreparationReminder.trim()}`);
  }

  const merged = lines.filter(Boolean).join("\n");
  return merged || undefined;
}

export function saveStudyPlanDraft(
  bookingId: string,
  payload: StudyPlanPayload,
): BookingEnhancement | null {
  const store = loadStore();
  const existing = store[bookingId];
  if (!existing) return null;

  const next = cloneRecord(existing);
  const now = new Date().toISOString();

  const draft: StudyPlan = {
    id: next.studyPlan?.id ?? `plan_${bookingId}`,
    bookingId,
    tutorId: next.currentContactOwner.userId,
    createdAt: next.studyPlan?.createdAt ?? now,
    updatedAt: now,
    status: "DRAFT",
    overview: payload.overview,
    duration: payload.duration,
    weeklyPlans: payload.weeklyPlans,
    materialsNeeded: payload.materialsNeeded,
    tutorNotes: appendOfflineNotes(payload.tutorNotes, payload),
    suggestedSchedule: parseScheduleText(payload.suggestedScheduleText),
  };

  next.studyPlan = draft;

  if (next.flowStatus === "confirmed" || next.flowStatus === "plan_sent") {
    next.flowStatus = "tutor_preparing_plan";
  }

  store[bookingId] = next;
  saveStore(store);
  return next;
}

export function sendStudyPlanToParent(
  bookingId: string,
  payload?: StudyPlanPayload,
): BookingEnhancement | null {
  const store = loadStore();
  const existing = store[bookingId];
  if (!existing) return null;

  let next = cloneRecord(existing);
  if (payload) {
    const drafted = saveStudyPlanDraft(bookingId, payload);
    if (!drafted) return null;
    next = drafted;
  }

  if (!next.studyPlan) return null;

  next.studyPlan.status = "SENT";
  next.studyPlan.updatedAt = new Date().toISOString();
  next.flowStatus = "plan_sent";

  store[bookingId] = next;
  saveStore(store);
  return next;
}

export function changeContactOwner(
  bookingId: string,
  to: ContactOwner,
  reason: string,
  changedBy: string,
): BookingEnhancement | null {
  const store = loadStore();
  const existing = store[bookingId];
  if (!existing) return null;

  const next = cloneRecord(existing);
  const changedAt = new Date().toISOString();
  const from = next.currentContactOwner;

  const change: ContactOwnerChange = {
    id: `owner_change_${bookingId}_${Date.now()}`,
    bookingId,
    from,
    to,
    reason,
    changedAt,
    changedBy,
  };

  next.currentContactOwner = {
    ...to,
    assignedAt: changedAt,
  };
  next.contactOwnerHistory = [...next.contactOwnerHistory, change];

  store[bookingId] = next;
  saveStore(store);
  return next;
}

export function getLatestContactOwnerChange(
  enhancement: BookingEnhancement,
): ContactOwnerChange | null {
  if (enhancement.contactOwnerHistory.length === 0) return null;
  return enhancement.contactOwnerHistory[enhancement.contactOwnerHistory.length - 1] ?? null;
}

export function formatContactOwnerRole(role: ContactOwner["role"]): string {
  if (role === "TUTOR") return "Gia sư";
  if (role === "SUPPORT_STAFF") return "Nhân viên hỗ trợ";
  return "Quản trị viên";
}

export function confirmCompletionByRole(
  bookingId: string,
  role: "parent" | "tutor",
): { enhancement: BookingEnhancement; bothConfirmed: boolean } | null {
  const store = loadStore();
  const existing = store[bookingId];
  if (!existing) return null;

  const next = cloneRecord(existing);
  const now = new Date().toISOString();

  const current: CompletionConfirmation = next.completionConfirmation ?? {
    parentConfirmed: false,
    tutorConfirmed: false,
  };

  if (role === "parent") {
    current.parentConfirmed = true;
    current.parentConfirmedAt = now;
  } else {
    current.tutorConfirmed = true;
    current.tutorConfirmedAt = now;
  }

  next.completionConfirmation = current;
  const bothConfirmed = current.parentConfirmed && current.tutorConfirmed;
  next.flowStatus = bothConfirmed ? "completed" : "awaiting_completion";

  store[bookingId] = next;
  saveStore(store);
  return { enhancement: next, bothConfirmed };
}
