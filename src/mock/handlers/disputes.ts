import { db } from "../db";
import type { DisputeReport, DisputeResolution } from "@/types";

function currentUser(): { id: string; fullName: string; role: string } | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("auth_user") ?? "null") as {
      id: string;
      fullName: string;
      role: string;
    } | null;
  } catch {
    return null;
  }
}

export function handleGetDisputesByBooking(bookingId: string) {
  const list = db.reports
    .filter((r) => r.bookingId === bookingId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { status: 200, data: { ok: true, disputes: list } };
}

export function handleResolveDispute(
  id: string,
  body: {
    resolution?: DisputeResolution;
    adminNote?: string;
    refundAmount?: number;
  },
) {
  const user = currentUser();
  if (!user || user.role !== "admin")
    return { status: 403, data: { ok: false, error: "Chỉ admin mới có thể xử lý khiếu nại." } };

  const idx = db.reports.findIndex((r) => r.id === id);
  if (idx === -1) return { status: 404, data: { ok: false, error: "Không tìm thấy khiếu nại." } };
  if (!body.resolution)
    return { status: 400, data: { ok: false, error: "Vui lòng chọn phương án xử lý." } };

  const report = db.reports[idx];
  const updated: DisputeReport = {
    ...report,
    status: "Resolved",
    resolution: body.resolution,
    refundAmount: body.refundAmount,
    adminNote: body.adminNote ?? report.adminNote,
    adminId: user.id,
    resolvedBy: user.fullName,
    resolvedAt: new Date().toISOString(),
  };

  // Apply side-effects on linked booking when a refund is involved
  const booking = db.bookings.find((b) => b.id === report.bookingId);
  if (booking && (body.resolution === "FULL_REFUND" || body.resolution === "PARTIAL_REFUND")) {
    const refundAmount =
      body.resolution === "FULL_REFUND"
        ? booking.baseAmount
        : Math.max(0, Math.min(booking.baseAmount, Number(body.refundAmount ?? 0)));
    if (refundAmount > 0) {
      const parentWallet = db.getOrCreateWallet(booking.parentId);
      db.addTransaction({
        walletId: parentWallet.id,
        userId: booking.parentId,
        type: "REFUND",
        amount: refundAmount,
        status: "Completed",
        description: `Hoàn tiền theo khiếu nại #${id}`,
        referenceId: booking.id,
        balanceBefore: 0,
        balanceAfter: 0,
        createdAt: new Date().toISOString(),
      });
    }
    booking.status = "Cancelled";
    db.saveBookings();
  }

  db.reports[idx] = updated;
  db.saveReports();
  return { status: 200, data: { ok: true, dispute: updated } };
}
