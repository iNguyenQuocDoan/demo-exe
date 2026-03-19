/**
 * Enhanced Booking Types for Post-Booking Features
 * Includes privacy controls, study plans, and contact ownership
 */

import type { Booking, BookingStatus, TeachingMode } from "./index";

// ─── Extended Booking Status ──────────────────────────────────────────────────
export type EnhancedBookingStatus =
  | BookingStatus
  | "TutorPreparingPlan"
  | "PlanSent"
  | "InSession";

// ─── Contact Methods ──────────────────────────────────────────────────────────
export type ContactMethod = "IN_APP_CHAT" | "PHONE" | "ZALO" | "EMAIL";

export interface ContactPreference {
  method: ContactMethod;
  priority: number; // 1 = primary, 2 = secondary, etc.
  value?: string; // phone number, email, zalo ID
  isVisible: boolean; // controlled by booking confirmation status
}

// ─── Learning Preferences (Parent Input) ──────────────────────────────────────
export type LearningGoal =
  | "IMPROVE_GRADES"
  | "EXAM_PREP"
  | "CATCH_UP"
  | "ENRICHMENT"
  | "COMPETITION_PREP"
  | "HOMEWORK_HELP";

export type SessionType = "ONE_ON_ONE" | "GROUP" | "FLEXIBLE";
export type StudentLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface LearningPreferences {
  teachingMode: TeachingMode; // OFFLINE only
  sessionType: SessionType;
  studentLevel?: StudentLevel;
  goals: LearningGoal[];
  preferredSchedule?: {
    daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
    timeSlots: string[]; // ["morning", "afternoon", "evening"]
  };
  frequency?: string; // "1x/week", "2x/week", "flexible"
  specialNeeds?: string;
  notes?: string;
}

// ─── Completion Confirmation ──────────────────────────────────────────────────
export interface CompletionConfirmation {
  parentConfirmed: boolean;
  tutorConfirmed: boolean;
  parentConfirmedAt?: string;
  tutorConfirmedAt?: string;
}

// ─── Location & Privacy ───────────────────────────────────────────────────────
export interface LocationInfo {
  // Before confirmation: only general area
  district?: string;
  city?: string;

  // After confirmation: full details
  fullAddress?: string;
  meetingLink?: string; // for online sessions
  meetingPlatform?: "ZOOM" | "GOOGLE_MEET" | "TEAMS" | "OTHER";
  landmark?: string;
  travelTimeEstimate?: number; // minutes
}

// ─── Study Plan ───────────────────────────────────────────────────────────────
export interface WeekPlan {
  weekNumber: number;
  topics: string[];
  objectives: string[];
  materials?: string[];
  homework?: string[];
  assessmentMethod?: string;
}

export interface StudyPlan {
  id: string;
  bookingId: string;
  tutorId: string;
  createdAt: string;
  updatedAt: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REVISION_REQUESTED";

  overview: string;
  duration: string; // "4 weeks", "8 sessions"
  weeklyPlans: WeekPlan[];

  suggestedSchedule?: {
    sessions: Array<{
      date: string;
      startTime: string;
      endTime: string;
      topic: string;
    }>;
  };

  materialsNeeded?: string[];
  parentNotes?: string; // feedback from parent
  tutorNotes?: string;
}

// ─── Contact Ownership (Who's handling this conversation) ─────────────────────
export type ContactOwnerRole = "TUTOR" | "SUPPORT_STAFF" | "ADMIN";

export interface ContactOwner {
  userId: string;
  name: string;
  role: ContactOwnerRole;
  avatarUrl?: string;
  assignedAt: string;
}

export interface ContactOwnerChange {
  id: string;
  bookingId: string;
  from: ContactOwner | null; // null if first assignment
  to: ContactOwner;
  reason?: string;
  changedAt: string;
  changedBy: string;
}

// ─── Enhanced Booking ─────────────────────────────────────────────────────────
export interface EnhancedBooking extends Omit<Booking, "status"> {
  status: EnhancedBookingStatus;

  // Learning preferences (filled by parent during booking)
  learningPreferences?: LearningPreferences;

  // Contact preferences (filled by parent during booking)
  contactPreferences: ContactPreference[];

  // Location (privacy-aware)
  locationInfo: LocationInfo;

  // Study plan (created by tutor after confirmation)
  studyPlanId?: string;

  // Contact ownership tracking
  currentContactOwner?: ContactOwner;
  contactOwnerHistory: ContactOwnerChange[];

  // Privacy flag
  isConfirmedByTutor: boolean;

  // Timeline
  confirmedAt?: string;
  planSentAt?: string;
  planAcceptedAt?: string;
  sessionStartedAt?: string;
  completedAt?: string;
}

// ─── Chat/Conversation Enhancement ───────────────────────────────────────────
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: ContactOwnerRole | "PARENT";
  content: string;
  createdAt: string;
  // System messages for contact owner changes
  type?: "USER" | "SYSTEM";
  metadata?: {
    contactOwnerChange?: ContactOwnerChange;
  };
}

export interface Conversation {
  id: string;
  bookingId: string;
  parentId: string;
  tutorId: string;
  currentContactOwner?: ContactOwner;
  messages: Message[];
  lastMessageAt?: string;
  createdAt: string;
}

// ─── UI Copy (Bilingual) ──────────────────────────────────────────────────────
export const BOOKING_STATUS_LABELS = {
  // Original statuses
  Pending: { vi: "Chờ xác nhận", en: "Pending Confirmation" },
  AwaitingPayment: { vi: "Chờ thanh toán", en: "Awaiting Payment" },
  Confirmed: { vi: "Đã xác nhận", en: "Confirmed" },
  InProgress: { vi: "Đang diễn ra", en: "In Progress" },
  Completed: { vi: "Đã hoàn thành", en: "Completed" },
  Cancelled: { vi: "Đã hủy", en: "Cancelled" },
  Disputed: { vi: "Tranh chấp", en: "Disputed" },
  Resolved: { vi: "Đã giải quyết", en: "Resolved" },
  // Enhanced statuses
  TutorPreparingPlan: {
    vi: "Gia sư đang chuẩn bị kế hoạch",
    en: "Tutor Preparing Plan",
  },
  PlanSent: { vi: "Đã gửi kế hoạch học", en: "Plan Sent" },
  InSession: { vi: "Đang học", en: "In Session" },
} as const;

export const CONTACT_METHOD_LABELS = {
  IN_APP_CHAT: { vi: "Chat trong ứng dụng", en: "In-app Chat", icon: "💬" },
  PHONE: { vi: "Điện thoại", en: "Phone", icon: "📞" },
  ZALO: { vi: "Zalo", en: "Zalo", icon: "💙" },
  EMAIL: { vi: "Email", en: "Email", icon: "✉️" },
} as const;

export const LEARNING_GOAL_LABELS = {
  IMPROVE_GRADES: { vi: "Cải thiện điểm số", en: "Improve Grades" },
  EXAM_PREP: { vi: "Ôn thi", en: "Exam Preparation" },
  CATCH_UP: { vi: "Học bù", en: "Catch Up" },
  ENRICHMENT: { vi: "Nâng cao", en: "Enrichment" },
  COMPETITION_PREP: { vi: "Ôn thi HSG/Olympic", en: "Competition Prep" },
  HOMEWORK_HELP: { vi: "Hỗ trợ bài tập", en: "Homework Help" },
} as const;

export const UI_COPY = {
  // CTAs
  confirmBooking: { vi: "Xác nhận buổi học", en: "Confirm Booking" },
  createPlan: { vi: "Tạo kế hoạch học", en: "Create Study Plan" },
  editPlan: { vi: "Chỉnh sửa kế hoạch", en: "Edit Plan" },
  viewPlan: { vi: "Xem kế hoạch học", en: "View Study Plan" },
  sendPlan: { vi: "Gửi kế hoạch cho phụ huynh", en: "Send Plan to Parent" },
  acceptPlan: { vi: "Chấp nhận kế hoạch", en: "Accept Plan" },
  requestRevision: { vi: "Yêu cầu chỉnh sửa", en: "Request Revision" },
  openChat: { vi: "Mở chat", en: "Open Chat" },

  // Section headers
  parentPreferences: { vi: "Yêu cầu từ phụ huynh", en: "Parent Preferences" },
  contactMethod: { vi: "Phương thức liên lạc", en: "Contact Method" },
  location: { vi: "Địa điểm học", en: "Learning Location" },
  learningGoals: { vi: "Mục tiêu học tập", en: "Learning Goals" },
  studyPlan: { vi: "Kế hoạch học tập", en: "Study Plan" },
  timeline: { vi: "Tiến trình", en: "Timeline" },

  // Privacy notices
  privacyNotice: {
    vi: "Thông tin chi tiết sẽ được hiển thị sau khi bạn xác nhận buổi học",
    en: "Detailed information will be shown after you confirm the booking",
  },
  generalAreaOnly: {
    vi: "Khu vực chung",
    en: "General area only",
  },

  // Contact owner
  chattingWith: { vi: "Bạn đang chat với", en: "You're chatting with" },
  contactOwnerChanged: {
    vi: "Người phụ trách đã thay đổi",
    en: "Contact owner changed",
  },

  // Empty states
  noPlanYet: {
    vi: "Gia sư chưa tạo kế hoạch học. Kế hoạch sẽ có sẵn sau khi gia sư xác nhận.",
    en: "No study plan yet. The plan will be available after tutor confirmation.",
  },
  noMessages: {
    vi: "Chưa có tin nhắn nào. Gửi tin nhắn để bắt đầu trò chuyện!",
    en: "No messages yet. Send a message to start the conversation!",
  },
} as const;
