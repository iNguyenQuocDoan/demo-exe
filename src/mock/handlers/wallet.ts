import { db } from "../db";
import type { DepositRequest, WithdrawRequest } from "@/types";

function currentUserId(): string {
  if (typeof window === "undefined") return "";
  try { return (JSON.parse(localStorage.getItem("auth_user") ?? "{}") as { id?: string }).id ?? ""; }
  catch { return ""; }
}

function uid(): string { return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

export function handleGetWallet() {
  const userId = currentUserId();
  if (!userId) return { status: 401, data: { ok: false, error: "Unauthorized" } };
  const wallet = db.getOrCreateWallet(userId);
  return { status: 200, data: { ok: true, wallet } };
}

export function handleGetTransactions(params: Record<string, string>) {
  const userId = currentUserId();
  if (!userId) return { status: 401, data: { ok: false, error: "Unauthorized" } };
  const limit = Number(params.limit) || 100;
  const txs = db.transactions
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
  return { status: 200, data: { ok: true, transactions: txs } };
}

export function handleCreateDeposit(body: { amount?: number; paymentMethod?: string; paymentProof?: string; bankTransferInfo?: DepositRequest["bankTransferInfo"] }) {
  const userId = currentUserId();
  if (!userId) return { status: 401, data: { ok: false, error: "Unauthorized" } };
  const dep: DepositRequest = {
    id: `dep_${uid()}`, userId, amount: body.amount ?? 0,
    paymentMethod: body.paymentMethod as DepositRequest["paymentMethod"],
    status: "Pending", paymentProof: body.paymentProof,
    bankTransferInfo: body.bankTransferInfo, createdAt: new Date().toISOString(),
  };
  db.deposits.push(dep);
  db.saveDeposits();
  return { status: 201, data: { ok: true, requestId: dep.id } };
}

export function handleApproveDeposit(depositId: string) {
  const dep = db.deposits.find((d) => d.id === depositId);
  if (!dep) return { status: 404, data: { ok: false, error: "Deposit not found" } };
  dep.status = "Completed";
  dep.approvedAt = new Date().toISOString();
  db.saveDeposits();
  db.addTransaction({ walletId: `w_${dep.userId}`, userId: dep.userId, type: "DEPOSIT", amount: dep.amount, balanceBefore: 0, balanceAfter: 0, status: "Completed", description: "Nạp tiền được duyệt", referenceId: depositId, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() });
  return { status: 200, data: { ok: true } };
}

export function handleRejectDeposit(depositId: string, body: { reason?: string }) {
  const dep = db.deposits.find((d) => d.id === depositId);
  if (!dep) return { status: 404, data: { ok: false, error: "Deposit not found" } };
  dep.status = "Failed";
  dep.rejectedReason = body.reason;
  db.saveDeposits();
  return { status: 200, data: { ok: true } };
}

export function handleGetDeposits(params: Record<string, string>) {
  const userId = currentUserId();
  let list = [...db.deposits];
  if (params.userId) list = list.filter((d) => d.userId === params.userId);
  else if (userId) {
    // If not admin, only show own deposits
    const user = db.getUser(userId);
    if (user?.role !== "admin") list = list.filter((d) => d.userId === userId);
  }
  if (params.status) list = list.filter((d) => d.status === params.status);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { status: 200, data: { ok: true, deposits: list } };
}

export function handleCreateWithdraw(body: { amount?: number; bankInfo?: WithdrawRequest["bankInfo"] }) {
  const userId = currentUserId();
  if (!userId) return { status: 401, data: { ok: false, error: "Unauthorized" } };
  const wallet = db.wallets.find((w) => w.userId === userId);
  if (!wallet || wallet.balance < (body.amount ?? 0))
    return { status: 400, data: { ok: false, error: "Số dư không đủ" } };
  const wit: WithdrawRequest = {
    id: `wit_${uid()}`, userId, amount: body.amount ?? 0,
    bankInfo: body.bankInfo ?? { bankName: "", accountNumber: "", accountName: "" },
    status: "Pending", createdAt: new Date().toISOString(),
  };
  db.withdrawals.push(wit);
  db.saveWithdrawals();
  return { status: 201, data: { ok: true, requestId: wit.id } };
}

export function handleProcessWithdraw(withdrawId: string, body: { approved?: boolean; rejectedReason?: string }) {
  const wit = db.withdrawals.find((w) => w.id === withdrawId);
  if (!wit) return { status: 404, data: { ok: false, error: "Withdraw not found" } };
  if (body.approved) {
    wit.status = "Completed";
    wit.processedAt = new Date().toISOString();
    db.addTransaction({ walletId: `w_${wit.userId}`, userId: wit.userId, type: "WITHDRAW", amount: -wit.amount, balanceBefore: 0, balanceAfter: 0, status: "Completed", description: "Rút tiền được duyệt", referenceId: withdrawId, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() });
  } else {
    wit.status = "Failed";
    wit.rejectedReason = body.rejectedReason;
    wit.processedAt = new Date().toISOString();
  }
  db.saveWithdrawals();
  return { status: 200, data: { ok: true } };
}

export function handleGetWithdrawals(params: Record<string, string>) {
  const userId = currentUserId();
  let list = [...db.withdrawals];
  if (params.userId) list = list.filter((w) => w.userId === params.userId);
  else if (userId) {
    const user = db.getUser(userId);
    if (user?.role !== "admin") list = list.filter((w) => w.userId === userId);
  }
  if (params.status) list = list.filter((w) => w.status === params.status);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { status: 200, data: { ok: true, withdrawals: list } };
}
