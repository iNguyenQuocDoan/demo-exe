// ─── Enums ────────────────────────────────────────────────────────────────────
export type TeachingMode = "OFFLINE";
export type ProfileStatus =
  | "Draft"
  | "PendingReview"
  | "Approved"
  | "Rejected"
  | "Suspended";
export type BookingType = "NORMAL" | "SERIES_SESSION";
export type BookingStatus =
  | "Pending"
  | "AwaitingPayment"
  | "Confirmed"
  | "InProgress"
  | "Completed"
  | "Cancelled"
  | "Disputed"
  | "Resolved";
export type SeriesStatus =
  | "Draft"
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled";
export type FeeType = "PERCENT" | "FIXED";

// New types for enhanced features
export type TutorApplicationStatus =
  | "Submitted"
  | "Reviewing"
  | "Approved"
  | "Rejected"
  | "ReSubmit";
export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAW"
  | "BOOKING_HOLD"
  | "BOOKING_CHARGE"
  | "REFUND"
  | "TUTOR_PAYOUT"
  | "PLATFORM_FEE";
export type TransactionStatus =
  | "Pending"
  | "Completed"
  | "Failed"
  | "Cancelled";
export type PaymentMethod =
  | "BANK_TRANSFER"
  | "MOMO"
  | "VNPAY"
  | "ZALOPAY"
  | "CASH";
export type RescheduleStatus = "Pending" | "Accepted" | "Rejected";
export type DisputeReason =
  | "TUTOR_NO_SHOW"
  | "PARENT_NO_SHOW"
  | "CONTENT_MISMATCH"
  | "PAYMENT_ISSUE"
  | "BEHAVIOR"
  | "OTHER";
export type DisputeReportStatus = "Pending" | "Reviewing" | "Resolved" | "Dismissed";

export const DISPUTE_REASON_LABELS: Record<DisputeReason, string> = {
  TUTOR_NO_SHOW: "Gia sư không đến dạy",
  PARENT_NO_SHOW: "Phụ huynh/Học sinh không có mặt",
  CONTENT_MISMATCH: "Nội dung dạy không đúng thỏa thuận",
  PAYMENT_ISSUE: "Vấn đề thanh toán / hoàn tiền",
  BEHAVIOR: "Hành vi không phù hợp",
  OTHER: "Lý do khác",
};

export interface DisputeReport {
  id: string;
  bookingId: string;
  /** The person who filed the report */
  reporterId: string;
  reporterRole: "parent" | "tutor";
  reporterName: string;
  /** The person being reported */
  reportedId: string;
  reportedRole: "parent" | "tutor";
  reportedName: string;
  reason: DisputeReason;
  description: string;
  status: DisputeReportStatus;
  adminNote?: string;
  resolvedBy?: string;
  createdAt: string;
  resolvedAt?: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  ok: boolean;
  data: T[];
  pagination: PaginationMeta;
}

// ─── Dictionary ───────────────────────────────────────────────────────────────
export interface City {
  id: string;
  name: string;
}

export interface District {
  id: string;
  cityId: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  grades: string[];
}

// ─── Tutor ────────────────────────────────────────────────────────────────────
export interface ServiceArea {
  cityId: string;
  districtIds: string[];
}

export interface TutorProfile {
  id: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  teachingMode: TeachingMode;
  subjects: string[];
  grades: string[];
  pricePerHour: number;
  profileStatus: ProfileStatus;
  serviceAreas: ServiceArea;
  ratingAvg: number;
  reviewCount: number;
  experience: string;
  education: string;
}

// ─── Availability ─────────────────────────────────────────────────────────────
export interface WeeklySlot {
  id: string;
  dayOfWeek: number; // 1=Mon … 7=Sun
  startTime: string; // "HH:mm"
  endTime: string;
  duration: number; // minutes per session
  maxSessionsPerDay?: number;
  isActive: boolean; // can tutor turn on/off receiving bookings
  isLocked?: boolean; // prevent editing if already published
}

export interface AvailabilityException {
  id: string;
  date: string; // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  type: "BLOCK" | "AVAILABLE_EXTRA";
  reason?: string;
}

export interface TutorAvailability {
  id: string;
  tutorId: string;
  weeklySlots: WeeklySlot[];
  exceptions: AvailabilityException[];
  defaultSessionDuration: number; // minutes
  maxBookingsPerDay: number;
  acceptingBookings: boolean; // global on/off switch
  updatedAt: string;
}

export interface FreeSlot {
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string;
  duration: number;
  tutorId: string;
}

// ─── Booking ──────────────────────────────────────────────────────────────────
export interface Booking {
  id: string;
  type: BookingType;
  parentId: string;
  tutorId: string;
  seriesId?: string;
  startAt: string; // ISO
  endAt: string;
  baseAmount: number;
  platformFee: number;
  totalAmount: number;
  status: BookingStatus;
  cancelBy?: string;
  reason?: string;
  notes?: string;
  // Extended fields (populated by API or mock)
  subject?: string;
  grade?: string;
  studentName?: string;
  teachingMode?: TeachingMode;
  location?: string;
  // Parent intent snapshot (set at booking creation)
  parentGoal?: string;    // required text — why the parent booked
  subjectName?: string;   // snapshot of subject display name (e.g. "Toán")
  goalTags?: string[];    // optional quick-select tags
}

// ─── Series ───────────────────────────────────────────────────────────────────
export interface ScheduleSeries {
  id: string;
  parentId: string;
  tutorId: string;
  pattern: "WEEKLY";
  daysOfWeek: number[];
  startTime: string;
  durationMinutes: number;
  startDate: string;
  occurrenceCount: number;
  status: SeriesStatus;
  baseAmountPerSession: number;
  platformFee: number;
  totalAmount: number;
}

// ─── Fee ──────────────────────────────────────────────────────────────────────
export interface FeeConfig {
  feeType: FeeType;
  feeValue: number;
  whoPays: "PARENT";
  appliesToTrial: boolean;
}

// ─── User / Auth ──────────────────────────────────────────────────────────────
export type UserRole =
  | "guest"
  | "parent"
  | "tutor"
  | "tutorCandidate"
  | "admin";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  address?: string;
  tutorProfileId?: string; // only for role=tutor
  tutorApplicationId?: string; // for tutorCandidate
  walletBalance?: number; // for parent
}

// ─── Filter ───────────────────────────────────────────────────────────────────
export interface TutorFilter {
  cityId: string;
  districtId: string;
  teachingMode: TeachingMode | "ALL";
  subjectId: string;
  minPrice: number;
  maxPrice: number;
  sortBy: "rating" | "price_asc" | "price_desc" | "reviewCount";
}

// ─── Review ───────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  parentId: string;
  tutorId: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: string;
  parentName: string;
  tutorReply?: {
    text: string;
    repliedAt: string;
  };
}

// ─── Tutor Application (Hồ sơ đăng ký gia sư) ────────────────────────────────
export interface TutorApplication {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  idCard: string; // CCCD/ID number
  idCardImages: string[]; // URLs to uploaded images
  education: string;
  degree: string;
  degreeImages: string[]; // Scanned degree certificates
  certificates: string[]; // Other certifications
  certificateImages: string[];
  experience: string;
  subjects: string[];
  grades: string[];
  teachingMode: TeachingMode;
  bio: string;
  pricePerHour: number;
  cityId: string; // e.g. "hcm"
  districtIds: string[]; // e.g. ["q1","binhThanh"]
  status: TutorApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string; // admin ID
  rejectionReason?: string;
  adminNotes?: string;
  resubmissionNotes?: string;
}

// ─── Lesson / Schedule ────────────────────────────────────────────────────────
export interface Lesson {
  id: string;
  bookingId: string;
  tutorId: string;
  parentId: string;
  studentName?: string;
  subject: string;
  grade: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  duration: number; // minutes
  mode: TeachingMode;
  location?: string;
  onlineLink?: string;
  status: BookingStatus;
  amount: number;
  tutorNotes?: string;
  parentNotes?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
}

export interface RescheduleRequest {
  id: string;
  lessonId: string;
  requestedBy: "parent" | "tutor";
  requesterId: string;
  currentDate: string;
  currentStartTime: string;
  proposedDate: string;
  proposedStartTime: string;
  reason: string;
  status: RescheduleStatus;
  respondedAt?: string;
  response?: string;
  createdAt: string;
}

// ─── Wallet & Transactions ───────────────────────────────────────────────────
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: "VND";
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  description: string;
  referenceId?: string; // booking ID, withdrawal ID, etc.
  paymentMethod?: PaymentMethod;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
  failedReason?: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  paymentProof?: string; // URL to uploaded proof
  bankTransferInfo?: {
    bankName: string;
    accountNumber: string;
    transferDate: string;
    transferCode: string;
  };
  approvedBy?: string; // admin ID
  approvedAt?: string;
  rejectedReason?: string;
  createdAt: string;
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  amount: number;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  status: TransactionStatus;
  processedBy?: string; // admin ID
  processedAt?: string;
  rejectedReason?: string;
  createdAt: string;
}

// ─── Booking Hold / Escrow ────────────────────────────────────────────────────
export interface BookingHold {
  id: string;
  bookingId: string;
  walletId: string;
  userId: string;
  amount: number;
  status: "Held" | "Released" | "Charged" | "Refunded";
  heldAt: string;
  releasedAt?: string;
  expiresAt: string;
}

// ─── Calendar Event (Unified view for tutor schedule) ────────────────────────
export interface CalendarEvent {
  id: string;
  type: "booking" | "availability" | "blocked";
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status?: BookingStatus;
  bookingId?: string;
  studentName?: string;
  subject?: string;
  amount?: number;
  location?: string;
  onlineLink?: string;
  canAccept?: boolean;
  canReject?: boolean;
  canReschedule?: boolean;
  canCancel?: boolean;
}
