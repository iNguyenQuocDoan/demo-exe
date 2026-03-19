import { apiClient } from "@/lib/apiClient";
import type {
  Wallet,
  Transaction,
  DepositRequest,
  WithdrawRequest,
  BookingHold,
  PaymentMethod,
  TransactionStatus,
} from "@/types";

export async function getWallet(): Promise<Wallet> {
  const { data } = await apiClient.get<{ ok: boolean; wallet: Wallet }>("/wallet/me");
  return data.wallet;
}

export async function getTransactions(limit = 100): Promise<Transaction[]> {
  const { data } = await apiClient.get<{ ok: boolean; transactions: Transaction[] }>(
    "/wallet/transactions",
    { params: { limit } }
  );
  return data.transactions;
}

export async function createDepositRequest(body: {
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentProof?: string;
  bankTransferInfo?: DepositRequest["bankTransferInfo"];
}): Promise<{ ok: boolean; requestId?: string; error?: string }> {
  try {
    const { data } = await apiClient.post<{ ok: boolean; requestId: string }>("/wallet/deposit", body);
    return { ok: true, requestId: data.requestId };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
      "Không thể tạo yêu cầu nạp tiền.";
    return { ok: false, error: msg };
  }
}

export async function approveDeposit(
  depositId: string,
  _adminId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.put(`/wallet/deposit/${depositId}/approve`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Không thể duyệt nạp tiền." };
  }
}

export async function rejectDeposit(
  depositId: string,
  _adminId: string,
  reason: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.put(`/wallet/deposit/${depositId}/reject`, { reason });
    return { ok: true };
  } catch {
    return { ok: false, error: "Không thể từ chối yêu cầu." };
  }
}

export async function createWithdrawRequest(data: {
  userId: string;
  amount: number;
  bankInfo: WithdrawRequest["bankInfo"];
}): Promise<{ ok: boolean; requestId?: string; error?: string }> {
  try {
    const { data: res } = await apiClient.post<{ ok: boolean; requestId: string }>("/wallet/withdraw", data);
    return { ok: true, requestId: res.requestId };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
      "Không thể tạo yêu cầu rút tiền.";
    return { ok: false, error: msg };
  }
}

export async function processWithdraw(
  withdrawId: string,
  _adminId: string,
  approved: boolean,
  rejectedReason?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.put(`/wallet/withdraw/${withdrawId}/process`, { approved, rejectedReason });
    return { ok: true };
  } catch {
    return { ok: false, error: "Không thể xử lý rút tiền." };
  }
}

export async function getDepositRequests(filter?: {
  userId?: string;
  status?: TransactionStatus;
}): Promise<DepositRequest[]> {
  const params: Record<string, string> = {};
  if (filter?.status) params.status = filter.status;
  const { data } = await apiClient.get<{ ok: boolean; deposits: DepositRequest[] }>(
    "/wallet/deposits",
    { params }
  );
  return data.deposits;
}

export async function getWithdrawRequests(filter?: {
  userId?: string;
  status?: TransactionStatus;
}): Promise<WithdrawRequest[]> {
  const params: Record<string, string> = {};
  if (filter?.status) params.status = filter.status;
  const { data } = await apiClient.get<{ ok: boolean; withdrawals: WithdrawRequest[] }>(
    "/wallet/withdrawals",
    { params }
  );
  return data.withdrawals;
}

// Stubs kept for type compatibility — held escrow is managed server-side
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
