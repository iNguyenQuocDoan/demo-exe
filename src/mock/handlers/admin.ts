import { db } from "../db";
import type { ReconciliationReport, ReconciliationResult, ScheduledJob } from "@/api/adminApi";

function currentUser(): { id: string; role: string } | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("auth_user") ?? "null") as {
      id: string;
      role: string;
    } | null;
  } catch {
    return null;
  }
}

function requireAdmin() {
  const user = currentUser();
  if (!user) return { status: 401, data: { ok: false, error: "Unauthorized" } };
  if (user.role !== "admin") return { status: 403, data: { ok: false, error: "Forbidden" } };
  return null;
}

function emptyReport(): ReconciliationReport {
  return { timestamp: new Date().toISOString(), fixed: 0, issues: [] };
}

export function handleRunReconciliation() {
  const err = requireAdmin();
  if (err) return err;
  const result: ReconciliationResult = {
    timestamp: new Date().toISOString(),
    reports: {
      autoCancelStalePending: emptyReport(),
      autoCompleteInProgress: emptyReport(),
      releaseExpiredHolds: emptyReport(),
      fixOrphanedHolds: emptyReport(),
      detectOrphanedDeposits: emptyReport(),
      detectMissingPayouts: emptyReport(),
      auditLedgerIntegrity: emptyReport(),
    },
  };
  return { status: 200, data: { ok: true, ...result } };
}

export function handleRunSingleJob(name: string) {
  const err = requireAdmin();
  if (err) return err;
  return { status: 200, data: { ok: true, report: emptyReport() } };
}

export function handleGetFinancialSnapshot() {
  const err = requireAdmin();
  if (err) return err;

  const totalWalletBalance = db.wallets.reduce((sum, w) => sum + (w.balance ?? 0), 0);
  const platformRevenue = db.transactions
    .filter((tx) => tx.type === "PLATFORM_FEE")
    .reduce((sum, tx) => sum + Math.abs(tx.amount ?? 0), 0);
  const activeHoldAmount = db.bookings
    .filter((b) => b.status === "Pending" || b.status === "Confirmed" || b.status === "InProgress")
    .reduce((sum, b) => sum + (b.baseAmount ?? 0), 0);
  const pendingDepositAmount = db.deposits
    .filter((d) => d.status === "Pending")
    .reduce((sum, d) => sum + (d.amount ?? 0), 0);
  const pendingWithdrawalAmount = db.withdrawals
    .filter((w) => w.status === "Pending")
    .reduce((sum, w) => sum + (w.amount ?? 0), 0);

  return {
    status: 200,
    data: {
      ok: true,
      totalWalletBalance,
      activeHoldAmount,
      platformRevenue,
      pendingDepositAmount,
      pendingWithdrawalAmount,
    },
  };
}

export function handleListScheduledJobs() {
  const err = requireAdmin();
  if (err) return err;
  const jobs: ScheduledJob[] = [
    { name: "autoCancelStalePending", intervalMs: 15 * 60 * 1000 },
    { name: "autoCompleteInProgress", intervalMs: 30 * 60 * 1000 },
    { name: "releaseExpiredHolds", intervalMs: 15 * 60 * 1000 },
    { name: "fixOrphanedHolds", intervalMs: 24 * 60 * 60 * 1000 },
    { name: "detectOrphanedDeposits", intervalMs: 24 * 60 * 60 * 1000 },
    { name: "detectMissingPayouts", intervalMs: 24 * 60 * 60 * 1000 },
    { name: "auditLedgerIntegrity", intervalMs: 24 * 60 * 60 * 1000 },
  ];
  return { status: 200, data: { ok: true, jobs } };
}

export function handleTriggerJob(name: string) {
  const err = requireAdmin();
  if (err) return err;
  return { status: 200, data: { ok: true, result: emptyReport() } };
}

export function handleForceCancelBooking(id: string, body: { reason?: string }) {
  const err = requireAdmin();
  if (err) return err;

  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) return { status: 404, data: { ok: false, error: "Không tìm thấy booking." } };
  if (booking.status === "Cancelled" || booking.status === "Completed")
    return { status: 400, data: { ok: false, error: "Booking không thể hủy." } };

  const refund = booking.baseAmount ?? 0;
  if (refund > 0) {
    const parentWallet = db.getOrCreateWallet(booking.parentId);
    db.addTransaction({
      walletId: parentWallet.id,
      userId: booking.parentId,
      type: "REFUND",
      amount: refund,
      status: "Completed",
      description: body.reason || `Admin hủy buổi học #${id}`,
      referenceId: id,
      balanceBefore: 0,
      balanceAfter: 0,
      createdAt: new Date().toISOString(),
    });
  }

  booking.status = "Cancelled";
  db.saveBookings();
  return { status: 200, data: { ok: true } };
}

export function handleForceCompleteBooking(id: string) {
  const err = requireAdmin();
  if (err) return err;

  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) return { status: 404, data: { ok: false, error: "Không tìm thấy booking." } };
  if (booking.status === "Completed")
    return { status: 400, data: { ok: false, error: "Booking đã hoàn thành." } };

  const base = booking.baseAmount ?? 0;
  const feeRate = (db.feeConfig?.feeValue ?? 10) / 100;
  const platformFee = Math.round(base * feeRate);
  const payout = base - platformFee;

  const tutorUser = db.rawUsers.find((u) => u.tutorProfileId === booking.tutorId);
  if (tutorUser) {
    const tutorWallet = db.getOrCreateWallet(tutorUser.id);
    db.addTransaction({
      walletId: tutorWallet.id,
      userId: tutorUser.id,
      type: "TUTOR_PAYOUT",
      amount: payout,
      status: "Completed",
      description: `Admin hoàn thành buổi học #${id}`,
      referenceId: id,
      balanceBefore: 0,
      balanceAfter: 0,
      createdAt: new Date().toISOString(),
    });
  }

  booking.status = "Completed";
  db.saveBookings();
  return { status: 200, data: { ok: true } };
}

export function handlePreBanCheck(userId: string) {
  const err = requireAdmin();
  if (err) return err;

  const active = db.bookings.filter(
    (b) =>
      (b.parentId === userId ||
        db.rawUsers.find((u) => u.id === userId)?.tutorProfileId === b.tutorId) &&
      (b.status === "Pending" || b.status === "Confirmed" || b.status === "InProgress"),
  );

  return {
    status: 200,
    data: {
      ok: true,
      activeBookingCount: active.length,
      bookings: active.map((b) => ({
        id: b.id,
        status: b.status,
        startAt: b.startAt,
        baseAmount: b.baseAmount,
      })),
    },
  };
}
