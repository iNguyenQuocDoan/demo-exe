import { realApiClient } from "@/lib/realApiClient";
import type {
  Wallet,
  Transaction,
  DepositRequest,
  WithdrawRequest,
  BookingHold,
  PaymentMethod,
  TransactionType,
  TransactionStatus,
} from "@/types";


interface BeWalletResponse {
  availableBalance: number;
  frozenBalance: number;
  currency: string;
}

interface BeWalletTransactionResponse {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  relatedEntityId?: string;
  createdAt: string;
}

function getCurrentUserId(): string {
  if (typeof window === "undefined") return "";
  try {
    const u = JSON.parse(localStorage.getItem("auth_user") ?? "null");
    return (u?.id as string) ?? "";
  } catch {
    return "";
  }
}

// BE TransactionType: DEPOSIT, WITHDRAW, PAYMENT, RECEIVE, REFUND, COMMISSION
// → map sang FE TransactionType (giữ nguyên nhãn/icon FE đã có).
function mapTxType(t: string | undefined): TransactionType {
  const v = (t ?? "").toUpperCase();
  if (v.includes("DEPOSIT")) return "DEPOSIT";
  if (v.includes("WITHDRAW")) return "WITHDRAW";
  if (v.includes("REFUND")) return "REFUND";
  // BE "PAYMENT" = phụ huynh trả/giữ học phí (ghi NỢ) → BOOKING_CHARGE
  if (v.includes("PAYMENT")) return "BOOKING_CHARGE";
  if (v.includes("HOLD")) return "BOOKING_HOLD";
  if (v.includes("CHARGE")) return "BOOKING_CHARGE";
  // BE "RECEIVE" = gia sư nhận tiền dạy (ghi CÓ) → TUTOR_PAYOUT
  if (v.includes("RECEIVE")) return "TUTOR_PAYOUT";
  if (v.includes("PAYOUT")) return "TUTOR_PAYOUT";
  // BE "COMMISSION" = phí hoa hồng nền tảng (ghi NỢ) → PLATFORM_FEE
  if (v.includes("COMMISSION")) return "PLATFORM_FEE";
  if (v.includes("FEE")) return "PLATFORM_FEE";
  return "DEPOSIT";
}

function mapTxStatus(s: string | undefined): TransactionStatus {
  const v = (s ?? "").toUpperCase();
  if (v.includes("COMPLET") || v.includes("SUCCESS")) return "Completed";
  if (v.includes("FAIL")) return "Failed";
  if (v.includes("CANCEL")) return "Cancelled";
  return "Pending";
}

export async function getWallet(): Promise<Wallet> {
  const { data } = await realApiClient.get<BeWalletResponse>("/wallet/me");
  const userId = getCurrentUserId();
  const now = new Date().toISOString();
  return {
    id: `wallet-${userId}`,
    userId,
    balance: data.availableBalance ?? 0,
    frozenBalance: data.frozenBalance ?? 0,
    currency: (data.currency as Wallet["currency"]) ?? "VND",
    createdAt: now,
    updatedAt: now,
  };
}

export async function getTransactions(_limit = 100): Promise<Transaction[]> {
  try {
    const { data } = await realApiClient.get<BeWalletTransactionResponse[]>(
      "/wallet/transactions",
    );
    const userId = getCurrentUserId();
    return (data ?? []).map((t) => ({
      id: t.id,
      walletId: `wallet-${userId}`,
      userId,
      type: mapTxType(t.type),
      amount: t.amount,
      balanceBefore: 0,
      balanceAfter: 0,
      status: mapTxStatus(t.status),
      description: t.description ?? "",
      referenceId: t.relatedEntityId,
      createdAt: t.createdAt,
    }));
  } catch {
    return [];
  }
}

// BE: GET /api/wallet/deposit?amount=X → trả URL VNPay (string)
// FE caller cần redirect window.location tới URL này
export async function createDepositRequest(body: {
  userId?: string;
  amount: number;
  paymentMethod?: PaymentMethod;
}): Promise<{ ok: boolean; redirectUrl?: string; requestId?: string; error?: string }> {
  try {
    const { data } = await realApiClient.get<string>("/wallet/deposit", {
      params: { amount: body.amount },
    });
    return { ok: true, redirectUrl: data, requestId: undefined };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Không thể khởi tạo nạp tiền.";
    return { ok: false, error: msg };
  }
}

// BE không hỗ trợ duyệt deposit thủ công (luồng deposit qua VNPay tự động) — stub
export async function approveDeposit(
  _depositId: string,
  _adminId: string,
): Promise<{ ok: boolean; error?: string }> {
  return { ok: false, error: "BE deposit qua VNPay không có duyệt thủ công" };
}

export async function rejectDeposit(
  _depositId: string,
  _adminId: string,
  _reason: string,
): Promise<{ ok: boolean; error?: string }> {
  return { ok: false, error: "BE deposit qua VNPay không có duyệt thủ công" };
}

// BE: POST /api/wallet/withdraw
export async function createWithdrawRequest(input: {
  userId?: string;
  amount: number;
  bankInfo: WithdrawRequest["bankInfo"];
}): Promise<{ ok: boolean; requestId?: string; error?: string }> {
  try {
    await realApiClient.post("/wallet/withdraw", {
      amount: input.amount,
      bankName: input.bankInfo.bankName,
      bankAccountNumber: input.bankInfo.accountNumber,
      bankAccountName: input.bankInfo.accountName,
    });
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Không thể tạo yêu cầu rút tiền.";
    return { ok: false, error: msg };
  }
}

// BE: POST /api/wallet/withdraw/{id}/process
export async function processWithdraw(
  withdrawId: string,
  _adminId: string,
  approved: boolean,
  rejectedReason?: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await realApiClient.post(`/wallet/withdraw/${withdrawId}/process`, {
      approve: approved,
      adminNote: rejectedReason ?? "",
    });
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Không thể xử lý rút tiền.";
    return { ok: false, error: msg };
  }
}

// BE chưa expose list deposit (luồng nạp qua VNPay tự động) — trả mảng rỗng
export async function getDepositRequests(_filter?: {
  userId?: string;
  status?: TransactionStatus;
}): Promise<DepositRequest[]> {
  return [];
}

interface BeWithdrawResponse {
  id: string;
  userId: string;
  userEmail?: string;
  userFullName?: string;
  amount: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  status?: string; // PENDING | APPROVED | REJECTED
  adminNote?: string;
  createdAt: string;
}

interface BePage<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: T[];
}

function mapWithdrawStatus(s: string | undefined): TransactionStatus {
  const v = (s ?? "").toUpperCase();
  if (v === "APPROVED") return "Completed";
  if (v === "REJECTED") return "Failed";
  return "Pending";
}

// BE: GET /api/wallet/withdraw/pending (ADMIN) — chỉ liệt kê yêu cầu rút đang chờ duyệt.
// Các trạng thái khác chưa có endpoint list → trả mảng rỗng.
export async function getWithdrawRequests(filter?: {
  userId?: string;
  status?: TransactionStatus;
}): Promise<WithdrawRequest[]> {
  if (filter?.status && filter.status !== "Pending") return [];
  try {
    const { data } = await realApiClient.get<BePage<BeWithdrawResponse>>(
      "/wallet/withdraw/pending",
      { params: { page: 1, size: 100 } },
    );
    let list: WithdrawRequest[] = (data?.data ?? []).map((w) => ({
      id: String(w.id),
      userId: String(w.userId),
      userName: w.userFullName,
      userEmail: w.userEmail,
      amount: w.amount,
      bankInfo: {
        bankName: w.bankName ?? "",
        accountNumber: w.bankAccountNumber ?? "",
        accountName: w.bankAccountName ?? "",
      },
      status: mapWithdrawStatus(w.status),
      rejectedReason: w.adminNote || undefined,
      createdAt: w.createdAt,
    }));
    if (filter?.userId) list = list.filter((w) => w.userId === filter.userId);
    return list;
  } catch {
    return [];
  }
}

// Escrow holds: BE quản lý nội bộ qua wallet_transactions (BOOKING_HOLD type).
// FE caller dùng các stub này — giữ no-op để không gãy UI.
export async function holdFundsForBooking(): Promise<{ ok: boolean; holdId?: string; error?: string }> {
  return { ok: true };
}
export async function chargeHeldFunds(): Promise<{ ok: boolean; error?: string }> {
  return { ok: true };
}
export async function releaseHeldFunds(): Promise<{ ok: boolean; error?: string }> {
  return { ok: true };
}
export async function getBookingHoldsForUser(): Promise<BookingHold[]> {
  return [];
}
