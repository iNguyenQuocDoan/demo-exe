/**
 * Mock in-memory database.
 * Reads from JSON seed files on first load, syncs to localStorage for persistence.
 */

import type {
  TutorProfile,
  TutorAvailability,
  Booking,
  ScheduleSeries,
  FeeConfig,
  City,
  District,
  Subject,
  Review,
  User,
  UserRole,
  Wallet,
  Transaction,
  DepositRequest,
  WithdrawRequest,
  TutorApplication,
  DisputeReport,
} from "@/types";
import type {
  EnhancedBooking,
  StudyPlan,
  Conversation,
} from "@/types/booking-enhanced";

import tutorsJson from "./data/tutors.json";
import availabilityJson from "./data/availability.json";
import bookingsJson from "./data/bookings.json";
import seriesJson from "./data/series.json";
import feeConfigJson from "./data/feeConfig.json";
import citiesJson from "./data/cities.json";
import districtsJson from "./data/districts.json";
import subjectsJson from "./data/subjects.json";
import reviewsJson from "./data/reviews.json";
import usersJson from "./data/users.json";
import enhancedBookingsJson from "./data/enhanced-bookings.json";
import studyPlansJson from "./data/study-plans.json";
import conversationsJson from "./data/conversations.json";

const STORAGE_KEY = "tutor_mock_db_v5";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed[key] ?? fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[key] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // ignore
  }
}

// ─── Seed data ─────────────────────────────────────────────────────────────────

export type MockUser = User & { password: string };

const SEED_USERS: MockUser[] = [
  ...(usersJson as MockUser[]),
  {
    id: "u_cand1",
    fullName: "Trần Văn Bình",
    email: "candidate@demo.vn",
    password: "demo123",
    role: "tutorCandidate" as UserRole,
    tutorApplicationId: "app1",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=u_cand1",
  },
];

const SEED_WALLETS: Wallet[] = [
  // p1: nạp 3M → đặt b1(-270K), b2(-270K), b4(-270K), hủy b4(+270K), b3(-330K) → còn 2,130,000
  {
    id: "w_p1",
    userId: "p1",
    balance: 2_130_000,
    currency: "VND",
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-03-12T00:00:00Z",
  },
  // tu1: nhận 243K từ b1 hoàn thành (270K - 10% phí nền tảng)
  {
    id: "w_tu1",
    userId: "tu1",
    balance: 243_000,
    currency: "VND",
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-03-03T00:00:00Z",
  },
  {
    id: "w_a1",
    userId: "a1",
    balance: 0,
    currency: "VND",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

const SEED_TRANSACTIONS: Transaction[] = [
  // p1 nạp tiền lần đầu (được admin duyệt)
  {
    id: "tx1",
    walletId: "w_p1",
    userId: "p1",
    type: "DEPOSIT",
    amount: 3_000_000,
    balanceBefore: 0,
    balanceAfter: 3_000_000,
    status: "Completed",
    description: "Nạp tiền qua ngân hàng",
    paymentMethod: "BANK_TRANSFER",
    createdAt: "2026-01-15T10:00:00Z",
    completedAt: "2026-01-15T10:30:00Z",
  },
  // b1: tạo booking → giữ tiền (Pending → Confirmed → Completed)
  {
    id: "tx2",
    walletId: "w_p1",
    userId: "p1",
    type: "BOOKING_HOLD",
    amount: -270_000,
    balanceBefore: 3_000_000,
    balanceAfter: 2_730_000,
    status: "Completed",
    description: "Giữ tiền - buổi học Toán với Nguyễn Văn An",
    referenceId: "b1",
    createdAt: "2026-03-01T09:00:00Z",
    completedAt: "2026-03-01T09:00:00Z",
  },
  // b1: hoàn thành → trả gia sư 243K (270K - 10% phí nền tảng 27K)
  {
    id: "tx3",
    walletId: "w_tu1",
    userId: "tu1",
    type: "TUTOR_PAYOUT",
    amount: 243_000,
    balanceBefore: 0,
    balanceAfter: 243_000,
    status: "Completed",
    description: "Thanh toán gia sư - buổi học hoàn thành",
    referenceId: "b1",
    createdAt: "2026-03-03T20:35:00Z",
    completedAt: "2026-03-03T20:35:00Z",
  },
  // b4: tạo booking → giữ tiền (Pending → Cancelled → hoàn tiền)
  {
    id: "tx4",
    walletId: "w_p1",
    userId: "p1",
    type: "BOOKING_HOLD",
    amount: -270_000,
    balanceBefore: 2_730_000,
    balanceAfter: 2_460_000,
    status: "Completed",
    description: "Giữ tiền - buổi học Toán (đã hủy)",
    referenceId: "b4",
    createdAt: "2026-02-20T08:00:00Z",
    completedAt: "2026-02-20T08:00:00Z",
  },
  {
    id: "tx5",
    walletId: "w_p1",
    userId: "p1",
    type: "REFUND",
    amount: 270_000,
    balanceBefore: 2_460_000,
    balanceAfter: 2_730_000,
    status: "Completed",
    description: "Hoàn tiền - hủy buổi học Toán",
    referenceId: "b4",
    createdAt: "2026-02-25T10:00:00Z",
    completedAt: "2026-02-25T10:00:00Z",
  },
  // b2: tạo booking → giữ tiền (Confirmed - sắp diễn ra)
  {
    id: "tx6",
    walletId: "w_p1",
    userId: "p1",
    type: "BOOKING_HOLD",
    amount: -270_000,
    balanceBefore: 2_730_000,
    balanceAfter: 2_460_000,
    status: "Completed",
    description: "Giữ tiền - buổi học Toán với Nguyễn Văn An",
    referenceId: "b2",
    createdAt: "2026-03-05T11:00:00Z",
    completedAt: "2026-03-05T11:00:00Z",
  },
  // b3: tạo booking → giữ tiền (Pending - chờ gia sư xác nhận)
  {
    id: "tx7",
    walletId: "w_p1",
    userId: "p1",
    type: "BOOKING_HOLD",
    amount: -330_000,
    balanceBefore: 2_460_000,
    balanceAfter: 2_130_000,
    status: "Completed",
    description: "Giữ tiền - buổi học Tiếng Anh",
    referenceId: "b3",
    createdAt: "2026-03-10T14:00:00Z",
    completedAt: "2026-03-10T14:00:00Z",
  },
];

const SEED_DEPOSITS: DepositRequest[] = [
  // Lịch sử: đã được duyệt (tạo ra tx1)
  {
    id: "dep1",
    userId: "p1",
    amount: 3_000_000,
    paymentMethod: "BANK_TRANSFER",
    status: "Completed",
    createdAt: "2026-01-15T09:00:00Z",
    approvedAt: "2026-01-15T10:30:00Z",
  },
  // Đang chờ admin duyệt
  {
    id: "dep2",
    userId: "p1",
    amount: 500_000,
    paymentMethod: "MOMO",
    status: "Pending",
    createdAt: "2026-03-11T08:00:00Z",
  },
];

const SEED_WITHDRAWALS: WithdrawRequest[] = [
  // Gia sư muốn rút tiền sau khi hoàn thành dạy
  {
    id: "wit1",
    userId: "tu1",
    amount: 200_000,
    bankInfo: {
      bankName: "Vietcombank",
      accountNumber: "1234567890",
      accountName: "NGUYEN VAN AN",
    },
    status: "Pending",
    createdAt: "2026-03-05T22:00:00Z",
  },
];

const SEED_APPLICATIONS: TutorApplication[] = [
  {
    id: "app1",
    userId: "u_cand1",
    fullName: "Trần Văn Bình",
    email: "candidate@demo.vn",
    phone: "0912345678",
    idCard: "012345678901",
    idCardImages: [
      "https://placehold.co/640x400/0d2458/ffffff?text=CCCD+Mat+Truoc&font=roboto",
      "https://placehold.co/640x400/0d2458/ffffff?text=CCCD+Mat+Sau&font=roboto",
    ],
    education: "Đại học Sư phạm Hà Nội",
    degree: "Cử nhân Sư phạm Toán",
    degreeImages: ["https://placehold.co/595x842/f5f0e6/3d2b00?text=Bang+Tot+Nghiep+Dai+Hoc+Su+Pham&font=roboto"],
    certificates: ["Chứng chỉ Nghiệp vụ Sư phạm", "IELTS 6.5"],
    certificateImages: [
      "https://placehold.co/595x842/f5f0e6/3d2b00?text=Chung+Chi+Nghiep+Vu+Su+Pham&font=roboto",
      "https://placehold.co/595x842/f5f0e6/1a3a6e?text=IELTS+Certificate+6.5&font=roboto",
    ],
    experience: "3 năm gia sư Toán THPT",
    subjects: ["math", "physics"],
    grades: ["Lớp 10", "Lớp 11", "Lớp 12"],
    teachingMode: "OFFLINE",
    bio: "Tôi là giáo viên Toán nhiều kinh nghiệm, phương pháp dạy dễ hiểu.",
    pricePerHour: 150_000,
    cityId: "hn",
    districtIds: ["hk", "dd"],
    status: "Submitted",
    submittedAt: "2026-02-25T10:00:00Z",
  },
  {
    id: "app2",
    userId: "sv1",
    fullName: "Trần Minh Khoa",
    email: "student@demo.vn",
    phone: "0987654321",
    idCard: "079304012345",
    idCardImages: [
      "https://placehold.co/640x400/0d2458/ffffff?text=CCCD+Mat+Truoc&font=roboto",
      "https://placehold.co/640x400/0d2458/ffffff?text=CCCD+Mat+Sau&font=roboto",
    ],
    education: "Đại học Bách Khoa TP.HCM — Khoa Khoa học Máy tính, năm 3",
    degree: "Đang học Đại học năm 3",
    degreeImages: ["https://placehold.co/595x842/f5f0e6/3d2b00?text=Bang+Diem+Sinh+Vien+HCMUT&font=roboto"],
    certificates: ["IELTS 6.0"],
    certificateImages: ["https://placehold.co/595x842/f5f0e6/1a3a6e?text=IELTS+Certificate+6.0&font=roboto"],
    experience: "Mới bắt đầu — từng kèm em họ và bạn cùng lớp môn Toán, Tin học",
    subjects: ["math", "informatics"],
    grades: ["Lớp 9", "Lớp 10", "Lớp 11", "Luyện thi Đại học"],
    teachingMode: "OFFLINE",
    bio: "Mình là sinh viên năm 3 ĐH Bách Khoa, chuyên ngành KHMT. Đã kèm em họ và 2 bạn trong xóm môn Toán và Tin học suốt 2 năm. Mình kiên nhẫn, hay giải thích bằng ví dụ thực tế và code minh họa — học sinh thấy dễ hiểu hơn nhiều so với sách giáo khoa.",
    pricePerHour: 100_000,
    cityId: "hcm",
    districtIds: ["q1", "q3", "q10", "binh_thanh"],
    status: "Submitted",
    submittedAt: "2026-03-01T09:30:00Z",
  },
];

const SEED_REPORTS: DisputeReport[] = [
  {
    id: "rep1",
    bookingId: "b1",
    reporterId: "p1",
    reporterRole: "parent",
    reporterName: "Phụ Huynh Demo",
    reportedId: "tu1",
    reportedRole: "tutor",
    reportedName: "Nguyễn Văn An",
    reason: "CONTENT_MISMATCH",
    description: "Buổi học hôm qua gia sư dạy không đúng nội dung đã thỏa thuận trước. Thay vì ôn hình học không gian, gia sư chỉ giải bài tập đại số thông thường.",
    status: "Reviewing",
    adminNote: "Đang liên hệ gia sư để xác minh.",
    createdAt: "2026-03-03T21:00:00Z",
  },
  {
    id: "rep2",
    bookingId: "b2",
    reporterId: "tu1",
    reporterRole: "tutor",
    reporterName: "Nguyễn Văn An",
    reportedId: "p1",
    reportedRole: "parent",
    reportedName: "Phụ Huynh Demo",
    reason: "PARENT_NO_SHOW",
    description: "Tôi đã đến đúng giờ nhưng học sinh không có nhà. Phụ huynh không báo trước và không trả lời điện thoại trong 30 phút.",
    status: "Pending",
    createdAt: "2026-03-10T20:30:00Z",
  },
];

// ─── Singleton DB ─────────────────────────────────────────────────────────────
class MockDB {
  tutors: TutorProfile[] = tutorsJson as TutorProfile[];
  availability: TutorAvailability[] = availabilityJson as unknown as TutorAvailability[];
  cities: City[] = citiesJson as City[];
  districts: District[] = districtsJson as District[];
  subjects: Subject[] = subjectsJson as Subject[];
  feeConfig: FeeConfig = feeConfigJson as FeeConfig;
  reviews: Review[] = reviewsJson as Review[];

  bookings: Booking[] = [];
  series: ScheduleSeries[] = [];

  rawUsers: MockUser[] = [...SEED_USERS];
  wallets: Wallet[] = [];
  transactions: Transaction[] = [];
  deposits: DepositRequest[] = [];
  withdrawals: WithdrawRequest[] = [];
  applications: TutorApplication[] = [];

  reports: DisputeReport[] = [];

  // Enhanced features
  enhancedBookings: EnhancedBooking[] = [];
  studyPlans: StudyPlan[] = [];
  conversations: Conversation[] = [];

  private initialized = false;

  init() {
    if (this.initialized) return;
    this.bookings = loadFromStorage("bookings", bookingsJson as Booking[]);
    this.series = loadFromStorage("series", seriesJson as ScheduleSeries[]);
    this.wallets = loadFromStorage("wallets", SEED_WALLETS);
    this.transactions = loadFromStorage("transactions", SEED_TRANSACTIONS);
    this.deposits = loadFromStorage("deposits", SEED_DEPOSITS);
    this.withdrawals = loadFromStorage("withdrawals", SEED_WITHDRAWALS);
    this.applications = loadFromStorage("applications", SEED_APPLICATIONS);
    this.reports = loadFromStorage("reports", SEED_REPORTS);
    this.enhancedBookings = loadFromStorage(
      "enhancedBookings",
      enhancedBookingsJson as EnhancedBooking[],
    );
    this.studyPlans = loadFromStorage(
      "studyPlans",
      studyPlansJson as StudyPlan[],
    );
    this.conversations = loadFromStorage(
      "conversations",
      conversationsJson as Conversation[],
    );
    // Ensure every weekly slot and exception has an id (seed JSON may omit them)
    this.availability = this.availability.map((avail, ai) => ({
      ...avail,
      id: avail.id ?? `av_${avail.tutorId}`,
      acceptingBookings: avail.acceptingBookings ?? true,
      defaultSessionDuration: avail.defaultSessionDuration ?? 90,
      maxBookingsPerDay: avail.maxBookingsPerDay ?? 4,
      updatedAt: avail.updatedAt ?? new Date().toISOString(),
      weeklySlots: avail.weeklySlots.map((s, si) => ({
        ...s,
        id: s.id ?? `slot_${ai}_${si}`,
        duration: s.duration ?? 90,
        isActive: s.isActive ?? true,
      })),
      exceptions: avail.exceptions.map((e, ei) => ({
        ...e,
        id: e.id ?? `ex_${ai}_${ei}`,
      })),
    }));
    this.initialized = true;
  }

  saveBookings() {
    saveToStorage("bookings", this.bookings);
  }
  saveSeries() {
    saveToStorage("series", this.series);
  }
  saveWallets() {
    saveToStorage("wallets", this.wallets);
  }
  saveTransactions() {
    saveToStorage("transactions", this.transactions);
  }
  saveEnhancedBookings() {
    saveToStorage("enhancedBookings", this.enhancedBookings);
  }
  saveStudyPlans() {
    saveToStorage("studyPlans", this.studyPlans);
  }
  saveConversations() {
    saveToStorage("conversations", this.conversations);
  }
  saveDeposits() {
    saveToStorage("deposits", this.deposits);
  }
  saveWithdrawals() {
    saveToStorage("withdrawals", this.withdrawals);
  }
  saveApplications() {
    saveToStorage("applications", this.applications);
  }
  saveReports() {
    saveToStorage("reports", this.reports);
  }

  resetToSeed() {
    this.bookings = bookingsJson as Booking[];
    this.series = [];
    this.wallets = [...SEED_WALLETS];
    this.transactions = [...SEED_TRANSACTIONS];
    this.deposits = [...SEED_DEPOSITS];
    this.enhancedBookings = enhancedBookingsJson as EnhancedBooking[];
    this.studyPlans = studyPlansJson as StudyPlan[];
    this.conversations = conversationsJson as Conversation[];
    this.saveBookings();
    this.saveSeries();
    this.saveWallets();
    this.saveTransactions();
    this.saveDeposits();
    this.saveWithdrawals();
    this.saveApplications();
    this.saveEnhancedBookings();
    this.saveStudyPlans();
    this.saveConversations();
    this.saveDeposits();
    this.saveWithdrawals();
    this.saveApplications();
  }

  getOrCreateWallet(userId: string): Wallet {
    let wallet = this.wallets.find((w) => w.userId === userId);
    if (!wallet) {
      wallet = {
        id: `w_${userId}`,
        userId,
        balance: 0,
        currency: "VND",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.wallets.push(wallet);
      this.saveWallets();
    }
    return wallet;
  }

  addTransaction(tx: Omit<Transaction, "id">): Transaction {
    const wallet = this.wallets.find((w) => w.userId === tx.userId);
    const before = wallet?.balance ?? 0;
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}`,
      balanceBefore: before,
      balanceAfter: before + tx.amount,
    };
    this.transactions.push(newTx);
    this.saveTransactions();
    if (wallet) {
      wallet.balance += tx.amount;
      wallet.updatedAt = new Date().toISOString();
      this.saveWallets();
    }
    return newTx;
  }

  getUser(userId: string): User | undefined {
    const u = this.rawUsers.find((u) => u.id === userId);
    if (!u) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...user } = u;
    return user as User;
  }

  getUsers(): User[] {
    return this.rawUsers.map((u) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _pw, ...user } = u;
      return user as User;
    });
  }
}

export const db = new MockDB();

// Call init on module load (client-side only)
if (typeof window !== "undefined") {
  db.init();
}
